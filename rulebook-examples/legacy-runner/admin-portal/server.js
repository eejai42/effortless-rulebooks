// =============================================================================
// ERB Admin Portal — Express backend
// =============================================================================
// Boots:
//   - localhost:7777 — admin portal API + static frontend host
//   - Connects to Postgres (system pg on 5432 or override via PG* env)
//   - Auto-creates per-domain document database `erb_<domain>` on first boot
//   - Auto-migrates editor DB schema from the active rulebook
//   - Enforces the write-through invariant: every mutating endpoint writes to
//     BOTH Postgres AND the rulebook JSON in the same logical transaction
// =============================================================================

import express from "express";
import cors from "cors";
import pg from "pg";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawn, exec } from "node:child_process";
import { fileURLToPath } from "node:url";
import http from "node:http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLATFORM_DIR = path.resolve(__dirname, "..");            // rulebook-examples/legacy-runner/
const REPO_ROOT = path.resolve(PLATFORM_DIR, "..", "..");       // the repo — itself an Effortless project
// `__top__` is the repo-governing rulebook (domains, flavors, glossary, findings...).
// The portal's OWN config tables (UserRoles, AppUsers, AppNavigation, AppScreens...)
// live in the legacy-runner rulebook; loadProjectRulebook() overlays them.
const TOP_RULEBOOK = path.join(REPO_ROOT, "effortless-rulebook", "effortless-rulebook.json");
const RUNNER_RULEBOOK = path.join(PLATFORM_DIR, "effortless-rulebook", "legacy-runner-rulebook.json");
const PORTAL_STATE_FILE = path.join(__dirname, ".portal-state.json");
const RULEBOOK_EXAMPLES = path.join(REPO_ROOT, "rulebook-examples");
const PYTHON_INJECTOR = path.join(PLATFORM_DIR, "execution-substrates", "python", "inject-into-python.py");

// Sentinel for "the platform rulebook itself" (effortless-platform/...). When
// the UI is editing the wrapper rulebook rather than a demo, requests carry
// `domain=__top__`. The matching DB is `erb_admin_portal` — the same place
// the portal's own bookkeeping tables live.
const TOP_DOMAIN = "__top__";
const ADMIN_DB_NAME = "erb_admin_portal";
// The repo-governing rulebook compiles to its own document database (the
// erb_<domain> formula applied to the repo root project). `__top__` reads go
// there; the portal's own bookkeeping stays in ADMIN_DB_NAME.
const TOP_DB_NAME = "erb_effortless_rulebooks";

const PORT = parseInt(process.env.PORTAL_PORT || "7777", 10);
const PROXY_URL = process.env.PROXY_URL || "http://localhost:4242";

const PG_CONFIG = {
  host: process.env.PGHOST || "localhost",
  port: parseInt(process.env.PGPORT || "5432", 10),
  user: process.env.PGUSER || process.env.USER || "postgres",
  password: process.env.PGPASSWORD || "",
};

// ---------------------------------------------------------------------------
// Domain helpers
// ---------------------------------------------------------------------------
//
// Every endpoint that touches per-domain state extracts the domain from the
// request and threads it through. There is no server-side "current domain"
// scratchpad: the URL (or request body) is the only source of truth.
//
// `requireDomain(req)` reads `req.query.domain` then `req.body.domain` then
// `req.params.domain`. It throws an HTTP-400-shaped Error if none is present;
// the express error path turns that into a 400 response. Callers that *can*
// service a request without a domain (e.g. the project list) do not call this.

class DomainRequiredError extends Error {
  constructor() {
    super("missing required `domain` (pass ?domain=<slug> or include it in the JSON body)");
    this.status = 400;
  }
}

function requireDomain(req) {
  const fromQuery = req && req.query && req.query.domain;
  const fromBody  = req && req.body  && req.body.domain;
  const fromParam = req && req.params && req.params.domain;
  const raw = fromQuery || fromBody || fromParam;
  if (!raw) throw new DomainRequiredError();
  return String(raw);
}

function rulebookPathFor(domain) {
  if (domain === TOP_DOMAIN) return TOP_RULEBOOK;
  return path.join(RULEBOOK_EXAMPLES, domain, "effortless-rulebook", `${domain}-rulebook.json`);
}

function projectRootFor(domain) {
  if (domain === TOP_DOMAIN) return PLATFORM_DIR;
  return path.join(RULEBOOK_EXAMPLES, domain);
}

function domainDbName(domain) {
  if (domain === TOP_DOMAIN) return TOP_DB_NAME;
  return "erb_" + String(domain).replace(/[^a-z0-9_]/gi, "_").toLowerCase();
}

// Returns { <slug>: { DisplayName, Tagline, LogoPath } } from the meta-rulebook's
// RulebookFlavors table. Read fresh on every call so portal restarts after
// reconcileFlavors() see the new rows.
function flavorsBySlug() {
  try {
    const proj = loadProjectRulebook();
    const rows = proj?.RulebookFlavors?.data || [];
    const out = {};
    for (const r of rows) {
      if (r.ProjectSlug) out[r.ProjectSlug] = r;
    }
    return out;
  } catch {
    return {};
  }
}

function logoUrlForSlug(slug) {
  const png = path.join(RULEBOOK_EXAMPLES, slug, "effortless-logo.png");
  return fs.existsSync(png) ? `/api/projects/${encodeURIComponent(slug)}/logo.png` : null;
}

// ---------------------------------------------------------------------------
// __meta__ table helpers — the rulebook's project-level metadata (tagline,
// motif, description_rich, use_cases, signature_rows, substrates, etc.) is
// stored as a typed-row table:
//   { MetaKey, Name, ValueType: 'string'|'object'|'array', StringValue, JsonValue }
// These helpers project it back to / from a flat {key: value} dictionary so
// the rest of the portal code can keep treating it as an object.
// ---------------------------------------------------------------------------
const META_TABLE_NAME = "__meta__";
const META_SCHEMA = [
  { name: "MetaKey",     datatype: "string", type: "raw",        nullable: false,
    Description: "The metadata key (e.g. 'tagline', 'motif_palette', 'substrates'). Unique within the table." },
  { name: "Name",        datatype: "string", type: "calculated", nullable: false, formula: "={{MetaKey}}",
    Description: "Identifier for this metadata entry. Mirrors MetaKey." },
  { name: "ValueType",   datatype: "string", type: "raw",        nullable: false,
    Description: "How to interpret the value columns: 'string' (use StringValue), 'object' or 'array' (parse JsonValue)." },
  { name: "StringValue", datatype: "string", type: "raw",        nullable: true,
    Description: "Plain string value. Populated when ValueType == 'string'; null otherwise." },
  { name: "JsonValue",   datatype: "string", type: "raw",        nullable: true,
    Description: "JSON-encoded value. Populated when ValueType == 'object' or 'array'; null when 'string'." },
];

function metaAsObject(rb) {
  const tbl = rb?.[META_TABLE_NAME];
  if (!tbl || !Array.isArray(tbl.data)) return {};
  const out = {};
  for (const row of tbl.data) {
    if (!row || typeof row !== "object") continue;
    const key = row.MetaKey;
    if (typeof key !== "string" || !key) continue;
    if (row.ValueType === "string") {
      out[key] = row.StringValue ?? "";
    } else if (row.ValueType === "object" || row.ValueType === "array") {
      if (typeof row.JsonValue === "string" && row.JsonValue.length) {
        try { out[key] = JSON.parse(row.JsonValue); }
        catch (e) { console.warn(`[metaAsObject] bad JsonValue for ${key}: ${e.message}`); }
      }
    }
  }
  return out;
}

function valueToMetaRow(key, value) {
  const row = { MetaKey: key, Name: key, ValueType: "string", StringValue: null, JsonValue: null };
  if (typeof value === "string") {
    row.ValueType = "string"; row.StringValue = value; row.JsonValue = null;
  } else if (Array.isArray(value)) {
    row.ValueType = "array"; row.StringValue = null; row.JsonValue = JSON.stringify(value);
  } else if (value && typeof value === "object") {
    row.ValueType = "object"; row.StringValue = null; row.JsonValue = JSON.stringify(value);
  } else {
    row.ValueType = "string"; row.StringValue = value == null ? "" : String(value); row.JsonValue = null;
  }
  return row;
}

function setMetaValue(rb, key, value) {
  let tbl = rb[META_TABLE_NAME];
  if (!tbl || !Array.isArray(tbl.data)) {
    tbl = {
      Description: "Project-level metadata that travels with the rulebook. One row per metadata key.",
      important: false,
      schema: META_SCHEMA,
      data: [],
    };
    rb[META_TABLE_NAME] = tbl;
  }
  const newRow = valueToMetaRow(key, value);
  const i = tbl.data.findIndex((r) => r && r.MetaKey === key);
  if (i >= 0) tbl.data[i] = newRow; else tbl.data.push(newRow);
}

// Resolve __meta__.signature_rows ([{entity, ids[]}, …]) against the rulebook's
// own data arrays, projecting only each entity's `important_fields` so the
// payload stays cheap. Returns [{entity, fields: [...], rows: [...]}, …].
// Silent fallback would be a sin here — if the entity or ID isn't found, we
// skip that row (the rulebook author asked for something that doesn't exist;
// the picker just won't display it). We do not invent rows.
function resolveSignatureRows(rb) {
  const sig = metaAsObject(rb).signature_rows;
  if (!Array.isArray(sig)) return [];
  const out = [];
  for (const block of sig) {
    if (!block || typeof block !== "object") continue;
    const entity = block.entity;
    const ids = Array.isArray(block.ids) ? block.ids : [];
    const ent = entity && rb[entity];
    if (!ent || !Array.isArray(ent.data)) continue;
    const fields = Array.isArray(ent.important_fields) && ent.important_fields.length
      ? ent.important_fields
      : (ent.schema || []).slice(0, 3).map((f) => f.name);
    const pkField = (ent.schema || []).find((f) => /Id$/i.test(f.name))?.name;
    const rows = [];
    for (const id of ids) {
      const row = ent.data.find((r) => pkField && r[pkField] === id);
      if (!row) continue;
      const projected = {};
      for (const f of fields) projected[f] = row[f] ?? null;
      if (pkField) projected[pkField] = row[pkField];
      rows.push(projected);
    }
    out.push({ entity, fields, rows });
  }
  return out;
}

function listProjects() {
  const flavors = flavorsBySlug();
  const out = [{
    id: "__top__",
    name: "ERB Orchestration (top-level)",
    displayName: "ERB Orchestration (top-level)",
    tagline: "The repo's top-level rulebook — describes ERB itself.",
    motif: "default",
    motifPalette: null,
    descriptionRich: null,
    journalSeed: null,
    signatureRows: [],
    logoUrl: null,
    rulebookPath: TOP_RULEBOOK,
    projectRoot: REPO_ROOT,
    description: "The repo's top-level rulebook — describes ERB itself.",
    lastModified: fs.existsSync(REPO_ROOT) ? fs.statSync(REPO_ROOT).mtimeMs : 0,
  }];
  if (fs.existsSync(RULEBOOK_EXAMPLES)) {
    for (const d of fs.readdirSync(RULEBOOK_EXAMPLES)) {
      const dirPath = path.join(RULEBOOK_EXAMPLES, d);
      if (!fs.statSync(dirPath).isDirectory()) continue;
      const candidate = path.join(dirPath, "effortless-rulebook", `${d}-rulebook.json`);
      if (!fs.existsSync(candidate)) continue;
      const flav = flavors[d];
      // Peek at the demo's own __meta__ table for the experience fields
      // (tagline, motif, signature_rows). Falls through to the
      // RulebookFlavors row when the metadata hasn't been authored yet —
      // that's a default, not a fallback (see CLAUDE.md: the SSoT-derived
      // default IS the right answer; we only override when the rulebook
      // explicitly takes a position via its __meta__ table).
      let demoRb = null;
      try { demoRb = JSON.parse(fs.readFileSync(candidate, "utf8")); }
      catch (e) { console.warn(`[listProjects] could not parse ${candidate}: ${e.message}`); }
      const meta = metaAsObject(demoRb);
      const displayName = flav?.DisplayName || d;
      const tagline = meta.tagline || flav?.Tagline || flav?.LearningFocus || "";
      out.push({
        id: d,
        name: displayName,
        displayName,
        tagline,
        motif: meta.motif || "default",
        motifPalette: meta.motif_palette || null,
        descriptionRich: meta.description_rich || null,
        journalSeed: meta.journal_seed || null,
        signatureRows: resolveSignatureRows(demoRb),
        logoUrl: logoUrlForSlug(d),
        rulebookPath: candidate,
        projectRoot: dirPath,
        description: tagline,
        // Folder mtime (ms-since-epoch) — bumped whenever a domain is opened,
        // built, or otherwise touched. The picker uses this for "recently
        // opened" sort + "Xh ago" annotations.
        lastModified: fs.statSync(dirPath).mtimeMs,
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Rulebook IO — TWO categorically different reads:
//   - loadProjectRulebook()          : the wrapper/orchestration tool itself.
//     Contains portal config: UserRoles, AppUsers, AppPermissions,
//     AppNavigation, AppScreens, AppAPIs, AddToolCatalog, BuildPipeline,
//     AdminPortalRuntime. PATH IS FIXED: ./effortless-rulebook/effortless-rulebook.json
//   - loadRulebookForDomain(domain)  : that specific demo domain's rulebook.
//     Contains the domain's business tables (Customers, Episodes, etc.).
//     PATH IS DERIVED: ./rulebook-examples/<domain>/effortless-rulebook/<domain>-rulebook.json
//     When `domain === TOP_DOMAIN`, it delegates to loadProjectRulebook().
//
// THESE ARE NEVER MIXED. The project is the PARENT, the demo is a CHILD.
// See CLAUDE.md "THE PROJECT RULEBOOK ≠ A DEMO RULEBOOK".
// ---------------------------------------------------------------------------
function isTable(v) {
  return v && typeof v === "object" && Array.isArray(v.schema);
}

function loadProjectRulebook() {
  // The repo-governing rulebook, with the portal's own config tables overlaid
  // from the legacy-runner rulebook. Tables present in both (ProjectMetadata,
  // __meta__) resolve to the repo's.
  const top = JSON.parse(fs.readFileSync(TOP_RULEBOOK, "utf8"));
  const runner = JSON.parse(fs.readFileSync(RUNNER_RULEBOOK, "utf8"));
  for (const [k, v] of Object.entries(runner)) {
    if (isTable(v) && !(k in top)) top[k] = v;
  }
  return top;
}

function assertNonEmptyRulebook(rb, p) {
  // The rulebook is sacred (see CLAUDE.md). Refuse to write a value that
  // could only be the result of a bug — null/undefined, a non-object, or an
  // object with zero keys. Loud failure here is the whole point: it stops the
  // silent-fallback pattern where a lost request body gets persisted as `{}`
  // and the user sees a green "Saved" toast.
  if (rb === null || rb === undefined || typeof rb !== "object" || Array.isArray(rb)) {
    throw new Error(`refusing to save non-object rulebook to ${p} (got ${typeof rb})`);
  }
  if (Object.keys(rb).length === 0) {
    throw new Error(`refusing to save empty rulebook to ${p} — almost certainly a lost request body or upstream bug`);
  }
}

function saveRulebook(rb, p) {
  if (!p) throw new Error("saveRulebook requires an explicit path");
  assertNonEmptyRulebook(rb, p);
  fs.writeFileSync(p, JSON.stringify(rb, null, 2) + "\n");
}

function saveRulebookForDomain(rb, domain) {
  saveRulebook(rb, rulebookPathFor(domain));
}

// Pre-flight validator for a *proposed* rulebook. Writes the proposed JSON to
// a temp file and shells out to the Python transpiler (inject-into-python.py)
// — the strictest of the local substrates and the one that catches formula
// syntax errors, missing fields, broken FK targets, etc. If it exits nonzero,
// throws an Error whose message is the captured transpiler output, trimmed
// to the actionable part.
//
// Why Python and not Postgres: the Postgres substrate emits raw formula text
// as SQL without parsing it, so a syntactically-broken formula sails through.
// Python is the gate that actually validates calculated-field syntax.
//
// Called from writeThrough() BEFORE the disk write, so a failed validation
// means the rulebook on disk is unchanged — there's nothing to revert.
async function validateProposedRulebook(rb) {
  const tmpRoot = await fsp.mkdtemp(path.join(os.tmpdir(), "erb-validate-"));
  const inputFile = path.join(tmpRoot, "proposed-rulebook.json");
  const outputDir = path.join(tmpRoot, "out");
  await fsp.mkdir(outputDir, { recursive: true });
  await fsp.writeFile(inputFile, JSON.stringify(rb, null, 2) + "\n", "utf8");

  const result = await new Promise((resolve) => {
    const proc = spawn("python3", [PYTHON_INJECTOR], {
      env: {
        ...process.env,
        ERB_RULEBOOK_PATH: inputFile,
        ERB_OUTPUT_DIR: outputDir,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (b) => { stdout += b.toString(); });
    proc.stderr.on("data", (b) => { stderr += b.toString(); });
    proc.on("error", (e) => resolve({ exit: -1, stdout, stderr: stderr + `\nspawn error: ${e.message}` }));
    proc.on("close", (code) => resolve({ exit: code, stdout, stderr }));
  });

  // Cleanup temp dir regardless. Best-effort — don't mask the validation
  // verdict with cleanup errors.
  fsp.rm(tmpRoot, { recursive: true, force: true }).catch(() => {});

  if (result.exit === 0) return { ok: true };

  // Surface the actionable part of the output. The Python transpiler prints
  // the parse error followed by a traceback. We keep the whole thing but
  // hoist the ValueError line to the top so the toast shows it first.
  const all = (result.stdout || "") + (result.stderr || "");
  const lines = all.split("\n");
  const headline = lines.find((l) => /ValueError:|SyntaxError:|Error:/.test(l)) || `Python transpiler exited ${result.exit}`;
  const err = new Error(`rulebook validation failed: ${headline.trim()}`);
  err.transpilerOutput = all;
  err.exitCode = result.exit;
  throw err;
}

function saveProjectRulebook(rb) {
  // Inverse of loadProjectRulebook(): tables that came from the legacy-runner
  // rulebook go back there; everything else is the repo-governing rulebook.
  const topOnDisk = JSON.parse(fs.readFileSync(TOP_RULEBOOK, "utf8"));
  const runner = JSON.parse(fs.readFileSync(RUNNER_RULEBOOK, "utf8"));
  const top = {};
  for (const [k, v] of Object.entries(rb)) {
    if (isTable(v) && (k in runner) && !(k in topOnDisk)) runner[k] = v;
    else top[k] = v;
  }
  assertNonEmptyRulebook(top, TOP_RULEBOOK);
  fs.writeFileSync(TOP_RULEBOOK, JSON.stringify(top, null, 2) + "\n");
  fs.writeFileSync(RUNNER_RULEBOOK, JSON.stringify(runner, null, 2) + "\n");
}

// ---------------------------------------------------------------------------
// Portal state (per-machine, not committed)
// ---------------------------------------------------------------------------
function loadPortalState() {
  try {
    return JSON.parse(fs.readFileSync(PORTAL_STATE_FILE, "utf8"));
  } catch {
    return { currentUserId: null };
  }
}

function savePortalState(s) {
  fs.writeFileSync(PORTAL_STATE_FILE, JSON.stringify(s, null, 2));
}

// ---------------------------------------------------------------------------
// RulebookFlavors reconciliation
//
// The project rulebook carries a `RulebookFlavors` table — one row per demo
// under rulebook-examples/. The UI reads it directly. When new demos get added
// to the filesystem, that table goes stale.
//
// On boot we scan rulebook-examples/, count entities/calc/agg/lookup from each
// demo's rulebook, then:
//   - add rows for demos that are on disk but missing from the table
//   - refresh the COUNT fields on existing rows (so numbers stay live)
//   - leave hand-authored fields (Flavor, Complexity, LearningFocus,
//     GoodAnswerKeyFor, DisplayName) alone once a row exists
//
// Default Flavor/Complexity heuristics fire only when adding a NEW row — so
// the first time a demo shows up it gets a reasonable guess, and after that
// the table is hand-tunable without the reconciler clobbering it.
// ---------------------------------------------------------------------------
function countFieldTypes(rulebook) {
  let entities = 0, calc = 0, agg = 0, lookup = 0;
  for (const [name, value] of Object.entries(rulebook)) {
    if (name.startsWith("$") || name.startsWith("_")) continue;
    if (name === "Name" || name === "Description") continue;
    if (!value || typeof value !== "object" || !Array.isArray(value.schema)) continue;
    entities += 1;
    for (const f of value.schema) {
      if (f.type === "calculated") calc += 1;
      else if (f.type === "aggregation") agg += 1;
      else if (f.type === "lookup") lookup += 1;
    }
  }
  return { entities, calc, agg, lookup };
}

function classifyFlavor({ entities, calc, agg }) {
  if (agg >= 3) return "aggregation-heavy";
  if (calc >= 6 && agg < 3) return "computation-heavy";
  if (entities <= 3 && calc <= 2) return "tutorial-ladder";
  return "crud-template";
}

function classifyComplexity(entities) {
  if (entities <= 3) return "minimal";
  if (entities <= 6) return "basic";
  return "advanced";
}

function scanDemoRulebooks() {
  // Returns array of { slug, rulebookPath, entities, calc, agg, lookup }.
  // Only includes demos that actually have a <slug>-rulebook.json file.
  const out = [];
  if (!fs.existsSync(RULEBOOK_EXAMPLES)) return out;
  for (const slug of fs.readdirSync(RULEBOOK_EXAMPLES).sort()) {
    const dir = path.join(RULEBOOK_EXAMPLES, slug);
    if (!fs.statSync(dir).isDirectory()) continue;
    const rbPath = path.join(dir, "effortless-rulebook", `${slug}-rulebook.json`);
    if (!fs.existsSync(rbPath)) continue;
    let rb;
    try {
      rb = JSON.parse(fs.readFileSync(rbPath, "utf8"));
    } catch (e) {
      console.warn(`[flavors] skipping ${slug}: rulebook unparseable (${e.message})`);
      continue;
    }
    const counts = countFieldTypes(rb);
    if (counts.entities === 0) continue;
    out.push({ slug, rulebookPath: rbPath, ...counts });
  }
  return out;
}

function nextFlavorId(existing) {
  let max = 0;
  for (const r of existing) {
    const m = /^flav-(\d+)$/.exec(r.FlavorId || "");
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return (n) => `flav-${String(max + n).padStart(3, "0")}`;
}

function reconcileFlavors() {
  // Returns { added: [...], updated: [...], unchanged: number }.
  const project = loadProjectRulebook();
  if (!project.RulebookFlavors || !Array.isArray(project.RulebookFlavors.data)) {
    console.warn("[flavors] RulebookFlavors table missing from project rulebook — skipping reconcile");
    return { added: [], updated: [], unchanged: 0 };
  }
  const rows = project.RulebookFlavors.data;
  const onDisk = scanDemoRulebooks();
  const bySlug = new Map(rows.map((r) => [r.ProjectSlug, r]));
  const minted = nextFlavorId(rows);
  const added = [];
  const updated = [];
  let unchanged = 0;
  let newIdx = 1;

  for (const d of onDisk) {
    const existing = bySlug.get(d.slug);
    if (!existing) {
      const flavor = classifyFlavor(d);
      const complexity = classifyComplexity(d.entities);
      const row = {
        FlavorId:         minted(newIdx++),
        ProjectSlug:      d.slug,
        DisplayName:      d.slug,
        Flavor:           flavor,
        Complexity:       complexity,
        EntityCount:      d.entities,
        CalculatedCount:  d.calc,
        AggregationCount: d.agg,
        LookupCount:      d.lookup,
        LearningFocus:    `Auto-discovered demo. Replace this stub with a one-line description of what ${d.slug} is designed to teach.`,
        GoodAnswerKeyFor: null,
      };
      rows.push(row);
      added.push(row);
    } else {
      const drift =
        existing.EntityCount      !== d.entities ||
        existing.CalculatedCount  !== d.calc ||
        existing.AggregationCount !== d.agg ||
        existing.LookupCount      !== d.lookup;
      if (drift) {
        existing.EntityCount      = d.entities;
        existing.CalculatedCount  = d.calc;
        existing.AggregationCount = d.agg;
        existing.LookupCount      = d.lookup;
        updated.push(existing);
      } else {
        unchanged += 1;
      }
    }
  }

  if (added.length || updated.length) {
    saveProjectRulebook(project);
  }
  return { added, updated, unchanged };
}

async function reconcileFlavorsOnBoot() {
  let result;
  try {
    result = reconcileFlavors();
  } catch (e) {
    console.error(`[flavors] reconcile failed: ${e.message}`);
    return;
  }
  const { added, updated, unchanged } = result;
  if (!added.length && !updated.length) {
    console.log(`[flavors] up to date (${unchanged} demos)`);
    return;
  }
  for (const r of added) {
    console.log(`[flavors] + added ${r.FlavorId}: ${r.ProjectSlug} (${r.Flavor}, ${r.Complexity})`);
  }
  for (const r of updated) {
    console.log(`[flavors] ~ refreshed counts: ${r.ProjectSlug} (${r.EntityCount}e/${r.CalculatedCount}c/${r.AggregationCount}a/${r.LookupCount}l)`);
  }

}

// ---------------------------------------------------------------------------
// Editor Postgres database (per-project)
// ---------------------------------------------------------------------------
async function ensureDatabase(dbName) {
  // Connect to default db to issue CREATE DATABASE if needed.
  const root = new pg.Client({ ...PG_CONFIG, database: "postgres" });
  await root.connect();
  try {
    const exists = await root.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
    if (exists.rowCount === 0) {
      console.log(`[portal] creating DB: ${dbName}`);
      await root.query(`CREATE DATABASE "${dbName}"`);
    }
  } finally {
    await root.end();
  }
  return dbName;
}

// Tables that belong to the admin portal itself (NOT to any single domain).
// These live in `erb_admin_portal` and ONLY there. Putting any of them in a
// per-domain DB is the category-error documented in CLAUDE.md.
async function bootstrapAdminSchema(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS portal_app_users (
      user_id      TEXT PRIMARY KEY,
      email        TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      role_id      TEXT NOT NULL,
      is_default   BOOLEAN DEFAULT FALSE,
      notes        TEXT
    );
    CREATE TABLE IF NOT EXISTS portal_audit_log (
      id BIGSERIAL PRIMARY KEY,
      ts TIMESTAMPTZ DEFAULT now(),
      user_id TEXT,
      action  TEXT NOT NULL,
      target  TEXT,
      payload JSONB
    );
    CREATE TABLE IF NOT EXISTS portal_user_domain_state (
      user_id TEXT NOT NULL,
      domain  TEXT NOT NULL,
      last_route TEXT,
      last_visited_at TIMESTAMPTZ DEFAULT now(),
      last_seen_rulebook_revision TEXT,
      PRIMARY KEY (user_id, domain)
    );
  `);

  // Seed portal_app_users from the platform rulebook's AppUsers table.
  // The rulebook is the SSoT; this is a runtime mirror for fast lookups.
  const project = loadProjectRulebook();
  if (project.AppUsers && Array.isArray(project.AppUsers.data)) {
    await client.query("BEGIN");
    try {
      for (const u of project.AppUsers.data) {
        await client.query(
          `INSERT INTO portal_app_users (user_id, email, display_name, role_id, is_default, notes)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (user_id) DO UPDATE
             SET email = EXCLUDED.email,
                 display_name = EXCLUDED.display_name,
                 role_id = EXCLUDED.role_id,
                 is_default = EXCLUDED.is_default,
                 notes = EXCLUDED.notes`,
          [u.UserId, u.Email, u.DisplayName, u.RoleId, u.IsDefault || false, u.Notes || null]
        );
      }
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    }
  }
}

// Per-domain editor mirror: one generic "rulebook entity" table per domain
// DB. Real domain schema (vw_*, customers, etc.) lives in the generated
// postgres substrate; the portal only mirrors what it edits.
async function bootstrapDomainSchema(_client, _rulebook) {
  // Domain schema bootstrapping is a no-op: the business tables and vw_* views
  // are generated by the effortless build transpiler and live in the domain DB.
  // The portal reads data from vw_<entity> and schema from the JSON rulebook —
  // no portal-owned mirror tables are needed here.
  void _rulebook;
}

// Pool registry: one pool per DB. The admin pool is created eagerly on first
// access (it holds portal_app_users / portal_audit_log / portal_user_domain_state).
// Each domain pool is created lazily the first time a request for that domain
// arrives, and the domain's editor-mirror table is bootstrapped at that point.
let adminPool = null;
async function getAdminPool() {
  if (adminPool) return adminPool;
  await ensureDatabase(ADMIN_DB_NAME);
  adminPool = new pg.Pool({ ...PG_CONFIG, database: ADMIN_DB_NAME });
  const c = await adminPool.connect();
  try {
    await bootstrapAdminSchema(c);
  } finally {
    c.release();
  }
  return adminPool;
}

const domainPools = new Map();
async function getDomainPool(domain) {
  if (!domain) throw new Error("getDomainPool requires a domain");
  // The platform rulebook (`__top__`) is editable through the same machinery
  // as a demo, but its DB is `erb_admin_portal` — the place its generated
  // tables already live. Route both code paths through the admin pool.
  if (domain === TOP_DOMAIN) return getAdminPool();
  if (domainPools.has(domain)) return domainPools.get(domain);
  const dbName = domainDbName(domain);
  await ensureDatabase(dbName);
  const p = new pg.Pool({ ...PG_CONFIG, database: dbName });
  domainPools.set(domain, p);
  const c = await p.connect();
  try {
    await bootstrapDomainSchema(c, loadRulebookForDomain(domain));
  } finally {
    c.release();
  }
  return p;
}

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------
function getCurrentUser() {
  // Users, roles, permissions are PORTAL config — they live in the PROJECT
  // rulebook, never in a demo rulebook. See CLAUDE.md.
  const st = loadPortalState();
  const project = loadProjectRulebook();
  const users = (project.AppUsers && project.AppUsers.data) || [];
  const roles = (project.UserRoles && project.UserRoles.data) || [];
  let u = users.find((x) => x.UserId === st.currentUserId);
  if (!u) u = users.find((x) => x.IsDefault) || users[0];
  if (!u) return null;
  const role = roles.find((r) => r.RoleId === u.RoleId) || null;
  const perms = ((project.AppPermissions && project.AppPermissions.data) || []).filter(
    (p) => p.RoleId === u.RoleId
  );
  return { ...u, role, permissions: perms };
}

// Role/capability gates intentionally disabled here. UI hides items the
// current user shouldn't see, but the server does not refuse any request
// based on role. Re-introduce gates here once the UX is stable.
function attachUser(req, _res, next) {
  req.currentUser = getCurrentUser();
  next();
}
const requireDeveloper   = attachUser;
const requireEditor      = attachUser;
const requireBuilder     = attachUser;
const requireUserManager = attachUser;

// ---------------------------------------------------------------------------
// Write-through helper
// ---------------------------------------------------------------------------
// Best-effort audit log insert against the admin DB. Audit rows are
// bookkeeping; never block a user action on them.
async function recordAudit({ userId, action, target, payload }) {
  try {
    const p = await getAdminPool();
    await p.query(
      `INSERT INTO portal_audit_log (user_id, action, target, payload) VALUES ($1, $2, $3, $4)`,
      [userId || null, action, target || null, payload ? JSON.stringify(payload) : null]
    );
  } catch (e) {
    console.warn(`[audit] insert failed (${action}): ${e.message}`);
  }
}

async function writeThrough({ domain, pgWrite, rulebookMutate }) {
  if (!domain) throw new Error("writeThrough requires an explicit domain");
  // pgWrite: async (client) => void  — runs inside a TXN
  // rulebookMutate: (rulebookJson) => rulebookJson — returns new rulebook
  const p = await getDomainPool(domain);
  const client = await p.connect();
  try {
    await client.query("BEGIN");
    await pgWrite(client);

    const rb = loadRulebookForDomain(domain);
    const newRb = rulebookMutate(rb);
    // Pre-flight: validate the *proposed* rulebook against the Python
    // transpiler BEFORE writing to disk. If validation fails, throw — the
    // pg TXN rolls back below and the on-disk rulebook is unchanged. There
    // is nothing to revert; the bad edit simply never persisted.
    await validateProposedRulebook(newRb);
    // Filesystem next (committed = on disk). If this throws, we ROLLBACK pg.
    saveRulebookForDomain(newRb, domain);

    await client.query("COMMIT");
    return newRb;
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// ssotme-proxy client
// ---------------------------------------------------------------------------
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body || "{}") });
        } catch (e) {
          resolve({ status: res.statusCode, body: { raw: body } });
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(2000, () => req.destroy(new Error("proxy timeout")));
  });
}

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.text({ type: "text/plain", limit: "10mb" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.get("/api/me", (req, res) => {
  const u = getCurrentUser();
  res.json(u || { error: "no user" });
});

app.post("/api/me/switch", (req, res) => {
  const { userId } = req.body || {};
  const st = loadPortalState();
  st.currentUserId = userId;
  savePortalState(st);
  res.json(getCurrentUser());
});

// --- projects ---
app.get("/api/projects", (req, res) => {
  res.json({
    projects: listProjects(),
  });
});

// Serve a demo's effortless-logo.png. 404 if the demo has no logo file.
// Path is under /api/ so it doesn't collide with the SPA's static asset prefix.
app.get("/api/projects/:id/logo.png", (req, res) => {
  const id = req.params.id;
  // Validate against the live project list — never serve arbitrary file paths.
  if (!listProjects().find((p) => p.id === id)) {
    return res.status(404).end();
  }
  const png = path.join(RULEBOOK_EXAMPLES, id, "effortless-logo.png");
  if (!fs.existsSync(png)) return res.status(404).end();
  res.setHeader("Cache-Control", "public, max-age=300");
  res.setHeader("Content-Type", "image/png");
  fs.createReadStream(png).pipe(res);
});

// --- per-project quick actions (Excel export, open folder, open in VS Code) ---
//
// All three resolve the project via listProjects() — never via a client-
// supplied path. The Excel export shells out to the same `effortless
// rulebook-to-xlsx` transpiler used by `effortless build`, so the workbook
// reflects the live rulebook JSON without depending on the per-domain
// Postgres pool. open-folder and open-vscode are developer convenience
// actions that run on the server host (the dev machine the portal is
// running on).

const XLSX_INJECTOR = path.join(PLATFORM_DIR, "execution-substrates", "xlsx", "inject-into-xlsx.py");

app.get("/api/projects/:id/export.xlsx", async (req, res) => {
  const id = req.params.id;
  const proj = listProjects().find((p) => p.id === id);
  if (!proj) return res.status(404).json({ error: "unknown project" });

  // Run the same injector script the ssotme-proxy uses (matches the
  // effortless-excel-export skill). It writes `rulebook.xlsx` into its cwd
  // and reads the rulebook from $ERB_RULEBOOK_PATH. Using a per-request
  // tmpdir means concurrent exports for different domains don't collide.
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), "erb-xlsx-"));
  const producedPath = path.join(tmpDir, "rulebook.xlsx");
  const downloadName = `${id}-rulebook.xlsx`;
  try {
    await new Promise((resolve, reject) => {
      const child = spawn("python3", [XLSX_INJECTOR], {
        cwd: tmpDir,
        env: { ...process.env, ERB_RULEBOOK_PATH: proj.rulebookPath, ERB_OUTPUT_DIR: tmpDir },
      });
      let stderr = "";
      child.stderr.on("data", (c) => { stderr += c; });
      child.on("error", reject);
      child.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`inject-into-xlsx exited ${code}\n${stderr.slice(-2000)}`));
      });
    });
    if (!fs.existsSync(producedPath)) {
      throw new Error("inject-into-xlsx finished but produced no rulebook.xlsx");
    }
    res.download(producedPath, downloadName, () => {
      fsp.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    });
  } catch (e) {
    await fsp.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    res.status(500).json({ error: String(e.message || e) });
  }
});

function openerForPlatform() {
  if (process.platform === "darwin") return { cmd: "open", args: [] };
  if (process.platform === "win32") return { cmd: "explorer", args: [] };
  return { cmd: "xdg-open", args: [] };
}

// "Open in Finder/Explorer" and "code ." only make sense when the user is
// physically at the machine running the server — otherwise the windows pop
// on the server-side desktop where nobody can see them. Gate those two
// endpoints to localhost requests so a future remote deployment doesn't
// silently launch GUI apps for strangers.
function isLocalhostRequest(req) {
  const ip = req.ip || req.connection?.remoteAddress || "";
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "::ffff:127.0.0.1" ||
    ip === "localhost"
  );
}
function requireLocalhost(req, res, next) {
  if (!isLocalhostRequest(req)) {
    return res.status(403).json({
      error: "This action only runs when the portal is reached from localhost.",
    });
  }
  next();
}

app.post("/api/projects/:id/open-folder", requireLocalhost, (req, res) => {
  const id = req.params.id;
  const proj = listProjects().find((p) => p.id === id);
  if (!proj) return res.status(404).json({ error: "unknown project" });
  const { cmd, args } = openerForPlatform();
  // spawn (not exec) so we can hand the path as a real arg rather than
  // shell-quoting it. detached + unref so the launcher can outlive the
  // request — the user expects the window to stay open after the response.
  try {
    const child = spawn(cmd, [...args, proj.projectRoot], {
      detached: true,
      stdio: "ignore",
    });
    child.on("error", (e) => console.warn(`[open-folder] ${cmd} error: ${e.message}`));
    child.unref();
    res.json({ ok: true, opened: proj.projectRoot });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.post("/api/projects/:id/open-vscode", requireLocalhost, (req, res) => {
  const id = req.params.id;
  const proj = listProjects().find((p) => p.id === id);
  if (!proj) return res.status(404).json({ error: "unknown project" });
  try {
    const child = spawn("code", [proj.projectRoot], {
      detached: true,
      stdio: "ignore",
    });
    child.on("error", (e) => console.warn(`[open-vscode] code error: ${e.message}`));
    child.unref();
    res.json({ ok: true, opened: proj.projectRoot });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// --- per-user, per-domain state (Item 6: state preservation) ---
//
// Computes a stable revision marker for a rulebook by hashing its on-disk
// content. SHA-256 of the bytes — same content = same revision, byte-for-byte.
// Used to drive the "new since you were here" picker chip and the
// reception desk's "Welcome back" diff.
function rulebookRevisionForDomain(domainId) {
  let rbPath;
  if (domainId === "__top__") rbPath = TOP_RULEBOOK;
  else rbPath = path.join(RULEBOOK_EXAMPLES, domainId, "effortless-rulebook", `${domainId}-rulebook.json`);
  if (!fs.existsSync(rbPath)) return null;
  const buf = fs.readFileSync(rbPath);
  return crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16);
}

// GET /api/portal/me/domain-state
// Returns the current user's per-domain memory PLUS each domain's current
// rulebook revision, so the client can compute `changed-since-last-visit`
// locally without an extra fetch per domain.
app.get("/api/portal/me/domain-state", async (req, res) => {
  const u = getCurrentUser();
  if (!u || !u.UserId) return res.json({ states: [], currentRevisions: {} });
  try {
    const p = await getAdminPool();
    const r = await p.query(
      `SELECT domain, last_route, last_visited_at, last_seen_rulebook_revision
         FROM portal_user_domain_state WHERE user_id = $1
        ORDER BY last_visited_at DESC`,
      [u.UserId]
    );
    const currentRevisions = {};
    for (const proj of listProjects()) {
      currentRevisions[proj.id] = rulebookRevisionForDomain(proj.id);
    }
    res.json({ states: r.rows, currentRevisions });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// PUT /api/portal/me/domain-state
// Body: { domain, last_route }
// Upserts the user's "I was here" memory. Also stamps
// last_seen_rulebook_revision to the rulebook's current content hash,
// so the next visit can compute the diff.
app.put("/api/portal/me/domain-state", async (req, res) => {
  const u = getCurrentUser();
  if (!u || !u.UserId) return res.status(401).json({ error: "no user" });
  const { domain, last_route } = req.body || {};
  if (!domain || typeof domain !== "string") return res.status(400).json({ error: "domain required" });
  const rev = rulebookRevisionForDomain(domain);
  // Bump the domain folder's mtime so "recently opened" sort in the picker
  // floats this domain to the top. Skipped for "__top__" (no folder of its
  // own) and silently no-op'd if the folder doesn't exist.
  if (domain !== "__top__") {
    const dirPath = path.join(RULEBOOK_EXAMPLES, domain);
    try {
      if (fs.existsSync(dirPath)) {
        const now = new Date();
        fs.utimesSync(dirPath, now, now);
      }
    } catch (e) {
      console.warn(`[domain-state] could not touch ${dirPath}: ${e.message}`);
    }
  }
  try {
    const p = await getAdminPool();
    await p.query(
      `INSERT INTO portal_user_domain_state (user_id, domain, last_route, last_visited_at, last_seen_rulebook_revision)
       VALUES ($1, $2, $3, now(), $4)
       ON CONFLICT (user_id, domain) DO UPDATE
         SET last_route = EXCLUDED.last_route,
             last_visited_at = now(),
             last_seen_rulebook_revision = EXCLUDED.last_seen_rulebook_revision`,
      [u.UserId, domain, last_route || null, rev]
    );
    res.json({ ok: true, revision: rev });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// --- rulebook (read) ---
// Demo rulebook (domain tables: Customers, Episodes, etc.). Domain is required.
app.get("/api/rulebook", (req, res) => {
  try {
    const domain = requireDomain(req);
    res.json(loadRulebookForDomain(domain));
  } catch (e) {
    res.status(e.status || 500).json({ error: String(e.message || e) });
  }
});

// --- rulebook history (Item 7: time-travel scrubber) ---
//
// Git is the substitute for bitemporal history in v1. Each commit that
// touched the rulebook JSON becomes a "tick" on the scrubber. The full
// bitemporal vision (drag arbitrary timestamps, see live-fired rules in
// the past) requires a per-cell history that doesn't exist yet — this is
// the honest shortcut: real history granular to commit boundaries.
//
// Endpoints only ever read the active rulebook path — never an arbitrary
// path supplied by the client. (`req.params.sha` IS supplied by the
// client; we validate it as hex before interpolating into the shell.)

function gitLogForFile(absPath) {
  return new Promise((resolve, reject) => {
    const repoRoot = REPO_ROOT;
    const rel = path.relative(repoRoot, absPath);
    exec(
      `git log --pretty=format:"%H|%ct|%an|%s" -- ${JSON.stringify(rel)}`,
      { cwd: repoRoot, maxBuffer: 4 * 1024 * 1024 },
      (err, stdout) => {
        if (err) return reject(err);
        const lines = (stdout || "").split("\n").filter(Boolean);
        const out = lines.map((line) => {
          const [sha, ct, author, ...rest] = line.split("|");
          return {
            sha,
            timestamp: Number(ct) * 1000,
            author,
            subject: rest.join("|"),
          };
        });
        resolve(out);
      }
    );
  });
}

function gitShowFileAtSha(absPath, sha) {
  return new Promise((resolve, reject) => {
    const repoRoot = REPO_ROOT;
    const rel = path.relative(repoRoot, absPath);
    // Validate sha is a hex string before interpolating.
    if (!/^[0-9a-f]{4,40}$/i.test(sha)) return reject(new Error("invalid sha"));
    exec(
      `git show ${sha}:${JSON.stringify(rel)}`,
      { cwd: repoRoot, maxBuffer: 16 * 1024 * 1024 },
      (err, stdout) => {
        if (err) return reject(err);
        resolve(stdout);
      }
    );
  });
}

app.get("/api/rulebook/history", async (req, res) => {
  try {
    const domain = requireDomain(req);
    const rbPath = rulebookPathFor(domain);
    const log = await gitLogForFile(rbPath);
    res.json({ path: path.relative(REPO_ROOT, rbPath), commits: log });
  } catch (e) {
    res.status(e.status || 500).json({ error: String(e.message || e) });
  }
});

app.get("/api/rulebook/at/:sha", async (req, res) => {
  try {
    const domain = requireDomain(req);
    const rbPath = rulebookPathFor(domain);
    const content = await gitShowFileAtSha(rbPath, req.params.sha);
    // Parse to ensure it's valid JSON at that point in history — if it
    // isn't, surface the error instead of returning a corrupt blob.
    const parsed = JSON.parse(content);
    res.json(parsed);
  } catch (e) {
    res.status(404).json({ error: String(e.message || e) });
  }
});

// Project rulebook (portal config: UserRoles, AppUsers, AppPermissions,
// AppNavigation, AppScreens, AppAPIs, AddToolCatalog, BuildPipeline,
// AdminPortalRuntime). The wrapper, not the demo.
app.get("/api/project-rulebook", (req, res) => res.json(loadProjectRulebook()));

app.get("/api/rulebook/entities", (req, res) => {
  try {
    const domain = requireDomain(req);
    const rb = loadRulebookForDomain(domain);
    const out = [];
    for (const [name, value] of Object.entries(rb)) {
      if (name.startsWith("$") || name.startsWith("_")) continue;
      if (name === "Name" || name === "Description") continue;
      if (!value || typeof value !== "object" || !Array.isArray(value.schema)) continue;
      out.push({
        name,
        description: value.Description || null,
        fieldCount: value.schema.length,
        rowCount: (value.data || []).length,
      });
    }
    res.json(out);
  } catch (e) {
    res.status(e.status || 500).json({ error: String(e.message || e) });
  }
});

app.get("/api/rulebook/entities/:name", (req, res) => {
  try {
    const domain = requireDomain(req);
    const rb = loadRulebookForDomain(domain);
    const e = rb[req.params.name];
    if (!e) return res.status(404).json({ error: "not found" });
    res.json({ name: req.params.name, ...e });
  } catch (e) {
    res.status(e.status || 500).json({ error: String(e.message || e) });
  }
});

// --- rulebook (write-through) ---
app.patch("/api/rulebook/entities/:name", requireEditor, async (req, res) => {
  const { description, schema, data } = req.body || {};
  const name = req.params.name;
  try {
    const domain = requireDomain(req);
    const newRb = await writeThrough({
      domain,
      pgWrite: async () => {},
      rulebookMutate: (rb) => {
        if (!rb[name]) throw new Error(`Entity ${name} not in rulebook`);
        if (description !== undefined) rb[name].Description = description;
        if (schema !== undefined) rb[name].schema = schema;
        if (data !== undefined) rb[name].data = data;
        return rb;
      },
    });
    await recordAudit({ userId: getCurrentUser()?.UserId, action: "entity.update", target: `${domain}/${name}`, payload: req.body });
    res.json({ ok: true, entity: newRb[name] });
  } catch (e) {
    res.status(e.status || 500).json({ error: String(e.message || e) });
  }
});

app.post("/api/rulebook/entities", requireEditor, async (req, res) => {
  const { name, description = "", schema = [], data = [] } = req.body || {};
  if (!name) return res.status(400).json({ error: "name required" });
  try {
    const domain = requireDomain(req);
    const newRb = await writeThrough({
      domain,
      pgWrite: async () => {},
      rulebookMutate: (rb) => {
        if (rb[name]) throw new Error(`Entity ${name} already exists`);
        rb[name] = { Description: description, schema, data };
        return rb;
      },
    });
    await recordAudit({ userId: getCurrentUser()?.UserId, action: "entity.create", target: `${domain}/${name}`, payload: req.body });
    res.json({ ok: true, entity: newRb[name] });
  } catch (e) {
    res.status(e.status || 500).json({ error: String(e.message || e) });
  }
});

// --- rulebook text-field patch (rich-text editor for *_rich fields) ---
// Edits a single allow-listed text field within the active demo rulebook by
// path. Used by the inline rich-text editor in the reception desk.
//
// Allowed paths (any other shape is rejected, never silently coerced):
//   ["__meta__", "tagline"]
//   ["__meta__", "description_rich"]
//   ["__meta__", "journal_seed"]
//   ["__meta__", "use_cases", <int>]
//   [<EntityName>, "summary_rich"]
//   [<EntityName>, "schema", <int>, "explanation_rich"]
//
// Legacy clients may still send "_meta" as path[0]; we treat it as a synonym
// for "__meta__" to keep the old REST contract working until the frontend is
// updated. The storage is always the __meta__ table.
//
// All other writes go through the typed entity endpoints above. Body shape:
//   { path: [...], value: "string" }
//
function isMetaPathRoot(seg) {
  return seg === META_TABLE_NAME || seg === "_meta";
}

function validateRichPath(path, rb) {
  if (!Array.isArray(path) || path.length < 2) {
    throw new Error("path must be a non-empty array with at least 2 segments");
  }
  if (isMetaPathRoot(path[0])) {
    const second = path[1];
    if (second === "tagline" || second === "description_rich" || second === "journal_seed") {
      if (path.length !== 2) throw new Error(`${path[0]}.${second} takes no further path segments`);
      return;
    }
    if (second === "use_cases") {
      if (path.length !== 3 || !Number.isInteger(path[2]) || path[2] < 0) {
        throw new Error(`${path[0]}.use_cases requires a non-negative integer index`);
      }
      return;
    }
    throw new Error(`${path[0]}.${second} is not an editable text field`);
  }
  // Otherwise path[0] is an entity name.
  const ent = rb[path[0]];
  if (!ent || typeof ent !== "object" || !Array.isArray(ent.schema)) {
    throw new Error(`Entity ${path[0]} not found or has no schema`);
  }
  if (path[1] === "summary_rich") {
    if (path.length !== 2) throw new Error(`${path[0]}.summary_rich takes no further path segments`);
    return;
  }
  if (path[1] === "schema") {
    if (path.length !== 4 || !Number.isInteger(path[2]) || path[3] !== "explanation_rich") {
      throw new Error(`schema rich-text edits require [entity, "schema", index, "explanation_rich"]`);
    }
    if (path[2] < 0 || path[2] >= ent.schema.length) throw new Error("schema index out of bounds");
    return;
  }
  throw new Error(`${path[0]}.${path[1]} is not an editable text field`);
}

function setByPath(obj, path, value) {
  // __meta__ paths land in the typed table, not in a nested object tree.
  if (isMetaPathRoot(path[0])) {
    const metaKey = path[1];
    if (path.length === 2) {
      setMetaValue(obj, metaKey, value);
      return;
    }
    if (metaKey === "use_cases" && path.length === 3 && Number.isInteger(path[2])) {
      const current = metaAsObject(obj).use_cases;
      const arr = Array.isArray(current) ? current.slice() : [];
      while (arr.length <= path[2]) arr.push("");
      arr[path[2]] = value;
      setMetaValue(obj, "use_cases", arr);
      return;
    }
    throw new Error(`unsupported meta path: ${path.join(".")}`);
  }
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const seg = path[i];
    if (cur[seg] == null) {
      if (path[i + 1] === 0 || Number.isInteger(path[i + 1])) cur[seg] = [];
      else cur[seg] = {};
    }
    cur = cur[seg];
  }
  cur[path[path.length - 1]] = value;
}

app.patch("/api/rulebook/text", requireEditor, async (req, res) => {
  const { path, value } = req.body || {};
  if (typeof value !== "string") {
    return res.status(400).json({ error: "value must be a string" });
  }
  try {
    const domain = requireDomain(req);
    const rb = loadRulebookForDomain(domain);
    validateRichPath(path, rb);
    const newRb = await writeThrough({
      domain,
      pgWrite: async () => {},
      rulebookMutate: (rb2) => {
        setByPath(rb2, path, value);
        return rb2;
      },
    });
    await recordAudit({ userId: getCurrentUser()?.UserId, action: "rulebook.text.update", target: `${domain}/${path.join(".")}`, payload: { path, value } });
    res.json({ ok: true, rulebook: newRb });
  } catch (e) {
    res.status(e.status || 400).json({
      error: String(e.message || e),
      transpilerOutput: e.transpilerOutput || null,
    });
  }
});

app.delete("/api/rulebook/entities/:name", requireEditor, async (req, res) => {
  const name = req.params.name;
  try {
    const domain = requireDomain(req);
    await writeThrough({
      domain,
      pgWrite: async () => {},
      rulebookMutate: (rb) => {
        delete rb[name];
        return rb;
      },
    });
    await recordAudit({ userId: getCurrentUser()?.UserId, action: "entity.delete", target: `${domain}/${name}` });
    res.json({ ok: true });
  } catch (e) {
    res.status(e.status || 500).json({ error: String(e.message || e) });
  }
});

// =============================================================================
// Effortless Explorer  (DOMAIN_UX_VISION.md §2)
// =============================================================================
// Walks the rulebook's DAG. The tree endpoint returns entity-level shape for
// the left-nav; subsequent /api/explorer/node calls (step 3) drive instance
// drill-down + scoped child lists. "FK" here means the canonical ERB signal:
// a field with type "relationship" carrying a "RelatedTo" target. lookup /
// aggregation fields are derived values, not FKs, and don't count.
// -----------------------------------------------------------------------------

// Iterate the entity tables in a rulebook in source order, skipping JSON
// metadata keys ($schema, _meta) and the rulebook-level Name/Description.
function* iterEntities(rb) {
  for (const [name, value] of Object.entries(rb)) {
    if (name.startsWith("$") || name.startsWith("_")) continue;
    if (name === "Name" || name === "Description") continue;
    if (!value || typeof value !== "object" || !Array.isArray(value.schema)) continue;
    yield [name, value];
  }
}

// ERB relationship fields are bidirectional: every real FK pair shows up as
// TWO type=relationship fields, one on each entity. To get a sensible DAG we
// have to pick exactly one side as the "real" outbound FK. Two signals,
// tried in order:
//
//   1. prefersSingleRecordLink — when explicitly true/false (ACME-style
//      rulebooks). true = the FK / "many" side; false = the inverse /
//      "one-to-collection" side.
//
//   2. Data shape — when the flag is missing (star-trek-style rulebooks).
//      The "many" side stores a single related id ("1-tos"); the inverse
//      side stores a comma-separated list of related ids
//      ("1-tos-season-1, 1-tos-season-2, ..."). First non-empty sample
//      decides.
//
// If neither signal is available (no flag, no data), we keep the field —
// better to show a relationship that turns out to be inverse than to drop a
// real FK silently.
function isInverseRelationshipField(f, entityData) {
  if (f.prefersSingleRecordLink === true)  return false;
  if (f.prefersSingleRecordLink === false) return true;
  if (!Array.isArray(entityData)) return false;
  for (const row of entityData) {
    const v = row[f.name];
    if (v === null || v === undefined || v === "") continue;
    if (typeof v !== "string") return false;
    const parts = v.split(",").map((s) => s.trim()).filter(Boolean);
    return parts.length > 1;
  }
  return false;
}

// For each entity, returns { outbound: [{ field, to }], rowCount, important }.
// Outbound FKs are the forward (non-inverse) relationship fields IN this
// entity pointing AT another. The inverse map (who points AT me — children)
// is derived in the tree handler.
function describeEntities(rb) {
  const out = {};
  for (const [name, value] of iterEntities(rb)) {
    out[name] = {
      rowCount: Array.isArray(value.data) ? value.data.length : 0,
      important: !!value.important,
      outbound: (value.schema || [])
        .filter((f) => f.type === "relationship"
                    && f.RelatedTo
                    && !isInverseRelationshipField(f, value.data))
        .map((f) => ({ field: f.name, to: f.RelatedTo })),
    };
  }
  return out;
}

function loadRulebookForDomain(domain) {
  if (domain === "__top__") return loadProjectRulebook();
  const rbPath = path.join(RULEBOOK_EXAMPLES, domain, "effortless-rulebook", `${domain}-rulebook.json`);
  if (!fs.existsSync(rbPath)) {
    const err = new Error(`rulebook for domain '${domain}' not found at ${rbPath}`);
    err.statusCode = 404;
    throw err;
  }
  return JSON.parse(fs.readFileSync(rbPath, "utf8"));
}

// Spec §2.6 says URL ids are the entity's Name. But ERB FK *values* in data
// (e.g. Projects.ApprovedBy = "sarah-chen") reference a PK-style field, not
// Name (Name would be "Sarah Chen"). So scoping a child list under a parent
// instance is a two-step lookup: URL.Name → row → row.PK → filter children
// whose FK field matches that PK. This helper finds the PK field name.
function findPkField(entity) {
  const explicit = (entity.schema || []).find((f) => f.isPk === true);
  if (explicit) return explicit.name;
  // A field is required (PK-eligible) unless it OPTS IN to nullability with
  // `nullable: true`. Rulebooks routinely omit `nullable` on raw PK fields
  // (e.g. customer-fullname's CustomerId has no `nullable` key at all), so a
  // strict `nullable === false` check wrongly skipped them and fell through to
  // the calculated `Name` field — which can never be supplied on write.
  const idField = (entity.schema || []).find(
    (f) => f.type === "raw" && f.nullable !== true && /Id$/.test(f.name)
  );
  if (idField) return idField.name;
  const firstRequiredRaw = (entity.schema || []).find(
    (f) => f.type === "raw" && f.nullable !== true
  );
  return firstRequiredRaw ? firstRequiredRaw.name : "Name";
}

// The §A.2.6 spec uses the entity's `Name` field as the URL id, and the UI
// uses it as the row label. But some rulebooks define `Name` as a calculated
// field whose value isn't materialized in the `data` array — customer-fullname
// is the canonical example: `Name = =SUBSTITUTE({{EmailAddress}}, "@", "-")`,
// but every row in `data` carries `Name: null`. Without a formula evaluator at
// read time, the interface would show "null" everywhere and URLs would point
// at `/Customers/null`.
//
// Resolution: fall back to the value of the entity's first schema column,
// which by ERB convention is the entity's stable raw key (CustomerId,
// ProjectId, EmployeeId, …) and is always populated. This is NOT a silent
// fallback in the sense CLAUDE.md warns against — the rule is deterministic
// and derived from the rulebook (the SSoT). It IS the right answer for the
// case "Name is empty"; nothing is being guessed at.
function firstColumnField(entity) {
  return (entity.schema || [])[0]?.name || null;
}
function effectiveRowName(entity, row) {
  if (row == null) return null;
  const raw = row.Name;
  if (raw !== null && raw !== undefined && String(raw) !== "") return raw;
  const col0 = firstColumnField(entity);
  return col0 ? (row[col0] ?? null) : null;
}
// Re-find a row by its stable PK value. Needed at response boundaries AFTER a
// rebake: rebaking can populate/change a calculated `Name`, which shifts the
// row's *effective* name (the create/patch handler captured the pre-rebake id).
// The PK value never changes, so match on it.
function findRowIndexByPk(entity, pkField, pkValue) {
  const target = String(pkValue);
  return (entity.data || []).findIndex((r) => String(r[pkField] ?? "") === target);
}
function findRowIndexByEffectiveName(entity, name) {
  const target = String(name);
  return (entity.data || []).findIndex(
    (r) => String(effectiveRowName(entity, r)) === target
  );
}

// Used at response boundaries — clones the row with `Name` set to the
// effective value so the client never has to special-case null.
function normalizeRowName(entity, row) {
  if (!row) return row;
  const eff = effectiveRowName(entity, row);
  if (row.Name === eff) return row;
  return { ...row, Name: eff };
}

// Map a single Postgres row (snake_case keys) back to ERB PascalCase field names
// using the entity schema as the authoritative name map.
function mapViewRowToPascal(pgRow, schema) {
  if (!pgRow || !schema) return pgRow;
  const out = {};
  const schemaSnakeSet = new Set(schema.map((f) => toSnakeCase(f.name)));
  for (const f of schema) {
    const snake = toSnakeCase(f.name);
    if (Object.prototype.hasOwnProperty.call(pgRow, snake)) {
      out[f.name] = pgRow[snake];
    }
  }
  // Pass through any extra columns the schema doesn't name.
  for (const [k, v] of Object.entries(pgRow)) {
    if (!schemaSnakeSet.has(k)) out[k] = v;
  }
  return out;
}

// Query vw_<entityName> and return rows with PascalCase keys.
// Raises on any DB error — no silent fallback to JSON data.
async function queryViewRows(pool, entityName, schema, where = "", params = []) {
  const viewName = `vw_${toSnakeCase(entityName)}`;
  const sql = `SELECT * FROM ${viewName}${where ? ` WHERE ${where}` : ""}`;
  const result = await pool.query(sql, params);
  return result.rows.map((r) => mapViewRowToPascal(r, schema));
}

// GET /api/explorer/tree?domain=<slug>&maxDepth=<n>
// Returns the entity-level DAG shape. Top-level = every entity in the rulebook
// (unfiltered cross-cut). children[] = entities that have a relationship FK
// pointing AT this one (i.e., "what would hang off an instance of this
// entity"). With maxDepth=0 the children arrays are empty (useful when the
// client only wants entity row counts).
app.get("/api/explorer/tree", (req, res) => {
  const domain = requireDomain(req);
  const maxDepth = Math.max(0, parseInt(req.query.maxDepth ?? "1", 10));
  try {
    const rb = loadRulebookForDomain(domain);
    const desc = describeEntities(rb);

    // Inverse FK index: for entity E, who has an outbound FK pointing AT E?
    const inbound = {};
    for (const name of Object.keys(desc)) inbound[name] = [];
    for (const [name, info] of Object.entries(desc)) {
      for (const fk of info.outbound) {
        if (!inbound[fk.to]) continue;     // FK target isn't a known entity
        inbound[fk.to].push({ entity: name, viaFk: fk.field });
      }
    }

    const topLevel = Object.entries(desc).map(([name, info]) => ({
      entity: name,
      rowCount: info.rowCount,
      important: info.important,
      children: maxDepth >= 1
        ? inbound[name].map((c) => ({
            entity: c.entity,
            rowCount: desc[c.entity]?.rowCount ?? 0,
            viaFk: c.viaFk,
          }))
        : [],
    }));

    res.json({
      domain,
      rulebookRevision: rulebookRevisionForDomain(domain),
      topLevel,
    });
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: String(e.message || e) });
  }
});

// GET /api/explorer/node?path=<encoded>&page=<n>&pageSize=<n>
// The §2.7 workhorse. `path` segments alternate entity / id / entity / id…
// per §2.6. Odd length = list node; even length = instance node. Schema and
// rows ride in the same payload (§2.3: schema and data are combined metadata,
// not two separate fetches).
app.get("/api/explorer/node", async (req, res) => {
  const domain = requireDomain(req);
  const pathStr = req.query.path || "";
  const page = Math.max(0, parseInt(req.query.page ?? "0", 10));
  const pageSize = Math.max(1, Math.min(500, parseInt(req.query.pageSize ?? "50", 10)));

  try {
    const rb = loadRulebookForDomain(domain);
    const pool = await getDomainPool(domain);
    const segments = pathStr.split("/").filter(Boolean).map(decodeURIComponent);

    if (segments.length === 0) {
      return res.json({ kind: "root", domain });
    }

    // Walk path pairs to validate every parent entity/id exists and to build
    // the scopedBy ancestry. Even-positioned segments (0, 2, 4, …) are entity
    // names; odd-positioned are instance Names.
    const scope = []; // [{ entity, id, pk, pkValue }]
    for (let i = 0; i + 1 < segments.length; i += 2) {
      const ent = segments[i], id = segments[i + 1];
      const e = rb[ent];
      if (!e || !Array.isArray(e.schema)) {
        return res.status(404).json({ error: `entity '${ent}' not found` });
      }
      const viewRows = await queryViewRows(pool, ent, e.schema);
      const row = viewRows.find((r) => String(effectiveRowName(e, r)) === id);
      if (!row) {
        return res.status(404).json({ error: `${ent} with Name='${id}' not found` });
      }
      const pk = findPkField(e);
      scope.push({ entity: ent, id, pk, pkValue: row[pk] });
    }

    const isInstance = segments.length % 2 === 0;

    if (isInstance) {
      // Final pair IS the instance. Look it up.
      const { entity: entityName, id } = scope[scope.length - 1];
      const entity = rb[entityName];
      const viewRows = await queryViewRows(pool, entityName, entity.schema);
      const row = viewRows.find((r) => String(effectiveRowName(entity, r)) === id);
      if (!row) {
        return res.status(404).json({ error: `${entityName} with Name='${id}' not found` });
      }

      // Tabs: every entity X with a forward FK pointing at this entity.
      // Count rows in vw_X where the FK column matches this instance's PK.
      const pk = findPkField(entity);
      const pkValue = row[pk];
      const tabs = [];
      for (const [otherName, otherValue] of iterEntities(rb)) {
        if (otherName === entityName) continue;
        for (const f of otherValue.schema) {
          if (f.type !== "relationship" || f.RelatedTo !== entityName) continue;
          if (isInverseRelationshipField(f, otherValue.data)) continue;
          const fkSnake = toSnakeCase(f.name);
          const r = await pool.query(
            `SELECT COUNT(*)::int AS n FROM vw_${toSnakeCase(otherName)} WHERE ${fkSnake} = $1`,
            [pkValue]
          );
          tabs.push({ entity: otherName, viaFk: f.name, rowCount: r.rows[0]?.n ?? 0 });
        }
      }

      return res.json({
        kind: "instance",
        entity: entityName,
        id,
        pk,
        pkValue,
        scope: scope.slice(0, -1),  // ancestors, not including this instance
        schema: entity.schema,
        row: normalizeRowName(entity, row),
        tabs,
      });
    }

    // List node — final unpaired segment is the entity name.
    const entityName = segments[segments.length - 1];
    const entity = rb[entityName];
    if (!entity || !Array.isArray(entity.schema)) {
      return res.status(404).json({ error: `entity '${entityName}' not found` });
    }

    let rows;
    let scopedBy = null;

    if (scope.length > 0) {
      // Filter rows of `entityName` whose forward FK points at the immediate
      // parent instance. There can be multiple FKs from this entity to the
      // parent (e.g. Projects has both ApprovedBy and RequestedBy pointing
      // at Employees) — for v1 we pick the first matching FK and document
      // the limitation. A future query-param `viaFk=<field>` can disambiguate.
      const parent = scope[scope.length - 1];
      const fk = entity.schema.find(
        (f) => f.type === "relationship"
            && f.RelatedTo === parent.entity
            && !isInverseRelationshipField(f, entity.data)
      );
      if (!fk) {
        return res.status(400).json({
          error: `no forward FK from ${entityName} to ${parent.entity}`,
        });
      }
      const fkSnake = toSnakeCase(fk.name);
      rows = await queryViewRows(pool, entityName, entity.schema, `${fkSnake} = $1`, [parent.pkValue]);
      scopedBy = { entity: parent.entity, id: parent.id, viaFk: fk.name };
    } else {
      rows = await queryViewRows(pool, entityName, entity.schema);
    }

    const totalCount = rows.length;
    const pageRows = rows.slice(page * pageSize, (page + 1) * pageSize);

    return res.json({
      kind: "list",
      entity: entityName,
      scope,                       // ancestors
      scopedBy,                    // explicit "filtered by parent X via FK Y"
      schema: entity.schema,
      rows: pageRows.map((r) => normalizeRowName(entity, r)),
      totalCount,
      page,
      pageSize,
    });
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: String(e.message || e) });
  }
});

// -----------------------------------------------------------------------------
// GET /api/explorer/cell?domain=&entity=&id=&field=
// Provenance: how did this cell get its value? Walks the formula text on
// demand per §2.8 decision 5 (no cache, no pre-computed index).
//
// For calculated fields: extracts same-entity {{FieldName}} references and
// returns each with its raw value in this row.
// For lookup fields shaped like Excel's INDEX/MATCH (the only shape the
// transpiler emits), resolves the target row and returns the source value
// + the link the UI can navigate to.
// For aggregation fields: lists the EntityName!{{Field}} references with
// the target rows' values left for the client to drill into.
//
// Aggregations are reported but not summed here — that's substrate-level
// work and the spec calls out runtime walk over the rulebook JSON only.

const SAME_ENT_REF_RE = /\{\{?\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}?\}/g;
const CROSS_ENT_REF_RE = /([A-Za-z_][A-Za-z0-9_]*)!\{\{?\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}?\}/g;
const INDEX_MATCH_RE = /INDEX\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*!\s*\{\{?\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}?\}\s*,\s*MATCH\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*!\s*\{\{?\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}?\}\s*,\s*([A-Za-z_][A-Za-z0-9_]*)\s*!\s*\{\{?\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}?\}/i;

function extractFieldRefs(formula) {
  if (!formula) return { sameEntity: [], crossEntity: [] };
  // Match cross-entity refs first, then mask them so SAME_ENT_REF_RE
  // doesn't re-pick up the field portion of an Entity!{{Field}}.
  const crossEntity = [];
  let masked = formula;
  for (const m of formula.matchAll(CROSS_ENT_REF_RE)) {
    crossEntity.push({ entity: m[1], field: m[2] });
    masked = masked.replace(m[0], " ".repeat(m[0].length));
  }
  const sameEntity = [];
  for (const m of masked.matchAll(SAME_ENT_REF_RE)) {
    sameEntity.push(m[1]);
  }
  return {
    sameEntity: [...new Set(sameEntity)],
    crossEntity: Array.from(
      new Map(crossEntity.map((e) => [`${e.entity}!${e.field}`, e])).values()
    ),
  };
}

function resolveLookup(rb, thisRow, formula) {
  if (!formula) return null;
  const m = formula.match(INDEX_MATCH_RE);
  if (!m) return null;
  const [, targetEntity, targetField, , fkField, targetEnt2, targetPkField] = m;
  if (targetEntity !== targetEnt2) return null;
  const target = rb[targetEntity];
  if (!target || !Array.isArray(target.data)) return null;
  const fkValue = thisRow[fkField];
  if (fkValue === null || fkValue === undefined || fkValue === "") return { targetEntity, targetField, fkField, fkValue, matchedRow: null };
  const matchedRow = target.data.find(
    (r) => String(r[targetPkField] ?? "").trim() === String(fkValue).trim()
  );
  return { targetEntity, targetField, targetPkField, fkField, fkValue, matchedRow: matchedRow || null };
}

app.get("/api/explorer/cell", async (req, res) => {
  const domain = requireDomain(req);
  const entityName = req.query.entity;
  const id = req.query.id;
  const fieldName = req.query.field;
  if (!entityName || !id || !fieldName) {
    return res.status(400).json({ error: "domain, entity, id, field are required" });
  }
  try {
    const rb = loadRulebookForDomain(domain);
    const pool = await getDomainPool(domain);
    const entity = rb[entityName];
    if (!entity || !Array.isArray(entity.schema)) {
      return res.status(404).json({ error: `entity '${entityName}' not found` });
    }
    const viewRows = await queryViewRows(pool, entityName, entity.schema);
    const row = viewRows.find((r) => String(effectiveRowName(entity, r)) === id);
    if (!row) return res.status(404).json({ error: `${entityName} with Name='${id}' not found` });
    const field = entity.schema.find((f) => f.name === fieldName);
    if (!field) return res.status(404).json({ error: `field '${fieldName}' not on ${entityName}` });

    const value = row[fieldName];
    const base = {
      value,
      kind: field.type || "raw",
      formula: field.formula || null,
      explanation_rich: field.explanation_rich || null,
      description: field.Description || null,
    };

    if (field.type === "raw") {
      return res.json({ ...base, inputs: [] });
    }

    if (field.type === "relationship") {
      // Forward FK or inverse view. Surface the target entity name; the
      // UI can deep-link from there.
      if (field.RelatedTo) {
        return res.json({
          ...base,
          inputs: [{ entity: field.RelatedTo, kind: "relationship", value }],
        });
      }
      return res.json({ ...base, inputs: [] });
    }

    if (field.type === "lookup") {
      const resolved = resolveLookup(rb, row, field.formula);
      const refs = extractFieldRefs(field.formula);
      const inputs = [];
      if (resolved) {
        inputs.push({
          field: resolved.fkField,
          kind: "raw",
          value: resolved.fkValue,
        });
        if (resolved.matchedRow) {
          const targetEnt = rb[resolved.targetEntity];
          const targetPk = findPkField(targetEnt);
          inputs.push({
            entity: resolved.targetEntity,
            id: resolved.matchedRow.Name,
            field: resolved.targetField,
            kind: "raw",
            value: resolved.matchedRow[resolved.targetField],
            pk: targetPk,
            pkValue: resolved.matchedRow[targetPk],
          });
        }
      } else {
        // Not an INDEX/MATCH lookup — just list the referenced fields.
        for (const r of refs.crossEntity) {
          inputs.push({ entity: r.entity, field: r.field, kind: "ref" });
        }
        for (const f of refs.sameEntity) {
          inputs.push({ field: f, kind: "ref", value: row[f] });
        }
      }
      return res.json({ ...base, inputs, resolved });
    }

    if (field.type === "calculated") {
      const refs = extractFieldRefs(field.formula);
      const inputs = [];
      for (const f of refs.sameEntity) {
        const refField = entity.schema.find((s) => s.name === f);
        inputs.push({
          field: f,
          kind: refField?.type || "raw",
          value: row[f],
        });
      }
      // Cross-entity refs in a calculated field are unusual but possible
      // (e.g. via a lookup chain). Surface them as ref-only.
      for (const r of refs.crossEntity) {
        inputs.push({ entity: r.entity, field: r.field, kind: "ref" });
      }
      return res.json({ ...base, inputs });
    }

    if (field.type === "aggregation") {
      const refs = extractFieldRefs(field.formula);
      const inputs = refs.crossEntity.map((r) => ({
        entity: r.entity,
        field: r.field,
        kind: "ref",
      }));
      // For COUNTIFS/SUMIFS the contributing-rows set could be computed
      // here, but the spec puts that on the client / the substrates. v1
      // surfaces the referenced entity so the user can drill in.
      return res.json({ ...base, inputs });
    }

    return res.json({ ...base, inputs: [] });
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: String(e.message || e) });
  }
});

// -----------------------------------------------------------------------------
// Explorer mutations — PATCH / POST / DELETE on instance rows.
// -----------------------------------------------------------------------------
// All three reuse the existing writeThrough helper (Postgres + rulebook JSON
// in one transaction). Per §2.8 decision 4 there is NO locking layer on top
// of writeThrough — the effortless CLI handles its own locking; adding more
// here masks the real conflicts CLAUDE.md "No locks, no caches, no fallbacks"
// warns about.
//
// PascalCase → snake_case. ACME's transpiler produces this from entity and
// field names, and we follow the same mapping to address its tables.
function toSnakeCase(s) {
  if (!s) return s;
  return String(s)
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();
}

async function entityTableExists(client, tableName) {
  const r = await client.query(
    `SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = $1`,
    [tableName]
  );
  return r.rowCount > 0;
}

// Returns the schema field-defs that PATCH/POST may write. Calculated,
// lookup, aggregation, and inverse-relationship fields are read-only by
// construction — silently filtering them is wrong (the caller probably has
// a bug), so we instead reject the request loudly.
function classifyFieldsForWrite(entity, patch) {
  const schemaByName = Object.fromEntries((entity.schema || []).map((f) => [f.name, f]));
  const accepted = {};
  const rejected = [];
  const unknown = [];
  for (const [field, value] of Object.entries(patch || {})) {
    const f = schemaByName[field];
    if (!f) { unknown.push(field); continue; }
    if (f.type === "calculated" || f.type === "lookup" || f.type === "aggregation") {
      rejected.push({ field, reason: `${f.type} fields are derived, not writable` });
      continue;
    }
    if (f.type === "relationship" && isInverseRelationshipField(f, entity.data)) {
      rejected.push({ field, reason: "inverse-side relationship; edit the FK side instead" });
      continue;
    }
    accepted[field] = value;
  }
  return { accepted, rejected, unknown };
}

// PATCH /api/explorer/instance/:entity/:id
// Body: { fieldName: newValue, … } — raw + forward-FK fields only.
app.patch("/api/explorer/instance/:entity/:id", requireEditor, async (req, res) => {
  const entityName = req.params.entity;
  const id = req.params.id;
  // `makeDomainApi` injects `domain` into every request body; strip it before
  // passing to the field classifier so it doesn't appear as an unknown field.
  const { domain: _domainBody, ...patch } = req.body || {};
  try {
    const domain = requireDomain(req);
    const rb = loadRulebookForDomain(domain);
    const entity = rb[entityName];
    if (!entity || !Array.isArray(entity.schema)) {
      return res.status(404).json({ error: `entity '${entityName}' not found` });
    }
    const rowIdx = findRowIndexByEffectiveName(entity, id);
    if (rowIdx < 0) {
      return res.status(404).json({ error: `${entityName} with Name='${id}' not found` });
    }
    const { accepted, rejected, unknown } = classifyFieldsForWrite(entity, patch);
    if (unknown.length || rejected.length) {
      return res.status(400).json({
        error: "patch contains non-writable fields",
        unknown,
        rejected,
      });
    }
    if (Object.keys(accepted).length === 0) {
      return res.status(400).json({ error: "patch is empty" });
    }

    const pk = findPkField(entity);
    const pkValue = entity.data[rowIdx][pk];
    const tableName = toSnakeCase(entityName);

    const newRb = await writeThrough({
      domain,
      pgWrite: async (c) => {
        // (1) actual entity table — best-effort; skip if not bootstrapped.
        if (await entityTableExists(c, tableName)) {
          const cols = Object.keys(accepted);
          const setClauses = cols.map((col, i) => `${toSnakeCase(col)} = $${i + 1}`);
          const values = cols.map((col) => accepted[col]);
          values.push(pkValue);
          await c.query(
            `UPDATE ${tableName} SET ${setClauses.join(", ")}
              WHERE ${toSnakeCase(pk)} = $${cols.length + 1}`,
            values
          );
        } else {
          console.warn(`[explorer] table '${tableName}' not in editor DB; rulebook JSON updated only`);
        }
      },
      rulebookMutate: (rb2) => {
        // Re-find the row inside rb2 (the freshly-loaded rulebook) rather
        // than trusting the rowIdx captured at handler entry — protects
        // against the rulebook changing under us between request and commit.
        const ent = rb2[entityName];
        if (!ent || !Array.isArray(ent.data)) {
          throw new Error(`entity '${entityName}' missing from current rulebook`);
        }
        const idx = findRowIndexByEffectiveName(ent, id);
        if (idx < 0) {
          throw new Error(`${entityName} with Name='${id}' no longer present`);
        }
        ent.data[idx] = { ...ent.data[idx], ...accepted };
        return rb2;
      },
    });
    await recordAudit({ userId: getCurrentUser()?.UserId, action: "instance.patch", target: `${domain}/${entityName}/${id}`, payload: accepted });
    // §rebake: query vw_* for PK + calc values and merge into the JSON's data
    // rows. The base-table UPDATE just committed inside writeThrough is
    // visible via the same erb_<domain> pool, so views compute against the
    // new row immediately. Failure here surfaces loudly (no auto-revert).
    const rebakedRb = await rebakeAfterDataChange({ domain, pool: await getDomainPool(domain) });
    const freshEnt = rebakedRb[entityName];
    // Re-find by PK, not effective-name: editing a field that feeds a
    // calculated Name (e.g. EmailAddress → Name) shifts the row's effective id
    // away from the URL `id` the request came in with. The PK is stable.
    const idxFresh = findRowIndexByPk(freshEnt, pk, pkValue);
    res.json({ ok: true, row: normalizeRowName(freshEnt, freshEnt.data[idxFresh]) });
  } catch (e) {
    res.status(e.status || e.statusCode || 500).json({ error: String(e.message || e) });
  }
});

// POST /api/explorer/instance/:entity
// Body: full row payload (raw + forward-FK fields only).
app.post("/api/explorer/instance/:entity", requireEditor, async (req, res) => {
  const entityName = req.params.entity;
  const { domain: _domainBody, ...body } = req.body || {};
  try {
    const domain = requireDomain(req);
    const rb = loadRulebookForDomain(domain);
    const entity = rb[entityName];
    if (!entity || !Array.isArray(entity.schema)) {
      return res.status(404).json({ error: `entity '${entityName}' not found` });
    }
    const { accepted, rejected, unknown } = classifyFieldsForWrite(entity, body);
    if (unknown.length || rejected.length) {
      return res.status(400).json({ error: "row contains non-writable fields", unknown, rejected });
    }
    // Identity for the new row: prefer Name, fall back to column 0 (same rule
    // the read path uses — see effectiveRowName). For entities whose Name is
    // calculated and therefore not writable, column 0 is what the row will be
    // addressed by in URLs, so requiring it (not Name) is the right check.
    const newRowId = effectiveRowName(entity, accepted);
    if (!newRowId) {
      const col0 = firstColumnField(entity);
      return res.status(400).json({
        error: col0 && col0 !== "Name"
          ? `Either Name or ${col0} (column 0) is required as the row identifier (§2.6)`
          : "Name field is required (used as the URL id per §2.6)"
      });
    }
    if (findRowIndexByEffectiveName(entity, newRowId) >= 0) {
      return res.status(409).json({ error: `${entityName} with Name='${newRowId}' already exists` });
    }
    const pk = findPkField(entity);
    if (!accepted[pk]) {
      return res.status(400).json({ error: `${pk} (PK) is required` });
    }
    const tableName = toSnakeCase(entityName);

    const newRb = await writeThrough({
      domain,
      pgWrite: async (c) => {
        if (await entityTableExists(c, tableName)) {
          const cols = Object.keys(accepted);
          const colList = cols.map(toSnakeCase).join(", ");
          const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
          const values = cols.map((col) => accepted[col]);
          await c.query(
            `INSERT INTO ${tableName} (${colList}) VALUES (${placeholders})`,
            values
          );
        } else {
          console.warn(`[explorer] table '${tableName}' not in editor DB; rulebook JSON updated only`);
        }
      },
      rulebookMutate: (rb2) => {
        const ent = rb2[entityName];
        if (!ent || !Array.isArray(ent.data)) {
          throw new Error(`entity '${entityName}' missing from current rulebook`);
        }
        // Re-check uniqueness against the fresh rulebook in case another
        // request inserted the same row between handler entry and commit.
        if (findRowIndexByEffectiveName(ent, newRowId) >= 0) {
          throw new Error(`${entityName} with Name='${newRowId}' already exists`);
        }
        ent.data = [...ent.data, accepted];
        return rb2;
      },
    });
    await recordAudit({ userId: getCurrentUser()?.UserId, action: "instance.create", target: `${domain}/${entityName}/${newRowId}`, payload: accepted });
    // §rebake: refresh JSON with the new row's calc values (the INSERT just
    // committed; vw_<entity> now includes it).
    const rebakedRb = await rebakeAfterDataChange({ domain, pool: await getDomainPool(domain) });
    const freshEnt = rebakedRb[entityName];
    // Re-find by PK, not effective-name: the rebake may have populated a
    // calculated Name, shifting the row's effective id away from newRowId.
    const idxFresh = findRowIndexByPk(freshEnt, pk, accepted[pk]);
    const row = idxFresh >= 0 ? freshEnt.data[idxFresh] : accepted;
    res.status(201).json({ ok: true, row: normalizeRowName(freshEnt, row) });
  } catch (e) {
    res.status(e.status || e.statusCode || 500).json({ error: String(e.message || e) });
  }
});

// DELETE /api/explorer/instance/:entity/:id?cascade=<bool>
// With cascade=false (default): if any FK referrers exist, return 409 with
// the referrer list. With cascade=true: walk forward FKs from other entities
// and delete referring rows first. Recursion depth is bounded to prevent
// infinite loops on cyclic schemas.
function findReferrers(rb, entityName, pkValue) {
  const refs = [];
  for (const [otherName, otherValue] of iterEntities(rb)) {
    if (otherName === entityName) continue;
    for (const f of otherValue.schema || []) {
      if (f.type !== "relationship" || f.RelatedTo !== entityName) continue;
      if (isInverseRelationshipField(f, otherValue.data)) continue;
      for (const r of otherValue.data || []) {
        if (String(r[f.name] ?? "").trim() === String(pkValue ?? "").trim()) {
          refs.push({
            entity: otherName,
            fkField: f.name,
            name: effectiveRowName(otherValue, r),
            pk: r[findPkField(otherValue)],
          });
        }
      }
    }
  }
  return refs;
}

app.delete("/api/explorer/instance/:entity/:id", requireEditor, async (req, res) => {
  const entityName = req.params.entity;
  const id = req.params.id;
  const cascade = String(req.query.cascade || "").toLowerCase() === "true";
  const MAX_CASCADE_DEPTH = 8;
  try {
    const domain = requireDomain(req);
    const rb = loadRulebookForDomain(domain);
    const entity = rb[entityName];
    if (!entity || !Array.isArray(entity.schema)) {
      return res.status(404).json({ error: `entity '${entityName}' not found` });
    }
    const rowIdx = findRowIndexByEffectiveName(entity, id);
    if (rowIdx < 0) {
      return res.status(404).json({ error: `${entityName} with Name='${id}' not found` });
    }
    const row = entity.data[rowIdx];
    const pk = findPkField(entity);
    const pkValue = row[pk];

    const refs = findReferrers(rb, entityName, pkValue);
    if (refs.length > 0 && !cascade) {
      return res.status(409).json({
        error: `${entityName}/${id} has ${refs.length} FK referrer(s); pass ?cascade=true to cascade`,
        referrers: refs,
      });
    }

    // Build the deletion plan in dependency order (referrers first), bounded.
    // Same logic as findReferrers but accumulating across depth.
    const deletions = []; // { entity, pk, pkValue, rowIdx }
    function plan(targetEntity, targetPkValue, depth) {
      if (depth > MAX_CASCADE_DEPTH) {
        throw new Error(`cascade depth exceeded ${MAX_CASCADE_DEPTH} — cycle in FK graph?`);
      }
      const subRefs = findReferrers(rb, targetEntity, targetPkValue);
      for (const r of subRefs) plan(r.entity, r.pk, depth + 1);
      const ent = rb[targetEntity];
      const idx = (ent.data || []).findIndex(
        (x) => String(x[findPkField(ent)] ?? "").trim() === String(targetPkValue ?? "").trim()
      );
      if (idx < 0) return;
      if (deletions.some((d) => d.entity === targetEntity && d.rowIdx === idx)) return;
      deletions.push({
        entity: targetEntity,
        table: toSnakeCase(targetEntity),
        pk: findPkField(ent),
        pkValue: targetPkValue,
        rowIdx: idx,
      });
    }
    plan(entityName, pkValue, 0);

    await writeThrough({
      domain,
      pgWrite: async (c) => {
        for (const d of deletions) {
          if (await entityTableExists(c, d.table)) {
            await c.query(
              `DELETE FROM ${d.table} WHERE ${toSnakeCase(d.pk)} = $1`,
              [d.pkValue]
            );
          }
          // refresh portal mirror by reading the post-delete data array from
          // the rulebook mutation — done after rulebookMutate runs. We
          // re-load below.
        }
      },
      rulebookMutate: (rb2) => {
        // Look up each row fresh in rb2 (by PK) rather than reusing the
        // rowIdx captured at handler entry — keeps the splice safe if the
        // rulebook changed under us.
        for (const d of deletions) {
          const ent = rb2[d.entity];
          if (!ent || !Array.isArray(ent.data)) continue;
          const idx = ent.data.findIndex(
            (x) => String(x[d.pk] ?? "").trim() === String(d.pkValue ?? "").trim()
          );
          if (idx >= 0) ent.data.splice(idx, 1);
        }
        return rb2;
      },
    });

    await recordAudit({
      userId: getCurrentUser()?.UserId,
      action: cascade ? "instance.delete.cascade" : "instance.delete",
      target: `${domain}/${entityName}/${id}`,
      payload: { deletions: deletions.map(({ entity, pkValue }) => ({ entity, pkValue })) },
    });

    // §rebake: deletes can change OTHER rows' calc values via cross-entity
    // aggregations and lookups (e.g. Customer.OrderCount drops when an
    // Order row is deleted). Re-query views across the whole rulebook.
    await rebakeAfterDataChange({ domain, pool: await getDomainPool(domain) });

    res.json({ ok: true, deleted: deletions.map(({ entity, pkValue }) => ({ entity, pkValue })) });
  } catch (e) {
    res.status(e.status || e.statusCode || 500).json({ error: String(e.message || e) });
  }
});

// -----------------------------------------------------------------------------
// Schema PATCH + rebuild SSE  (DOMAIN_UX_VISION.md §2.7 + §2.8 decisions)
// -----------------------------------------------------------------------------
// Schema edits trigger a rebuild (effortless build → editor DB resync).
// The endpoint returns immediately with a rebuildId; the client tails an
// SSE stream that emits phase events as the rebuild progresses.
//
// §2.8 decision 1: NO snapshot sidecar files. Git history is the rollback.
// §2.8 decision 2: Async + SSE response.
// §2.8 decision 3: Failed rebuilds are NOT auto-rolled back — surface the
//   diff loudly so the user can decide whether to git-checkout or fix.
// §2.8 decision 4: NO LOCK during rebuild. The effortless CLI handles its
//   own locking; no advisory locks or "rebuild in progress" gates on top.

// In-memory job registry. Keyed by rebuildId. Each job carries its phase
// log + the set of SSE response objects subscribed to it. The job survives
// in-process restarts only — that's fine because the durable artifact is
// the rulebook JSON in git; failed rebuilds are inspected via git diff.
const rebuildJobs = new Map();

function nextRebuildId() {
  const d = new Date();
  const stamp = d.toISOString().replace(/[-:T]/g, "").slice(0, 14);
  let n = 1;
  while (rebuildJobs.has(`rb-${stamp}-${String(n).padStart(3, "0")}`)) n++;
  return `rb-${stamp}-${String(n).padStart(3, "0")}`;
}

function broadcastJobEvent(job, event, data) {
  job.events.push({ event, data });
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of job.clients) {
    try { res.write(payload); } catch (e) { /* client gone */ }
  }
}

function phase(job, phaseName, msg, extra = {}) {
  broadcastJobEvent(job, "phase", { phase: phaseName, msg, ...extra });
}

function finishJob(job, kind, data) {
  job.status = kind === "done" ? "done" : "error";
  job.finishedAt = Date.now();
  if (kind === "done") job.durationMs = job.finishedAt - job.startedAt;
  broadcastJobEvent(job, kind, data);
  // Close all open SSE connections for this job — clients may reconnect via
  // GET /rebuild/:id (returns the captured event log) if they need replay.
  for (const res of job.clients) {
    try { res.end(); } catch (e) { /* */ }
  }
  job.clients.clear();
}

// Kick off the rebuild as a background async. Four sequential phases:
//   1. effortless_build — regenerates SQL/Python/etc from the (now-patched)
//      rulebook by running `effortless build` in the project directory.
//   2. create / populate / constraints — runs the regenerated postgres-bootstrap
//      SQL files in lex order via psql against erb_<domain>. The numbered
//      files handle their own DROP IF EXISTS + CREATE on the entity tables;
//      portal_* tables are untouched (different naming convention) so the
//      portal's own state survives the rebuild.
//   3. verify — counts rows in each entity's table and compares against the
//      rulebook's data arrays. Mismatches fail loudly with a structured
//      payload (per §2.8 decision 3: don't auto-rollback, surface the diff).
//
// Per §2.8 decision 4 there is NO lock around any of this — concurrent
// writes against the same domain mid-rebuild will fail loudly from psql,
// which is the correct surface.
function sqlBootstrapDir(domain) {
  if (domain === "__top__") return path.join(PLATFORM_DIR, "postgres");
  return path.join(RULEBOOK_EXAMPLES, domain, "postgres-bootstrap");
}

function sqlPhaseCategory(fname) {
  if (/^05[ab]?-/.test(fname)) return "populate";
  if (/^99/.test(fname))       return "constraints";
  return "create";
}

function execOnePsqlFile(fullPath, dbName) {
  return new Promise((resolve, reject) => {
    const child = spawn("psql", [
      "-v", "ON_ERROR_STOP=1",
      "-d", dbName,
      "-f", fullPath,
    ], {
      env: {
        ...process.env,
        PGHOST:     PG_CONFIG.host,
        PGPORT:     String(PG_CONFIG.port),
        PGUSER:     PG_CONFIG.user,
        PGPASSWORD: PG_CONFIG.password || "",
      },
    });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) return resolve();
      const err = new Error(`psql -f ${path.basename(fullPath)} exited ${code}\n${stderr.slice(-1600)}`);
      err.phase = "psql";
      err.code = "SQL_FAILED";
      reject(err);
    });
  });
}

// init-db.sh skips 99-fk-constraints.sql unless EFFORTLESS_ENFORCE_FKS=true
// — FK enforcement is opt-in for demos so that intentionally-gappy
// demo data doesn't break the bootstrap loop. We match that contract
// here (and in applyPostgresBootstrapBare below) so portal-driven
// rebuilds behave identically to a fresh init-db.sh run.
function shouldSkipBootstrapFile(fname) {
  if (fname === "99-fk-constraints.sql"
      && (process.env.EFFORTLESS_ENFORCE_FKS || "false") !== "true") {
    return true;
  }
  return false;
}

async function applyPostgresBootstrap(job, domain) {
  const dir = sqlBootstrapDir(domain);
  if (!fs.existsSync(dir)) {
    phase(job, "skipped", `no SQL dir at ${path.relative(REPO_ROOT, dir)} — skipping schema/data refresh`);
    return;
  }
  const files = fs.readdirSync(dir)
    .filter((f) => /\.sql$/.test(f) && !/\.disabled$/i.test(f))
    .sort();
  if (files.length === 0) {
    phase(job, "skipped", `${path.relative(REPO_ROOT, dir)} contains no SQL files`);
    return;
  }
  const dbName = domainDbName(domain);
  for (const fname of files) {
    if (shouldSkipBootstrapFile(fname)) {
      phase(job, "skipped", `${fname} (FK enforcement opt-in via EFFORTLESS_ENFORCE_FKS=true)`);
      continue;
    }
    const cat = sqlPhaseCategory(fname);
    phase(job, cat, fname);
    try {
      await execOnePsqlFile(path.join(dir, fname), dbName);
    } catch (e) {
      // Tag the phase before bubbling so the error surface shows where it
      // happened, not just "BUILD_FAILED".
      e.phase = e.phase || cat;
      throw e;
    }
  }
}

async function verifyRowCounts(job, domain) {
  const rb = loadRulebookForDomain(domain);
  const dbName = domainDbName(domain);
  const pool = new pg.Pool({ ...PG_CONFIG, database: dbName });
  let totalRows = 0;
  const mismatches = [];
  try {
    for (const [entityName, value] of iterEntities(rb)) {
      if (entityName === "__meta__") continue;
      if (!value || !Array.isArray(value.data)) continue;
      const tableName = toSnakeCase(entityName);
      try {
        const r = await pool.query(`SELECT COUNT(*)::int AS n FROM ${tableName}`);
        const dbCount = r.rows[0].n;
        totalRows += dbCount;
        if (dbCount !== value.data.length) {
          mismatches.push({ entity: entityName, db: dbCount, rulebook: value.data.length });
        }
      } catch (e) {
        // Table missing entirely → real failure. Bubble it up via the
        // mismatches collection so the UI sees all of them, not just the first.
        mismatches.push({ entity: entityName, error: String(e.message || e).slice(0, 200) });
      }
    }
  } finally {
    await pool.end();
  }
  if (mismatches.length > 0) {
    const err = new Error(`row-count verify failed (${mismatches.length} mismatch${mismatches.length === 1 ? "" : "es"})`);
    err.phase = "verify";
    err.code = "VERIFY_FAILED";
    err.mismatches = mismatches;
    throw err;
  }
  phase(job, "verify", `row counts match (${totalRows} rows across entity tables)`);
  return totalRows;
}

// ---------------------------------------------------------------------------
// Calc-value rebake — write-through enrichment of rulebook JSON `data` rows.
//
// After any successful write (JSON-tab save, schema PATCH, instance edit), we
// query the generated vw_<entity> views for PK + calculated/lookup/aggregation
// columns and merge those values into the corresponding rulebook data rows.
// The on-disk JSON becomes self-contained: every row carries the live computed
// values that Postgres just produced from the formula in the same JSON.
//
// Not a bespoke cache (per CLAUDE.md): the rule is "every write path triggers
// re-bake," the values are deterministically derived from the rulebook itself,
// and deleting the baked values would not lose information — they regenerate
// from the same formula on the next save.
// ---------------------------------------------------------------------------

const CALC_FIELD_TYPES = new Set(["calculated", "lookup", "aggregation"]);

// findPkField (used by FK / relationship lookups) falls back to "Name" when
// no nullable:false ID field is present — fine for FK targets, but wrong for
// the rebake: Name is often calculated and absent from data rows, which
// would defeat the view→row merge. Here we need a RAW field whose values
// live in the data rows AND in the view's PK column. By ERB convention this
// is the first raw column ending in "Id" (CustomerId, EpisodeId, …), or the
// first raw column overall when no *Id field exists.
function findRebakePkField(entity) {
  const explicit = (entity.schema || []).find((f) => f.isPk === true);
  if (explicit) return explicit.name;
  const idField = (entity.schema || []).find(
    (f) => f.type === "raw" && /Id$/.test(f.name)
  );
  if (idField) return idField.name;
  const firstRaw = (entity.schema || []).find((f) => f.type === "raw");
  return firstRaw ? firstRaw.name : null;
}

// SELECT vw_<entity>(pk, calc1, calc2, ...) for every entity in `rulebook`
// that has at least one calc/lookup/aggregation field. Returns:
//   { entityName: { pkValueStr: { CalcFieldName: value, ... } } }
// Skips entities whose view is missing (logged, not fatal — the view may not
// exist yet if the schema hasn't been rebuilt for this domain).
async function extractCalcValuesFromDb({ rulebook, pool }) {
  const result = {};
  for (const [entityName, value] of iterEntities(rulebook)) {
    if (entityName === META_TABLE_NAME) continue;
    if (!Array.isArray(value.data) || value.data.length === 0) continue;
    const calcFields = (value.schema || []).filter((f) => CALC_FIELD_TYPES.has(f.type));
    if (calcFields.length === 0) continue;
    const pk = findRebakePkField(value);
    if (!pk) {
      console.warn(`[enrich] ${entityName}: no raw PK field — skipping`);
      continue;
    }
    const pkSnake = toSnakeCase(pk);
    const calcPairs = calcFields.map((f) => ({ pascal: f.name, snake: toSnakeCase(f.name) }));
    const viewName = `vw_${toSnakeCase(entityName)}`;
    const cols = [pkSnake, ...calcPairs.map((c) => c.snake)].join(", ");
    let rows;
    try {
      const r = await pool.query(`SELECT ${cols} FROM ${viewName}`);
      rows = r.rows;
    } catch (e) {
      console.warn(`[enrich] could not query ${viewName}: ${String(e.message || e).slice(0, 200)}`);
      continue;
    }
    const byPk = {};
    for (const row of rows) {
      const pkVal = row[pkSnake];
      if (pkVal === null || pkVal === undefined) continue;
      const calcVals = {};
      for (const c of calcPairs) calcVals[c.pascal] = row[c.snake];
      byPk[String(pkVal)] = calcVals;
    }
    result[entityName] = byPk;
  }
  return result;
}

// Merge calc values into rulebook data rows, matched by PK. Returns a new
// rulebook (data arrays replaced; schema and entity-level keys preserved).
function enrichRulebookWithCalcValues(rb, calcMap) {
  const out = { ...rb };
  for (const [entityName, value] of iterEntities(rb)) {
    if (!Array.isArray(value.data) || value.data.length === 0) continue;
    const calcByPk = calcMap[entityName];
    if (!calcByPk) continue;
    const pk = findRebakePkField(value);
    if (!pk) continue;
    const calcFieldNames = (value.schema || [])
      .filter((f) => CALC_FIELD_TYPES.has(f.type))
      .map((f) => f.name);
    if (calcFieldNames.length === 0) continue;
    const newData = value.data.map((row) => {
      const pkVal = row[pk];
      if (pkVal === null || pkVal === undefined) return row;
      const calcVals = calcByPk[String(pkVal)];
      if (!calcVals) return row;
      const merged = { ...row };
      for (const fn of calcFieldNames) {
        if (fn in calcVals) merged[fn] = calcVals[fn];
      }
      return merged;
    });
    out[entityName] = { ...value, data: newData };
  }
  return out;
}

// Shell `effortless build` in the project root for `domain`. Resolves on
// exit 0; rejects with the trimmed stderr tail otherwise.
function runEffortlessBuild(domain) {
  const projectRoot = (domain === "__top__") ? PLATFORM_DIR : path.join(RULEBOOK_EXAMPLES, domain);
  return new Promise((resolve, reject) => {
    const child = spawn("effortless", ["build"], { cwd: projectRoot });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) return resolve();
      const err = new Error(`effortless build exited ${code}\n${stderr.slice(-2000)}`);
      err.phase = "effortless_build";
      err.code = "BUILD_FAILED";
      reject(err);
    });
  });
}

// Run all numbered SQL files in postgres-bootstrap/ for `domain` against
// `dbName`. Out-of-job-context variant of applyPostgresBootstrap (no SSE).
async function applyPostgresBootstrapBare(domain, dbName) {
  const dir = (domain === "__top__")
    ? path.join(PLATFORM_DIR, "postgres")
    : path.join(RULEBOOK_EXAMPLES, domain, "postgres-bootstrap");
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir)
    .filter((f) => /\.sql$/.test(f) && !/\.disabled$/i.test(f))
    .sort();
  for (const fname of files) {
    if (shouldSkipBootstrapFile(fname)) continue;
    await execOnePsqlFile(path.join(dir, fname), dbName);
  }
}

// Post-schema-or-JSON-save flow:
//   effortless build → apply SQL to erb_<domain> → query views →
//   enrich rulebook JSON data rows → save JSON.
// Assumes the proposed JSON has already been written to disk and that
// validateProposedRulebook has already passed. Returns the enriched rulebook.
async function rebakeAfterSchemaChange(domain) {
  await runEffortlessBuild(domain);
  const dbName = domainDbName(domain);
  await applyPostgresBootstrapBare(domain, dbName);
  const rb = loadRulebookForDomain(domain);
  const tmpPool = new pg.Pool({ ...PG_CONFIG, database: dbName });
  let calcMap;
  try {
    calcMap = await extractCalcValuesFromDb({ rulebook: rb, pool: tmpPool });
  } finally {
    await tmpPool.end().catch(() => {});
  }
  const enriched = enrichRulebookWithCalcValues(rb, calcMap);
  if (domain === "__top__") {
    saveProjectRulebook(enriched);
  } else {
    saveRulebook(enriched, path.join(RULEBOOK_EXAMPLES, domain, "effortless-rulebook", `${domain}-rulebook.json`));
  }
  return enriched;
}

// Post-data-change flow: no build/bootstrap needed (schema unchanged).
// Reuses the passed-in pool (which already has the committed change visible)
// and re-saves the JSON with refreshed calc values. Safe to call after any
// instance PATCH/POST/DELETE that commits to erb_<domain>.
async function rebakeAfterDataChange({ domain, pool }) {
  const rb = loadRulebookForDomain(domain);
  const calcMap = await extractCalcValuesFromDb({ rulebook: rb, pool });
  const enriched = enrichRulebookWithCalcValues(rb, calcMap);
  if (domain === "__top__") {
    saveProjectRulebook(enriched);
  } else {
    saveRulebook(enriched, path.join(RULEBOOK_EXAMPLES, domain, "effortless-rulebook", `${domain}-rulebook.json`));
  }
  return enriched;
}

function startRebuildJob({ reason, domain }) {
  const id = nextRebuildId();
  const job = {
    id,
    reason,
    domain,
    status: "pending",
    events: [],
    clients: new Set(),
    startedAt: Date.now(),
  };
  rebuildJobs.set(id, job);

  // Defer to the next tick so PATCH /schema can return before the first
  // phase event lands.
  setImmediate(async () => {
    job.status = "running";
    let currentPhase = "effortless_build";
    try {
      const projectRoot = (domain === "__top__")
        ? PLATFORM_DIR
        : path.join(RULEBOOK_EXAMPLES, domain);
      phase(job, "effortless_build", `running 'effortless build' in ${path.relative(REPO_ROOT, projectRoot) || "."}`);
      await new Promise((resolve, reject) => {
        const child = spawn("effortless", ["build"], { cwd: projectRoot });
        let stderr = "";
        child.stdout.on("data", (chunk) => {
          phase(job, "effortless_build", String(chunk).trimEnd().slice(-400) || "(stdout)");
        });
        child.stderr.on("data", (chunk) => {
          stderr += chunk;
          phase(job, "effortless_build", String(chunk).trimEnd().slice(-400) || "(stderr)");
        });
        child.on("error", reject);
        child.on("close", (code) => {
          if (code === 0) resolve();
          else reject(new Error(`effortless build exited ${code}\n${stderr.slice(-2000)}`));
        });
      });

      currentPhase = "bootstrap";
      await applyPostgresBootstrap(job, domain);

      currentPhase = "verify";
      const rowsLoaded = await verifyRowCounts(job, domain);

      currentPhase = "rebake";
      phase(job, "rebake", `extracting PK + calc values from vw_* and merging into rulebook data rows`);
      const dbName = domainDbName(domain);
      const rb = loadRulebookForDomain(domain);
      const rebakePool = new pg.Pool({ ...PG_CONFIG, database: dbName });
      let calcMap;
      try {
        calcMap = await extractCalcValuesFromDb({ rulebook: rb, pool: rebakePool });
      } finally {
        await rebakePool.end().catch(() => {});
      }
      const enriched = enrichRulebookWithCalcValues(rb, calcMap);
      if (domain === "__top__") {
        saveProjectRulebook(enriched);
      } else {
        saveRulebook(enriched, path.join(RULEBOOK_EXAMPLES, domain, "effortless-rulebook", `${domain}-rulebook.json`));
      }
      phase(job, "rebake", `rulebook re-saved with calc values for ${Object.keys(calcMap).length} entity(s)`);

      finishJob(job, "done", { durationMs: Date.now() - job.startedAt, rowsLoaded });
    } catch (e) {
      finishJob(job, "error", {
        phase: e.phase || currentPhase,
        code: e.code || "BUILD_FAILED",
        msg: String(e.message || e),
        ...(e.mismatches ? { mismatches: e.mismatches } : {}),
      });
    }
  });

  return id;
}

// Parse an RFC-6901 JSON Pointer like "/Customers/schema/3/name" into a
// path array ["Customers", "schema", 3, "name"]. Numeric segments are
// coerced to integers so they can index arrays correctly.
function parseJsonPointer(pointer) {
  if (pointer === "" || pointer === "/") return [];
  if (!pointer.startsWith("/")) throw new Error("pointer must start with /");
  return pointer.split("/").slice(1).map((seg) => {
    const decoded = seg.replace(/~1/g, "/").replace(/~0/g, "~");
    if (/^\d+$/.test(decoded)) return parseInt(decoded, 10);
    return decoded;
  });
}

// §2.7 allow-list of schema-PATCH pointers. Anything else is 400.
// The root pointer "" (from "/") is the entity-create shape: value must be
// { name, definition } and a new top-level entity is added to the rulebook.
function validateSchemaPatchPointer(path, value) {
  if (path.length === 0) {
    if (!value || typeof value !== "object" || !value.name || !value.definition) {
      throw new Error("root-pointer PATCH requires body { name, definition } — see §2.7 entity create");
    }
    return;
  }
  if (path.length < 2) {
    throw new Error("pointer must address a property on an entity (e.g. /Entity/Description)");
  }
  const [entity, key, idx, prop] = path;
  if (typeof entity !== "string") throw new Error("first segment must be the entity name");
  if (key === "Description" || key === "important") return;
  if (key === "schema") {
    if (path.length === 2) return;                                      // /<E>/schema
    if (path.length === 3 && Number.isInteger(idx)) return;             // /<E>/schema/<i>
    if (path.length === 4 && Number.isInteger(idx) && typeof prop === "string") return; // /<E>/schema/<i>/<key>
  }
  throw new Error(`unsupported pointer ${path.map(String).join("/")} — see DOMAIN_UX_VISION.md §2.7`);
}

app.patch("/api/explorer/schema", requireEditor, async (req, res) => {
  const { pointer, value } = req.body || {};
  if (typeof pointer !== "string") {
    return res.status(400).json({ error: "pointer (JSON Pointer string) is required" });
  }
  try {
    const domain = requireDomain(req);
    const path = parseJsonPointer(pointer);
    validateSchemaPatchPointer(path, value);

    await writeThrough({
      domain,
      pgWrite: async () => {},
      rulebookMutate: (rb) => {
        if (path.length === 0) {
          // Entity create. value = { name, definition }
          if (rb[value.name]) {
            throw new Error(`entity '${value.name}' already exists`);
          }
          rb[value.name] = value.definition;
          return rb;
        }
        if (!rb[path[0]]) throw new Error(`entity '${path[0]}' not in rulebook`);
        setByPath(rb, path, value);
        return rb;
      },
    });
    await recordAudit({ userId: getCurrentUser()?.UserId, action: "schema.patch", target: `${domain}${pointer || "/"}`, payload: { pointer, value } });

    const rebuildId = startRebuildJob({
      reason: path.length === 0 ? `entity create: ${value.name}` : `schema patch: ${pointer}`,
      domain,
    });
    res.status(202).json({
      rebuildId,
      status: "pending",
      streamUrl: `/api/explorer/rebuild/${encodeURIComponent(rebuildId)}/stream`,
    });
  } catch (e) {
    res.status(e.status || 400).json({
      error: String(e.message || e),
      transpilerOutput: e.transpilerOutput || null,
    });
  }
});

// §2.7 entity delete. ?entity=<name>. Removes the entity top-level entry from
// the rulebook (data + schema both); the rebuild's drop-table-if-exists
// machinery cleans up the SQL side.
app.delete("/api/explorer/schema", requireEditor, async (req, res) => {
  const entityName = req.query.entity;
  if (!entityName || typeof entityName !== "string") {
    return res.status(400).json({ error: "entity query param required" });
  }
  try {
    const domain = requireDomain(req);
    const rb = loadRulebookForDomain(domain);
    if (!rb[entityName] || !Array.isArray(rb[entityName].schema)) {
      return res.status(404).json({ error: `entity '${entityName}' not found` });
    }
    // Refuse if any other entity has a forward FK pointing at this one —
    // surfacing the references gives the user something actionable.
    const referrers = [];
    for (const [otherName, otherValue] of iterEntities(rb)) {
      if (otherName === entityName) continue;
      for (const f of otherValue.schema || []) {
        if (f.type === "relationship" && f.RelatedTo === entityName
            && !isInverseRelationshipField(f, otherValue.data)) {
          referrers.push({ entity: otherName, viaFk: f.name });
        }
      }
    }
    if (referrers.length > 0) {
      return res.status(409).json({
        error: `${entityName} is referenced by ${referrers.length} FK(s); detach them first`,
        referrers,
      });
    }

    await writeThrough({
      domain,
      pgWrite: async () => {
        // The actual entity table gets cleaned up by the rebuild's
        // bootstrap phase (its DROP TABLE IF EXISTS now finds nothing in
        // the regenerated SQL, so the table goes away).
      },
      rulebookMutate: (rb2) => {
        if (!rb2[entityName]) throw new Error(`entity '${entityName}' no longer present`);
        delete rb2[entityName];
        return rb2;
      },
    });
    await recordAudit({ userId: getCurrentUser()?.UserId, action: "schema.entityDelete", target: `${domain}/${entityName}`, payload: { entity: entityName } });

    const rebuildId = startRebuildJob({
      reason: `entity delete: ${entityName}`,
      domain,
    });
    res.status(202).json({
      rebuildId,
      status: "pending",
      streamUrl: `/api/explorer/rebuild/${encodeURIComponent(rebuildId)}/stream`,
    });
  } catch (e) {
    res.status(e.status || 500).json({ error: String(e.message || e) });
  }
});

app.post("/api/explorer/rebuild", requireEditor, (req, res) => {
  try {
    const domain = requireDomain(req);
    const rebuildId = startRebuildJob({
      reason: "manual rebuild",
      domain,
    });
    res.status(202).json({
      rebuildId,
      status: "pending",
      streamUrl: `/api/explorer/rebuild/${encodeURIComponent(rebuildId)}/stream`,
    });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// SSE stream for a rebuild job. Replays the captured event log on connect
// so a client that opens the stream after the first phase still gets every
// event. The connection stays open until the job finishes (or the client
// disconnects).
app.get("/api/explorer/rebuild/:id/stream", (req, res) => {
  const job = rebuildJobs.get(req.params.id);
  if (!job) {
    res.status(404).json({ error: `rebuild ${req.params.id} not found` });
    return;
  }
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  // Replay captured events for this job.
  for (const e of job.events) {
    res.write(`event: ${e.event}\ndata: ${JSON.stringify(e.data)}\n\n`);
  }

  if (job.status === "done" || job.status === "error") {
    res.end();
    return;
  }
  job.clients.add(res);
  req.on("close", () => { job.clients.delete(res); });
});

// Read-only job status (handy for clients that prefer polling, and for
// debugging via curl).
app.get("/api/explorer/rebuild/:id", (req, res) => {
  const job = rebuildJobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: "not found" });
  res.json({
    id: job.id,
    status: job.status,
    reason: job.reason,
    domain: job.domain,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt || null,
    durationMs: job.durationMs || null,
    events: job.events,
  });
});

// -----------------------------------------------------------------------------
// Rulebook git surface — diff + revert
// -----------------------------------------------------------------------------
// §2.8 decision 3: failed rebuilds aren't auto-rolled back; the rulebook JSON
// stays in its edited state. The UI offers a "Revert via git checkout" button
// that hits POST /rulebook-revert below. The revert is ALWAYS user-initiated;
// CLAUDE.md "Never silently revert a rulebook JSON" forbids the server from
// doing it without an explicit request.

function runGit(args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn("git", args, { cwd });
    let stdout = "", stderr = "";
    child.stdout.on("data", (c) => { stdout += c; });
    child.stderr.on("data", (c) => { stderr += c; });
    child.on("error", reject);
    child.on("close", (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

app.get("/api/explorer/rulebook-diff", async (req, res) => {
  const domain = requireDomain(req);
  const rbPath = rulebookPathFor(domain);
  if (!fs.existsSync(rbPath)) {
    return res.status(404).json({ error: `rulebook not found at ${rbPath}` });
  }
  const relPath = path.relative(REPO_ROOT, rbPath);
  try {
    const r = await runGit(["diff", "--no-color", "--", relPath], REPO_ROOT);
    if (r.code !== 0 && !r.stdout) {
      return res.status(500).json({ error: `git diff exited ${r.code}: ${r.stderr.slice(-400)}` });
    }
    res.json({ domain, path: relPath, diff: r.stdout, dirty: r.stdout.length > 0 });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.post("/api/explorer/rulebook-revert", requireEditor, async (req, res) => {
  const domain = requireDomain(req);
  const rbPath = rulebookPathFor(domain);
  if (!fs.existsSync(rbPath)) {
    return res.status(404).json({ error: `rulebook not found at ${rbPath}` });
  }
  const relPath = path.relative(REPO_ROOT, rbPath);
  try {
    // Log BEFORE the destructive op so audit captures intent even if checkout
    // fails. Per "Never silently revert a rulebook JSON": this codepath is
    // reachable only via explicit user click on the failed-rebuild surface.
    await recordAudit({ userId: getCurrentUser()?.UserId, action: "rulebook.revert", target: relPath, payload: { domain } });

    const r = await runGit(["checkout", "--", relPath], REPO_ROOT);
    if (r.code !== 0) {
      return res.status(500).json({ error: `git checkout exited ${r.code}: ${r.stderr.slice(-400)}` });
    }
    res.json({ ok: true, domain, path: relPath, msg: "rulebook reverted to git HEAD" });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// --- users (PROJECT-rulebook resource; writes to project rulebook) ---
app.get("/api/users", (req, res) => {
  const project = loadProjectRulebook();
  res.json({
    users: (project.AppUsers && project.AppUsers.data) || [],
    roles: (project.UserRoles && project.UserRoles.data) || [],
  });
});

app.post("/api/users", requireUserManager, async (req, res) => {
  const { userId, email, displayName, roleId } = req.body || {};
  if (!userId || !email || !roleId) return res.status(400).json({ error: "missing fields" });
  try {
    // AppUsers lives in the PROJECT rulebook, mirrored into portal_app_users
    // in `erb_admin_portal`. Both writes go through the admin pool in one TXN.
    const p = await getAdminPool();
    const client = await p.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO portal_app_users (user_id, email, display_name, role_id) VALUES ($1,$2,$3,$4)`,
        [userId, email, displayName || email, roleId]
      );
      const project = loadProjectRulebook();
      project.AppUsers = project.AppUsers || { Description: "", schema: [], data: [] };
      project.AppUsers.data = project.AppUsers.data || [];
      project.AppUsers.data.push({
        UserId: userId, Email: email, DisplayName: displayName || email,
        RoleId: roleId, IsDefault: false, Notes: null,
      });
      saveProjectRulebook(project);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK").catch(() => {});
      throw e;
    } finally {
      client.release();
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// --- platform features (PROJECT-rulebook resource) ---
// PlatformFeatures is the formal SSoT for what ERB does. Hand-maintained
// per-feature README files MUST conform to these rows. IsReadmeStub is
// computed from the README's on-disk length (overrides the rulebook's
// optional ReadmeLength when the file exists).
function readmeOnDiskLength(relPath) {
  if (!relPath) return null;
  const abs = path.join(REPO_ROOT, relPath);
  if (!fs.existsSync(abs)) return 0;
  return fs.statSync(abs).size;
}
function decorateFeature(row) {
  const onDisk = readmeOnDiskLength(row.ReadmeFilePath);
  const len = onDisk == null ? row.ReadmeLength : onDisk;
  return {
    ...row,
    ReadmeOnDiskLength: onDisk,
    EffectiveReadmeLength: len,
    IsReadmeStub: len == null || len < 400,
  };
}

app.get("/api/features", (req, res) => {
  const project = loadProjectRulebook();
  const rows = (project.PlatformFeatures && project.PlatformFeatures.data) || [];
  const decorated = rows.map(decorateFeature).sort((a, b) => {
    if (a.Tier !== b.Tier) return a.Tier === "headline" ? -1 : 1;
    return (a.Priority || 0) - (b.Priority || 0);
  });
  res.json({
    headline: decorated.filter((r) => r.Tier === "headline"),
    additional: decorated.filter((r) => r.Tier !== "headline"),
  });
});

app.get("/api/features/:id", (req, res) => {
  const project = loadProjectRulebook();
  const rows = (project.PlatformFeatures && project.PlatformFeatures.data) || [];
  const row = rows.find((r) => r.FeatureId === req.params.id);
  if (!row) return res.status(404).json({ error: "not found" });
  const axiom = row.RelatedAxiomId
    ? (project.OntologyAxioms?.data || []).find((a) => a.AxiomId === row.RelatedAxiomId) || null
    : null;
  // Resolve on-disk README content (best-effort; null if missing).
  let readmeOnDisk = null;
  if (row.ReadmeFilePath) {
    const abs = path.join(REPO_ROOT, row.ReadmeFilePath);
    if (fs.existsSync(abs)) readmeOnDisk = fs.readFileSync(abs, "utf8");
  }
  res.json({ ...decorateFeature(row), Axiom: axiom, ReadmeOnDisk: readmeOnDisk });
});

const FEATURE_PATCHABLE = new Set([
  "Name", "ShortName", "Tier", "Priority", "OneLineSummary",
  "ReadmeFilePath", "ReadmeStubContent", "Status", "RelatedAxiomId",
]);
app.patch("/api/features/:id", requireEditor, async (req, res) => {
  const id = req.params.id;
  const updates = {};
  for (const [k, v] of Object.entries(req.body || {})) {
    if (FEATURE_PATCHABLE.has(k)) updates[k] = v;
  }
  if (!Object.keys(updates).length) {
    return res.status(400).json({ error: "no patchable fields in body" });
  }
  try {
    // PlatformFeatures lives in the platform rulebook → admin DB.
    const p = await getAdminPool();
    const client = await p.connect();
    try {
      await client.query("BEGIN");
      const project = loadProjectRulebook();
      if (!project.PlatformFeatures || !Array.isArray(project.PlatformFeatures.data)) {
        throw new Error("PlatformFeatures table missing from project rulebook");
      }
      const idx = project.PlatformFeatures.data.findIndex((r) => r.FeatureId === id);
      if (idx === -1) throw new Error(`Feature ${id} not found`);
      Object.assign(project.PlatformFeatures.data[idx], updates);
      await client.query(
        `INSERT INTO portal_audit_log (user_id, action, target, payload)
         VALUES ($1, 'feature.update', $2, $3)`,
        [getCurrentUser()?.UserId || null, id, JSON.stringify(updates)]
      );
      saveProjectRulebook(project);
      await client.query("COMMIT");
      res.json({ ok: true, feature: decorateFeature(project.PlatformFeatures.data[idx]) });
    } catch (e) {
      await client.query("ROLLBACK").catch(() => {});
      throw e;
    } finally {
      client.release();
    }
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// --- substrates (PROJECT-rulebook resource) ---
app.get("/api/substrates", async (req, res) => {
  try {
    const domain = requireDomain(req);
    const project = loadProjectRulebook();
    const subs = (project.ExecutionSubstrates && project.ExecutionSubstrates.data) || [];
    const root = projectRootFor(domain);
    const enriched = subs.map((s) => {
      const rel = s.RelativePath || "";
      const full = path.join(root, rel.replace(/^execution-substrates\//, ""));
      const exists = fs.existsSync(full);
      return { ...s, fullPath: full, exists };
    });
    res.json(enriched);
  } catch (e) {
    res.status(e.status || 500).json({ error: String(e.message || e) });
  }
});

// --- build ---
app.post("/api/build/all", requireBuilder, (req, res) => {
  let domain;
  try { domain = requireDomain(req); }
  catch (e) { return res.status(e.status || 400).json({ error: String(e.message || e) }); }
  const cwd = projectRootFor(domain);
  exec("effortless build", { cwd, env: { ...process.env, ERB_DOMAIN: domain } }, (err, stdout, stderr) => {
    res.json({
      ok: !err,
      cwd,
      stdout: stdout?.slice(-8000) || "",
      stderr: stderr?.slice(-8000) || "",
      error: err ? String(err.message || err) : null,
    });
  });
});

// --- tools (Add Tool — PROJECT-rulebook resource: AddToolCatalog) ---
app.get("/api/tools/catalog", async (req, res) => {
  const project = loadProjectRulebook();
  const fromRulebook = (project.AddToolCatalog && project.AddToolCatalog.data) || [];
  let liveProxy = null;
  try {
    const p = await fetchJson(`${PROXY_URL}/ping`);
    liveProxy = p.body;
  } catch (e) {
    liveProxy = { error: String(e.message || e) };
  }
  res.json({ fromRulebook, liveProxy, proxyUrl: PROXY_URL });
});

app.get("/api/tools/installed", (req, res) => {
  try {
    const domain = requireDomain(req);
    const cwd = projectRootFor(domain);
    const f = path.join(cwd, "effortless.json");
    if (!fs.existsSync(f)) return res.json({ projectRoot: cwd, transpilers: [] });
    const j = JSON.parse(fs.readFileSync(f, "utf8"));
    res.json({ projectRoot: cwd, transpilers: j.ProjectTranspilers || [] });
  } catch (e) {
    res.status(e.status || 500).json({ error: String(e.message || e) });
  }
});

app.post("/api/tools/install", requireBuilder, (req, res) => {
  const { installUrl, outputPath } = req.body || {};
  if (!installUrl) return res.status(400).json({ error: "installUrl required" });
  let domain;
  try { domain = requireDomain(req); }
  catch (e) { return res.status(e.status || 400).json({ error: String(e.message || e) }); }
  const cwd = projectRootFor(domain);
  // Resolve rulebook path RELATIVE to the chosen outputPath inside the project,
  // matching how `effortless -install` expects: run from the output dir.
  const outDir = outputPath ? path.join(cwd, outputPath) : cwd;
  fs.mkdirSync(outDir, { recursive: true });
  const rulebookRel = path.relative(outDir, rulebookPathFor(domain));
  const cmd = `effortless -install ${JSON.stringify(installUrl)} -i ${JSON.stringify(rulebookRel)}`;
  exec(cmd, { cwd: outDir }, (err, stdout, stderr) => {
    res.json({
      ok: !err,
      cmd,
      cwd: outDir,
      stdout: stdout?.slice(-8000) || "",
      stderr: stderr?.slice(-8000) || "",
      error: err ? String(err.message || err) : null,
    });
  });
});

// =============================================================================
// Effortless Tools — folder/tool tree (§3 of DOMAIN_UX_VISION.md)
// =============================================================================
// `GET /api/effortless-tools/tree` is the source of truth for the new Tools
// page's left rail. It mirrors the active project's actual on-disk folder
// structure under the project root, parses the project's effortless.json,
// and attributes each ProjectTranspilers entry to the folder its RelativePath
// points at. Folders that exist on disk but have no tool attribution still
// appear in the tree (with empty tool lists) so the +-to-add row in §3.2 has
// somewhere to live.
//
// This endpoint replaces the lying combination of `/api/substrates` (reads
// the platform rulebook — same ~10 entries regardless of domain) and
// `/api/tools/installed` (reads only the root effortless.json, ignores
// classification). Everything here comes from THIS project's on-disk state.
// =============================================================================

// Skip dotfile dirs and node_modules; everything else is a real project
// subfolder worth showing in the tree (per §3.1: empty folders still appear).
function isProjectSubfolder(name) {
  if (!name) return false;
  if (name.startsWith(".")) return false;
  if (name === "node_modules") return false;
  return true;
}

// Extract the transpiler "executable" name from an effortless.json
// CommandLine. Examples:
//   "rulebook-to-postgres -i ..."                       → "rulebook-to-postgres"
//   "http://localhost:4242/rulebook-to-python -i ..."   → "rulebook-to-python"
//   "airtable-to-rulebook -o ... -account airtable"     → "airtable-to-rulebook"
//   "-exec ./init-db.sh"                                → "./init-db.sh" (isExec)
function parseToolFromCommandLine(cmd) {
  const trimmed = (cmd || "").trim();
  if (!trimmed) return { displayName: "", installUrl: null, isExec: false };
  const tokens = trimmed.split(/\s+/);
  const first = tokens[0];
  if (first === "-exec") {
    return { displayName: tokens[1] || "-exec", installUrl: null, isExec: true };
  }
  if (first.startsWith("http://") || first.startsWith("https://")) {
    const tail = first.replace(/^https?:\/\/[^/]+\//, "");
    return { displayName: tail || first, installUrl: first, isExec: false };
  }
  return { displayName: first, installUrl: null, isExec: false };
}

// Classify a tool. Three platform-level "docs" tools get bespoke pages per
// §3.4 (airtable-to-rulebook, rulebook-to-english, rulebook-to-test-suite).
// Everything else `rulebook-to-X` is a substitutable execution-substrate.
const PLATFORM_DOCS_TOOLS = new Set([
  "airtable-to-rulebook",
  "rulebook-to-english",
  "rulebook-to-test-suite",
]);

function classifyTool(displayName, isExec) {
  if (isExec) return "exec-hook";
  if (PLATFORM_DOCS_TOOLS.has(displayName)) return "platform-docs";
  if (displayName.startsWith("airtable-to-")) return "input-spoke";
  if (displayName === "rulebook-to-airtable") return "input-spoke";
  return "execution-substrate";
}

// Normalize an effortless.json RelativePath ("/python", "python", "")
// into a tree-folder path relative to the project root. Empty string ("")
// means the project root itself.
function normalizeFolderPath(rel) {
  if (!rel) return "";
  const trimmed = String(rel).replace(/^\/+|\/+$/g, "");
  return trimmed;
}

app.get("/api/effortless-tools/tree", (req, res) => {
  try {
    const domain = requireDomain(req);
    const projectRoot = projectRootFor(domain);
    const effortlessJsonAbs = path.join(projectRoot, "effortless.json");
    if (!fs.existsSync(effortlessJsonAbs)) {
      return res.status(404).json({
        error: `effortless.json not found at ${effortlessJsonAbs}`,
        domain, projectRoot,
      });
    }
    const cfg = JSON.parse(fs.readFileSync(effortlessJsonAbs, "utf8"));
    const transpilers = Array.isArray(cfg.ProjectTranspilers)
      ? cfg.ProjectTranspilers
      : [];

    // Group tools by their attributed folder path.
    const toolsByFolder = new Map();
    transpilers.forEach((t, idx) => {
      const folderPath = normalizeFolderPath(t.RelativePath);
      const { displayName, installUrl, isExec } = parseToolFromCommandLine(t.CommandLine);
      const kind = classifyTool(displayName, isExec);
      const tool = {
        id: `${cfg.Name || domain}__${idx}__${t.Name || displayName}`,
        name: t.Name || "",
        displayName,
        kind,
        installUrl,
        relativePath: t.RelativePath || "",
        commandLine: t.CommandLine || "",
        isDisabled: !!t.IsDisabled,
        lastVersionUsed: t.LastVersionUsed || null,
        lastUrl: t.LastUrl || null,
        description: t.Description || "",
      };
      if (!toolsByFolder.has(folderPath)) toolsByFolder.set(folderPath, []);
      toolsByFolder.get(folderPath).push(tool);
    });

    // Discover folders that exist on disk (one level deep — the tree's
    // visible structure in §3.1 is one level under the project root).
    const onDiskFolders = new Set();
    for (const entry of fs.readdirSync(projectRoot, { withFileTypes: true })) {
      if (entry.isDirectory() && isProjectSubfolder(entry.name)) {
        onDiskFolders.add(entry.name);
      }
    }

    // Union: every folder we know about — either real on disk, or
    // attributed by a tool's RelativePath (which may point at a folder
    // that hasn't been created yet because the tool hasn't been run).
    const allFolderPaths = new Set(["", ...onDiskFolders, ...toolsByFolder.keys()]);

    const folders = [...allFolderPaths]
      .sort((a, b) => {
        if (a === "") return -1;
        if (b === "") return 1;
        return a.localeCompare(b);
      })
      .map((p) => {
        const abs = p === "" ? projectRoot : path.join(projectRoot, p);
        return {
          path: p,
          name: p === "" ? (cfg.Name || path.basename(projectRoot)) : p,
          existsOnDisk: fs.existsSync(abs),
          tools: toolsByFolder.get(p) || [],
        };
      });

    res.json({
      domain,
      projectName: cfg.Name || null,
      projectRoot,
      effortlessJsonPath: path.relative(projectRoot, effortlessJsonAbs),
      rulebookPath: path.relative(projectRoot, rulebookPathFor(domain)),
      folders,
    });
  } catch (e) {
    res.status(e.status || 500).json({ error: String(e.message || e) });
  }
});

// --- tech tools ---
app.get("/api/tech/postgres/tables", requireDeveloper, async (req, res) => {
  try {
    const domain = requireDomain(req);
    const p = await getDomainPool(domain);
    const r = await p.query(
      `SELECT table_schema, table_name
         FROM information_schema.tables
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY 1, 2`
    );
    res.json({ database: domainDbName(domain), tables: r.rows });
  } catch (e) {
    res.status(e.status || 500).json({ error: String(e.message || e) });
  }
});

app.post("/api/tech/postgres/query", requireDeveloper, async (req, res) => {
  const { sql } = req.body || {};
  if (!sql) return res.status(400).json({ error: "sql required" });
  try {
    const domain = requireDomain(req);
    const p = await getDomainPool(domain);
    const r = await p.query(sql);
    res.json({
      command: r.command,
      rowCount: r.rowCount,
      fields: r.fields?.map((f) => f.name) || [],
      rows: Array.isArray(r.rows) ? r.rows.slice(0, 500) : [],
    });
  } catch (e) {
    res.status(e.status || 400).json({ error: String(e.message || e) });
  }
});

app.get("/api/tech/proxy/status", requireDeveloper, async (req, res) => {
  try {
    const r = await fetchJson(`${PROXY_URL}/ping`);
    res.json({ url: PROXY_URL, ...r });
  } catch (e) {
    res.status(503).json({ url: PROXY_URL, error: String(e.message || e) });
  }
});

app.get("/api/tech/rulebook-json", requireDeveloper, (req, res) => {
  try {
    const domain = requireDomain(req);
    res.type("application/json").send(fs.readFileSync(rulebookPathFor(domain), "utf8"));
  } catch (e) {
    res.status(e.status || 500).json({ error: String(e.message || e) });
  }
});

app.put("/api/tech/rulebook-json", requireDeveloper, async (req, res) => {
  // The body MUST arrive as a string (text/plain) or a non-empty object
  // (application/json). If a client sends a JSON body with the wrong
  // Content-Type, express never parses it and req.body is `{}` — we used to
  // silently persist that `{}` and wipe the rulebook. Refuse instead.
  let domain;
  try { domain = requireDomain(req); }
  catch (e) { return res.status(e.status || 400).json({ error: String(e.message || e) }); }
  let text;
  if (typeof req.body === "string") {
    if (req.body.trim() === "") {
      return res.status(400).json({
        error: "empty request body — rulebook PUT requires the full JSON text",
      });
    }
    text = req.body;
  } else if (req.body && typeof req.body === "object" && Object.keys(req.body).length > 0) {
    text = JSON.stringify(req.body, null, 2);
  } else {
    return res.status(400).json({
      error: "rulebook PUT received an empty/unparsed body — check Content-Type (use application/json or text/plain) and that the body is not empty",
    });
  }
  try {
    const parsed = JSON.parse(text);
    await validateProposedRulebook(parsed);
    saveRulebookForDomain(parsed, domain);
    // Force the per-domain pool to drop so it bootstraps fresh against the
    // possibly-changed schema before re-baking.
    if (domain !== TOP_DOMAIN) {
      const existing = domainPools.get(domain);
      if (existing) { try { await existing.end(); } catch {} }
      domainPools.delete(domain);
    }
    const enriched = await rebakeAfterSchemaChange(domain);
    await getDomainPool(domain);
    res.json({
      ok: true,
      rebaked: true,
      bakedEntities: Object.keys(enriched).filter((n) => n !== META_TABLE_NAME && enriched[n]?.data?.length),
    });
  } catch (e) {
    res.status(e.status || 400).json({
      error: String(e.message || e),
      transpilerOutput: e.transpilerOutput || null,
      phase: e.phase || null,
      code: e.code || null,
    });
  }
});

app.post("/api/tech/reset", requireDeveloper, async (req, res) => {
  // Drop the per-domain editor DB and rebuild from rulebook JSON.
  let domain;
  try { domain = requireDomain(req); }
  catch (e) { return res.status(e.status || 400).json({ error: String(e.message || e) }); }
  if (domain === TOP_DOMAIN) {
    return res.status(400).json({ error: "refusing to drop the admin DB via /api/tech/reset" });
  }
  const existing = domainPools.get(domain);
  if (existing) { try { await existing.end(); } catch {} }
  domainPools.delete(domain);
  const dbName = domainDbName(domain);
  const root = new pg.Client({ ...PG_CONFIG, database: "postgres" });
  await root.connect();
  try {
    await root.query(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname=$1 AND pid<>pg_backend_pid()`, [dbName]);
    await root.query(`DROP DATABASE IF EXISTS "${dbName}"`);
  } finally {
    await root.end();
  }
  await getDomainPool(domain);
  res.json({ ok: true, dbName });
});

// ---------------------------------------------------------------------------
// Per-domain app launch + Postgres<->rulebook import/export
// ---------------------------------------------------------------------------

// Parse a domain's start.sh for the URL the app serves on. start.sh files are
// heterogeneous: some set PORT=<n>, some CLIENT_PORT/API_PORT, some only print
// http://localhost:$VAR. We collect every *PORT*=<n> assignment and every
// literal/variable localhost URL, then prefer the user-facing client port. 5432
// (Postgres) is always ignored. Returns null if undetectable — we never guess a
// wrong URL (an honest "couldn't tell" beats a plausible-looking lie).
function detectAppUrl(startShPath) {
  let txt;
  try { txt = fs.readFileSync(startShPath, "utf8"); } catch { return null; }

  // 1) Map every <NAME>PORT[<NAME>] = <number> assignment. Line-based so it
  //    handles literal (PORT=4801), default-expansion (WEB_PORT="${WEB_PORT:-5175}")
  //    and quoted forms alike: grab the first 2-5 digit number on the line.
  const ports = {}; // varName -> port string
  for (const line of txt.split("\n")) {
    const nameM = line.match(/\b([A-Z0-9_]*PORT[A-Z0-9_]*)\s*=/i);
    if (!nameM) continue;
    const numM = line.slice(nameM.index).match(/(\d{2,5})/);
    if (numM && numM[1] !== "5432") ports[nameM[1].toUpperCase()] = numM[1];
  }
  // 2) Literal localhost URLs (e.g. http://localhost:3000).
  const literalUrlPorts = [...txt.matchAll(/https?:\/\/localhost:(\d{2,5})/gi)]
    .map((m) => m[1]).filter((p) => p !== "5432");
  // 3) localhost:$VAR / localhost:${VAR} references resolved via the port map.
  const varUrlPorts = [...txt.matchAll(/https?:\/\/localhost:\$\{?([A-Z0-9_]+)\}?/gi)]
    .map((m) => ports[m[1]]).filter(Boolean);

  const pick = (re) => Object.keys(ports).find((k) => re.test(k));
  // Prefer the client/web/front/app-facing port; that's the test URL.
  const clientVar = pick(/CLIENT|WEB|FRONT|UI|APP/i);
  if (clientVar) return `http://localhost:${ports[clientVar]}`;
  if (varUrlPorts.length) return `http://localhost:${varUrlPorts[0]}`;
  if (literalUrlPorts.length) return `http://localhost:${literalUrlPorts[0]}`;
  const plainPort = ports.PORT || Object.values(ports)[0];
  if (plainPort) return `http://localhost:${plainPort}`;
  return null;
}

// POST /api/tech/launch?domain= — run the domain's start.sh detached so the
// app boots independently of the portal request, and hand back the test URL.
app.post("/api/tech/launch", requireDeveloper, async (req, res) => {
  let domain;
  try { domain = requireDomain(req); }
  catch (e) { return res.status(e.status || 400).json({ error: String(e.message || e) }); }
  if (domain === TOP_DOMAIN) {
    return res.status(400).json({ error: "the platform is the running portal — there is no separate per-domain app to launch" });
  }
  const root = projectRootFor(domain);
  const startSh = path.join(root, "start.sh");
  if (!fs.existsSync(startSh)) {
    return res.status(404).json({ error: `no start.sh for '${domain}' — this domain has no runnable app`, hasApp: false });
  }
  const url = detectAppUrl(startSh);
  const logPath = path.join(root, ".app-launch.log");
  let child;
  try {
    const out = fs.openSync(logPath, "a");
    child = spawn("bash", ["start.sh"], {
      cwd: root,
      detached: true,
      stdio: ["ignore", out, out],
      env: { ...process.env, ERB_DOMAIN: domain },
    });
    child.unref();
  } catch (e) {
    return res.status(500).json({ error: `failed to launch start.sh: ${String(e.message || e)}` });
  }
  res.json({ ok: true, domain, pid: child.pid, url, logPath,
    note: url ? null : "launched, but could not detect the app URL from start.sh — check the log" });
});

// GET /api/tech/export-rulebook?domain= — download the current rulebook JSON.
app.get("/api/tech/export-rulebook", requireDeveloper, (req, res) => {
  let domain;
  try { domain = requireDomain(req); }
  catch (e) { return res.status(e.status || 400).json({ error: String(e.message || e) }); }
  const p = rulebookPathFor(domain);
  if (!fs.existsSync(p)) return res.status(404).json({ error: `no rulebook found for '${domain}'` });
  res.download(p, path.basename(p));
});

// POST /api/tech/import-from-postgres?domain=  body: { confirm: true }
// EXPLICIT, raws-overwriting import: adopts the current Postgres state (incl.
// edits/new rows made in the app or portal) AS the rulebook's new seed data.
// This is the ONLY portal path that writes raw values back to the rulebook, it
// requires {confirm:true}, and it is never invoked automatically on build.
//
// Two-step: (1) pull-from-postgres.sh exports raw table data to .pg-raw-data.json,
//           (2) Python transpiler reads that JSON and merges raw values into rulebook.
app.post("/api/tech/import-from-postgres", requireDeveloper, async (req, res) => {
  let domain;
  try { domain = requireDomain(req); }
  catch (e) { return res.status(e.status || 400).json({ error: String(e.message || e) }); }
  if (domain === TOP_DOMAIN) {
    return res.status(400).json({ error: "import-from-postgres is for demo domains, not the platform rulebook" });
  }
  if (!req.body || req.body.confirm !== true) {
    return res.status(400).json({
      error: "this OVERWRITES the rulebook's raw seed data with the current Postgres data (adopting any app/portal edits as the new seed). Resend with { confirm: true } to proceed.",
      requiresConfirm: true,
    });
  }
  const bootstrapDir = path.join(RULEBOOK_EXAMPLES, domain, "postgres-bootstrap");
  const pullScript = path.join(bootstrapDir, "pull-from-postgres.sh");
  const transpiler = path.join(PLATFORM_DIR, "execution-substrates", "postgres-calculated-to-rulebook", "inject-into-postgres-calculated-to-rulebook.py");
  const rbPath = rulebookPathFor(domain);

  if (!fs.existsSync(bootstrapDir)) {
    return res.status(400).json({ error: `no postgres-bootstrap folder for domain '${domain}' — import not supported` });
  }
  if (!fs.existsSync(pullScript)) {
    return res.status(500).json({ error: `pull-from-postgres.sh missing: ${pullScript}` });
  }
  if (!fs.existsSync(transpiler)) {
    return res.status(500).json({ error: `transpiler missing: ${transpiler}` });
  }

  function runChild(cmd, args, opts) {
    return new Promise((resolve, reject) => {
      const child = spawn(cmd, args, opts);
      let stdout = "", stderr = "";
      child.stdout.on("data", (c) => { stdout += c; });
      child.stderr.on("data", (c) => { stderr += c; });
      child.on("error", reject);
      child.on("close", (code) => {
        if (code === 0) resolve({ stdout, stderr });
        else {
          const err = new Error(stderr.slice(-4000) || `exited ${code}`);
          err.stdout = stdout;
          reject(err);
        }
      });
    });
  }

  try {
    // Step 1: export raw base-table data as JSON
    await runChild("bash", [pullScript], { cwd: bootstrapDir, env: process.env });

    // Step 2: merge JSON into rulebook
    const { stdout } = await runChild("python3", [transpiler], {
      cwd: bootstrapDir,
      env: { ...process.env, ERB_RULEBOOK_PATH: rbPath },
    });

    // Rulebook now mirrors Postgres; drop cached pool so next read re-bootstraps.
    if (domain !== TOP_DOMAIN) {
      const existing = domainPools.get(domain);
      if (existing) { try { await existing.end(); } catch {} }
      domainPools.delete(domain);
    }
    res.json({ ok: true, domain, output: stdout });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e), output: e.stdout || null });
  }
});

// --- static frontend ---
app.use("/", express.static(path.join(__dirname, "web")));

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
(async () => {
  try {
    await getAdminPool();
    console.log(`[portal] admin DB ready: ${ADMIN_DB_NAME}`);
  } catch (e) {
    console.error(`[portal] WARNING — could not init admin Postgres: ${e.message}`);
    console.error(`[portal] portal will still serve, but DB-backed features will fail.`);
  }
  await reconcileFlavorsOnBoot();
  app.listen(PORT, () => {
    console.log(`[portal] http://localhost:${PORT}`);
    console.log(`[portal] platform rulebook: ${TOP_RULEBOOK}`);
    console.log(`[portal] proxy: ${PROXY_URL}`);
  });
})();

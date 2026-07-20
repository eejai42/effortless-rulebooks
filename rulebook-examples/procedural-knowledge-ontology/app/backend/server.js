// ============================================================================
// PKO Procedure Register — API
//
// THE VIEW IS THE CONTRACT. Every read below is `SELECT ... FROM vw_<entity>`.
// There is no formula evaluator here, no lookup resolver, no "effective name"
// helper. The transpiler already emitted SQL for every calc/lookup/aggregation
// field in the rulebook; this server opens the door and walks in.
//
// If a view is missing or a query fails, we RAISE — a 500 with the real
// Postgres error. We never substitute a plausible-looking default, because a
// silent fallback would make a broken read look like an empty result set.
// ============================================================================
import express from "express";
import pg from "pg";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The default IS the deterministically-correct target for this domain (it
// matches orchestrate.sh's erb_<domain-with-underscores> formula), not a guess.
// DATABASE_URL only overrides. See CLAUDE.md "Defaults derived from the SSoT".
const ERB_DOMAIN = process.env.ERB_DOMAIN || "procedural-knowledge-ontology";
const DATABASE_URL =
  process.env.DATABASE_URL ||
  `postgresql://postgres@localhost:5432/erb_${ERB_DOMAIN.replace(/-/g, "_")}`;

const PORT = Number(process.env.PORT || 8099);
const pool = new pg.Pool({ connectionString: DATABASE_URL });

const app = express();
app.use(express.json());

// --- one place that talks to Postgres --------------------------------------
// Deliberately thin: a view name and an optional WHERE. Anything that looks
// like it wants a JOIN here is a sign the rulebook should carry a lookup field
// instead — the view would then already have the column.
async function readView(view, { where, params = [], orderBy } = {}) {
  const sql =
    `SELECT * FROM ${view}` +
    (where ? ` WHERE ${where}` : "") +
    (orderBy ? ` ORDER BY ${orderBy}` : "");
  const { rows } = await pool.query(sql, params);
  return rows;
}

// Async handler wrapper: any rejection becomes a real 500 with the real error.
const h = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    console.error(`[api] ${req.method} ${req.path} failed:`, err.message);
    res.status(500).json({ error: err.message, detail: err.detail ?? null });
  });

// --- meta -------------------------------------------------------------------
app.get("/api/health", h(async (_req, res) => {
  const { rows } = await pool.query("SELECT current_database() AS db, now() AS at");
  res.json({ ok: true, db: rows[0].db, at: rows[0].at, domain: ERB_DOMAIN });
}));

// Project-level metadata (tagline, motif palette, PKO version IRIs, ...) lives
// in the rulebook's __meta__ table. rulebook-to-postgres does NOT emit a table
// or view for __meta__ — it is the metadata protocol itself, not domain data —
// so this is the one read that legitimately comes from the rulebook JSON rather
// than from a view. Everything else in this file reads vw_<entity>.
const RULEBOOK = path.join(
  __dirname,
  "../../effortless-rulebook/procedural-knowledge-ontology-rulebook.json"
);
app.get("/api/meta", h(async (_req, res) => {
  const rb = JSON.parse(await readFile(RULEBOOK, "utf8"));
  const rows = rb.__meta__?.data;
  if (!rows) {
    throw new Error(`No __meta__ table in ${RULEBOOK}`);
  }
  // Fold the typed-row hybrid back to an object, the same way
  // rulebookMeta.js/metaAsObject does on the platform side.
  const meta = {};
  for (const r of rows) {
    meta[r.MetaKey] =
      r.ValueType === "string" ? r.StringValue : JSON.parse(r.JsonValue ?? "null");
  }
  res.json(meta);
}));

// --- the generic table read -------------------------------------------------
// The frontend asks for whole views by name. The allowlist is READ FROM THE
// DATABASE at boot rather than hardcoded here: the transpiler decides which
// views exist, so a hand-maintained list would be a second source of truth that
// silently drifts every time the rulebook gains or loses a table.
//
// It doubles as a startup assertion. If the views are missing (nobody ran
// init-db.sh), we fail loudly at boot with the fix, instead of serving 404s
// that look like "this domain has no data".
let VIEWS = [];
async function loadViews() {
  const { rows } = await pool.query(
    `SELECT table_name FROM information_schema.views
      WHERE table_schema = 'public' AND table_name LIKE 'vw\\_%'
      ORDER BY table_name`
  );
  VIEWS = rows.map((r) => r.table_name.replace(/^vw_/, ""));
  if (VIEWS.length === 0) {
    throw new Error(
      `No vw_* views in ${DATABASE_URL}. The database exists but was never ` +
        `loaded. Fix:  ./postgres-bootstrap/init-db.sh`
    );
  }
  console.log(`[api] ${VIEWS.length} views available`);
}

app.get("/api/t/:table", h(async (req, res) => {
  const t = String(req.params.table).toLowerCase();
  if (!VIEWS.includes(t)) {
    return res.status(404).json({
      error: `Unknown view '${t}'. Known views: ${VIEWS.join(", ")}`,
    });
  }
  res.json(await readView(`vw_${t}`));
}));

// --- the whole register, in one shot ---------------------------------------
// The console is a read-mostly document viewer; one round trip beats forty.
// Every entry here is still a plain view read.
app.get("/api/register", h(async (_req, res) => {
  const out = {};
  await Promise.all(
    VIEWS.map(async (t) => {
      out[t] = await readView(`vw_${t}`);
    })
  );
  res.json(out);
}));

// --- the signature read: specification ↔ execution --------------------------
// The drift between what a procedure SAYS and what an execution DID is the
// whole point of PKO's spec/execution split. Both sides come straight from
// their views; the only thing this endpoint does is put them side by side.
app.get("/api/ledger/:executionId", h(async (req, res) => {
  const [execution] = await readView("vw_procedure_executions", {
    where: "procedure_execution_id = $1",
    params: [req.params.executionId],
  });
  if (!execution) {
    return res.status(404).json({
      error: `No ProcedureExecution '${req.params.executionId}'`,
    });
  }

  const specSteps = await readView("vw_steps", {
    where: "procedure_version = $1",
    params: [execution.procedure_version],
    orderBy: "step_number",
  });
  const stepExecutions = await readView("vw_step_executions", {
    where: "procedure_execution = $1",
    params: [req.params.executionId],
  });

  const byStep = new Map(stepExecutions.map((se) => [se.step, se]));
  res.json({
    execution,
    rows: specSteps.map((spec) => ({
      spec,
      execution: byStep.get(spec.step_id) ?? null, // null = specified, never performed
    })),
  });
}));

// ===========================================================================
// ADMIN — the witness layer, looking at itself
//
// Every read below is still a plain view read. The test outcomes, the fire
// counts, the loop rollups: all of it was computed by Postgres from the
// rulebook's own formulas. Nothing here re-derives a verdict in JavaScript.
// ===========================================================================

// --- the board -------------------------------------------------------------
app.get("/api/admin/board", h(async (_req, res) => {
  const suites = await readView("vw_test_suites", { orderBy: "test_suite_id" });
  const [totals] = await pool.query(`
    SELECT count(*)::int                                        AS total,
           count(*) FILTER (WHERE last_outcome = 'PASS')::int    AS pass,
           count(*) FILTER (WHERE last_outcome = 'WARN')::int    AS warn,
           count(*) FILTER (WHERE last_outcome = 'FAIL')::int    AS fail,
           count(*) FILTER (WHERE last_outcome = 'SKIP')::int    AS skip,
           count(*) FILTER (WHERE needs_attention)::int          AS blocking_fail,
           max(last_run_at)                                      AS last_run_at
    FROM vw_test_cases`).then((r) => r.rows);

  const byKind = (await pool.query(`
    SELECT test_kind,
           count(*)::int                                      AS total,
           count(*) FILTER (WHERE last_outcome = 'PASS')::int  AS pass,
           count(*) FILTER (WHERE last_outcome = 'WARN')::int  AS warn,
           count(*) FILTER (WHERE last_outcome = 'FAIL')::int  AS fail,
           count(*) FILTER (WHERE last_outcome = 'SKIP')::int  AS skip
    FROM vw_test_cases GROUP BY 1 ORDER BY 2 DESC`)).rows;

  // IsGreen is a computed column on the suite, not a JS opinion about one.
  res.json({ totals, byKind, suites, isGreen: totals.blocking_fail === 0 });
}));

// --- individual checks, filterable ----------------------------------------
app.get("/api/admin/tests", h(async (req, res) => {
  const { kind, outcome, suite, q } = req.query;
  const where = [];
  const params = [];
  for (const [col, val] of [["test_kind", kind], ["last_outcome", outcome], ["suite", suite]]) {
    if (val) { params.push(val); where.push(`${col} = $${params.length}`); }
  }
  if (q) {
    params.push(`%${String(q).toLowerCase()}%`);
    where.push(`(lower(subject) LIKE $${params.length} OR lower(test_case_id) LIKE $${params.length})`);
  }
  res.json(await readView("vw_test_cases", {
    where: where.length ? where.join(" AND ") : undefined,
    params,
    orderBy: "CASE last_outcome WHEN 'FAIL' THEN 0 WHEN 'WARN' THEN 1 WHEN 'SKIP' THEN 2 ELSE 3 END, test_case_id",
  }));
}));

// --- run the suite ---------------------------------------------------------
// Shells out to the same runner the CLI uses. One code path, so the browser
// and the terminal can never disagree about what the suite says.
app.post("/api/admin/tests/run", h(async (_req, res) => {
  const { execFile } = await import("node:child_process");
  const root = path.join(__dirname, "../..");
  const out = await new Promise((resolve) => {
    execFile("python3", ["tools/run_test_suite.py", "--write"],
      { cwd: root, maxBuffer: 32 * 1024 * 1024 },
      (err, stdout, stderr) => resolve({ code: err?.code ?? 0, stdout, stderr }));
  });
  res.json(out);
}));

// --- the witness board -----------------------------------------------------
// Every boolean witness with its live fire count, straight from the views.
app.get("/api/admin/witnesses", h(async (_req, res) => {
  const { rows: cols } = await pool.query(`
    SELECT c.table_name, c.column_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public' AND c.table_name LIKE 'vw\\_%'
      AND c.data_type = 'boolean'
    ORDER BY 1, 2`);

  // One pass over the substrate: count true/false per witness column.
  const parts = cols.map(({ table_name, column_name }) =>
    `SELECT '${table_name}' AS view, '${column_name}' AS col,
            count(*) FILTER (WHERE "${column_name}")::int AS t,
            count(*) FILTER (WHERE NOT "${column_name}")::int AS f,
            count(*)::int AS total
     FROM ${table_name}`);
  const { rows } = await pool.query(parts.join(" UNION ALL "));

  // Attach provenance: which question invented this field, if any.
  const { rows: prov } = await pool.query(`
    SELECT target_table, field_name, invented_for_question, is_witness
    FROM vw_rulebook_fields WHERE datatype = 'boolean'`);
  const key = (t, f) => `${t}|${f}`.toLowerCase().replace(/_/g, "");
  const byField = new Map(prov.map((p) => [key(p.target_table, p.field_name), p]));

  res.json(rows.map((r) => {
    const p = byField.get(key(r.view.replace(/^vw_/, ""), r.col));
    const verdict = r.total === 0 ? "empty"
      : r.t === 0 ? "never true"
      : r.f === 0 ? "always true"
      : "discriminates";
    return { ...r, table: r.view.replace(/^vw_/, ""), verdict,
             question: p?.invented_for_question ?? null,
             isWitness: p?.is_witness ?? false };
  }));
}));

// --- loops, questions, and their materialized answers ----------------------
app.get("/api/admin/loops", h(async (_req, res) => {
  const [loops, questions, roles] = await Promise.all([
    readView("vw_witness_loops", { orderBy: "loop_number" }),
    readView("vw_role_questions", { orderBy: "witness_loop, asking_role" }),
    readView("vw_roles", { orderBy: "role_id" }),
  ]);
  const { rows: counts } = await pool.query(
    `SELECT invented_for_question AS q, count(*)::int AS n
     FROM vw_rulebook_fields WHERE invented_for_question IS NOT NULL GROUP BY 1`);
  const byQ = new Map(counts.map((c) => [c.q, c.n]));
  res.json({
    loops,
    roles,
    questions: questions.map((q) => ({ ...q, predicateCount: byQ.get(q.role_question_id) ?? 0 })),
  });
}));

// --- provenance: trace any field back to the question that motivated it ----
app.get("/api/admin/provenance/:table/:field", h(async (req, res) => {
  const { table, field } = req.params;
  const [row] = await readView("vw_rulebook_fields", {
    where: "lower(target_table) = lower($1) AND lower(field_name) = lower($2)",
    params: [table, field],
  });
  if (!row) {
    return res.status(404).json({ error: `No catalog entry for ${table}.${field}` });
  }

  let question = null, loop = null, role = null, siblings = [];
  if (row.invented_for_question) {
    [question] = await readView("vw_role_questions", {
      where: "role_question_id = $1", params: [row.invented_for_question],
    });
    if (question) {
      [loop] = await readView("vw_witness_loops", {
        where: "witness_loop_id = $1", params: [question.witness_loop],
      });
      [role] = await readView("vw_roles", {
        where: "role_id = $1", params: [question.asking_role],
      });
      siblings = await readView("vw_rulebook_fields", {
        where: "invented_for_question = $1", params: [row.invented_for_question],
        orderBy: "target_table, field_name",
      });
    }
  }

  // What does the field currently READ? The whole point of provenance is to
  // end at a value, not at a description of one.
  let reading = null;
  if (row.is_derived) {
    const view = `vw_${String(row.target_table).replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase()}`;
    const col = String(row.field_name).replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
    const { rows: exists } = await pool.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_schema='public' AND table_name=$1 AND column_name=$2`, [view, col]);
    if (exists.length) {
      const { rows } = await pool.query(
        `SELECT count(*) FILTER (WHERE "${col}" IS NOT NULL)::int AS populated,
                count(*)::int AS total FROM ${view}`);
      reading = rows[0];
    }
  }

  res.json({ field: row, question, loop, role, siblings, reading });
}));

// ===========================================================================
// EXPLORER — every field, everywhere
//
// The register screens are curated: they show the ~80 columns that tell the
// procedural story. But the model carries 1521 fields, 925 of them derived.
// A curated screen can never keep up with that, and hand-writing a page per
// table would be a second source of truth that drifts the moment the rulebook
// changes.
//
// So the explorer is DERIVED, exactly like everything else here. It reads the
// field catalog (vw_rulebook_fields) and information_schema, and builds itself.
// Add a field to the rulebook, rebuild, and it appears — with its formula, its
// motivating question, and its inputs — without anyone editing this file.
// ===========================================================================

// snake_case is what the transpiler emits for PascalCase rulebook names.
//
// The acronym boundary matters: `WasStaleWhenIRanIt` becomes
// `was_stale_when_i_ran_it`, so a run of capitals must also split before the
// final capital that starts the next word. Getting this subtly wrong is how a
// real column silently reads as "unmapped".
//
// This is still only a CANDIDATE. The authority on what a column is called is
// information_schema, and resolveColumn() below checks against it rather than
// trusting this transform. A name we cannot resolve is reported, never guessed.
const snake = (s) =>
  String(s)
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase();

// --- the field catalog, indexed once at boot -------------------------------
// This is an INDEX over rows the substrate already computed, not a cache of
// derived values. It holds no answers — only the map from a view column back
// to its catalog entry, so the API can answer "what is this column?" without
// a round trip per cell. It is rebuilt on boot; the rulebook is HEAD.
let CATALOG = [];        // every RulebookFields row
let CAT_BY_COL = new Map();   // "vw_steps|is_late" -> catalog row
let CAT_BY_TABLE = new Map(); // "Steps" -> [catalog rows]
let PK_OF = new Map();        // "vw_steps" -> "step_id"

let UNRESOLVED = [];  // catalog fields whose view column we could not find

async function loadCatalog() {
  CATALOG = await readView("vw_rulebook_fields", { orderBy: "target_table, field_name" });

  // The real column names, from the database. This is the authority; the
  // snake() transform above only proposes candidates against it.
  const { rows: allCols } = await pool.query(
    `SELECT table_name, column_name, ordinal_position FROM information_schema.columns
      WHERE table_schema='public' AND table_name LIKE 'vw\\_%'`);
  const colsOfView = new Map();
  for (const c of allCols) {
    if (!colsOfView.has(c.table_name)) colsOfView.set(c.table_name, new Set());
    colsOfView.get(c.table_name).add(c.column_name);
    if (c.ordinal_position === 1) PK_OF.set(c.table_name, c.column_name);
  }
  PK_OF = new Map(allCols.filter((c) => c.ordinal_position === 1)
    .map((c) => [c.table_name, c.column_name]));

  CAT_BY_COL = new Map();
  CAT_BY_TABLE = new Map();
  UNRESOLVED = [];
  for (const f of CATALOG) {
    const view = `vw_${snake(f.target_table)}`;
    const have = colsOfView.get(view);
    const cand = snake(f.field_name);
    // Exact match, else a case-insensitive underscore-stripped match, which
    // absorbs any remaining disagreement about where word breaks fall.
    let col = have?.has(cand) ? cand : null;
    if (!col && have) {
      const norm = (s) => s.toLowerCase().replace(/_/g, "");
      const want = norm(f.field_name);
      col = [...have].find((c) => norm(c) === want) ?? null;
    }
    if (col) CAT_BY_COL.set(`${view}|${col}`, f);
    else if (have) UNRESOLVED.push(`${f.target_table}.${f.field_name}`);

    if (!CAT_BY_TABLE.has(f.target_table)) CAT_BY_TABLE.set(f.target_table, []);
    CAT_BY_TABLE.get(f.target_table).push(f);
  }

  console.log(`[api] catalog: ${CATALOG.length} fields ` +
    `(${CATALOG.filter((f) => f.is_derived).length} derived)`);
  if (UNRESOLVED.length) {
    // Not fatal — the app still works — but never silent. A catalog field with
    // no column means the rulebook and the substrate disagree.
    console.warn(`[api] WARNING: ${UNRESOLVED.length} catalog field(s) have no ` +
      `matching view column: ${UNRESOLVED.slice(0, 10).join(", ")}` +
      `${UNRESOLVED.length > 10 ? ", …" : ""}`);
  }
}

// --- formula dependency extraction -----------------------------------------
// This parses a formula for the fields it REFERENCES. It does not evaluate it.
// The distinction matters: the value of every field below still comes from the
// view column the transpiler emitted. We are reading the formula only to know
// which OTHER columns to show alongside it, so an inference can be displayed
// next to the raw values it was computed from.
//
//   {{EndedAt}}                  -> same table, field EndedAt
//   Steps!{{ExpectedDuration}}   -> table Steps, field ExpectedDuration
function formulaDeps(formula, homeTable) {
  if (!formula) return [];
  const out = [];
  const seen = new Set();
  const re = /(?:([A-Za-z_][A-Za-z0-9_]*)\s*!\s*)?\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;
  let m;
  while ((m = re.exec(formula))) {
    const table = m[1] || homeTable;
    const field = m[2];
    const k = `${table}.${field}`;
    if (seen.has(k)) continue;
    seen.add(k);
    const view = `vw_${snake(table)}`;
    // Resolve through the same authoritative index the catalog was built with,
    // so a reference resolves iff its column really exists.
    let cat = CAT_BY_COL.get(`${view}|${snake(field)}`) ?? null;
    let column = snake(field);
    if (!cat) {
      const norm = (s) => s.toLowerCase().replace(/_/g, "");
      const want = `${view}|${norm(field)}`;
      for (const [k2, v] of CAT_BY_COL) {
        const [vw, cl] = k2.split("|");
        if (`${vw}|${norm(cl)}` === want) { cat = v; column = cl; break; }
      }
    }
    out.push({
      table, field, key: k,
      column,
      view,
      isLocal: table === homeTable,
      fieldType: cat?.field_type ?? null,
      datatype: cat?.datatype ?? null,
      isDerived: cat?.is_derived ?? null,
      formula: cat?.formula || null,
      exists: Boolean(cat),
    });
  }
  return out;
}

// --- the catalog of tables, for the explorer index -------------------------
app.get("/api/explore/tables", h(async (_req, res) => {
  const { rows: counts } = await pool.query(
    (VIEWS.map((v) => `SELECT '${v}' AS t, count(*)::int AS n FROM vw_${v}`)).join(" UNION ALL "));
  const byView = new Map(counts.map((c) => [c.t, c.n]));

  res.json([...CAT_BY_TABLE.entries()]
    .map(([table, fields]) => {
      const view = `vw_${snake(table)}`;
      const k = (t) => fields.filter((f) => f.field_type === t).length;
      return {
        table, view,
        hasView: VIEWS.includes(snake(table)),
        rowCount: byView.get(snake(table)) ?? null,
        total: fields.length,
        raw: k("raw"),
        calculated: k("calculated"),
        lookup: k("lookup"),
        aggregation: k("aggregation"),
        relationship: k("relationship"),
        derived: fields.filter((f) => f.is_derived).length,
        witnesses: fields.filter((f) => f.is_witness).length,
      };
    })
    .sort((a, b) => b.total - a.total));
}));

// --- one table: its full column catalog + its rows -------------------------
app.get("/api/explore/table/:table", h(async (req, res) => {
  const table = String(req.params.table);
  const view = `vw_${snake(table)}`;
  const fields = CAT_BY_TABLE.get(table);
  if (!fields) {
    return res.status(404).json({
      error: `No table '${table}' in the field catalog.`,
    });
  }
  if (!VIEWS.includes(snake(table))) {
    return res.status(404).json({
      error: `'${table}' is in the catalog but has no ${view}. ` +
             `The rulebook declares it; the substrate has not been rebuilt.`,
    });
  }

  // Column order as the view presents it, annotated from the catalog.
  const { rows: cols } = await pool.query(
    `SELECT column_name, data_type FROM information_schema.columns
      WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position`, [view]);

  res.json({
    table, view,
    pk: PK_OF.get(view) ?? cols[0]?.column_name ?? null,
    columns: cols.map((c) => {
      const f = CAT_BY_COL.get(`${view}|${c.column_name}`) ?? null;
      return {
        column: c.column_name,
        sqlType: c.data_type,
        field: f?.field_name ?? c.column_name,
        fieldType: f?.field_type ?? "unmapped",
        datatype: f?.datatype ?? null,
        formula: f?.formula || null,
        isDerived: f?.is_derived ?? false,
        isWitness: f?.is_witness ?? false,
        question: f?.invented_for_question ?? null,
        deps: f?.is_derived ? formulaDeps(f.formula, table) : [],
      };
    }),
    rows: await readView(view),
  });
}));

// --- one row: every field it has, with each inference's inputs -------------
// This is the "show me everything" read. For a single row it returns every
// column, and for every derived column the CURRENT VALUES of the fields its
// formula references — local ones straight off the same row, foreign ones
// fetched from their own view. All of them are columns; none are recomputed.
app.get("/api/explore/row/:table/:id", h(async (req, res) => {
  const table = String(req.params.table);
  const view = `vw_${snake(table)}`;
  const fields = CAT_BY_TABLE.get(table);
  if (!fields || !VIEWS.includes(snake(table))) {
    return res.status(404).json({ error: `No view for table '${table}'` });
  }
  const pk = PK_OF.get(view);
  const [row] = await readView(view, { where: `${pk} = $1`, params: [req.params.id] });
  if (!row) {
    return res.status(404).json({ error: `No ${table} row with ${pk}='${req.params.id}'` });
  }

  // Foreign dependency values: one small read per referenced view, matched on
  // that view's own primary key via the FK value already on this row.
  const foreignCache = new Map();
  const foreignValue = async (dep) => {
    if (!VIEWS.includes(dep.view.replace(/^vw_/, ""))) return { unavailable: "no view" };
    // Which column on THIS row points at that table? The transpiler names the
    // FK column after the relationship field, so look for a local field whose
    // value can key the foreign view's PK.
    const fpk = PK_OF.get(dep.view);
    if (!fpk) return { unavailable: "no pk" };
    const fkCandidates = fields
      .filter((f) => f.field_type === "relationship" || snake(f.field_name) === snake(dep.table))
      .map((f) => snake(f.field_name))
      .filter((c) => c in row && row[c] != null);
    for (const c of fkCandidates) {
      const ck = `${dep.view}|${row[c]}`;
      if (!foreignCache.has(ck)) {
        const [fr] = await readView(dep.view, { where: `${fpk} = $1`, params: [row[c]] });
        foreignCache.set(ck, fr ?? null);
      }
      const fr = foreignCache.get(ck);
      if (fr && dep.column in fr) {
        return { via: c, viaValue: row[c], value: fr[dep.column] };
      }
    }
    // An aggregation references the CHILD table across many rows; there is no
    // single value to show. Say so rather than inventing one.
    return { aggregate: true };
  };

  const out = [];
  for (const c of Object.keys(row)) {
    const f = CAT_BY_COL.get(`${view}|${c}`) ?? null;
    const entry = {
      column: c,
      value: row[c],
      field: f?.field_name ?? c,
      fieldType: f?.field_type ?? "unmapped",
      datatype: f?.datatype ?? null,
      formula: f?.formula || null,
      isDerived: f?.is_derived ?? false,
      isWitness: f?.is_witness ?? false,
      question: f?.invented_for_question ?? null,
      inputs: [],
    };
    if (f?.is_derived && f.formula) {
      for (const dep of formulaDeps(f.formula, table)) {
        entry.inputs.push({
          ...dep,
          ...(dep.isLocal
            ? { value: dep.column in row ? row[dep.column] : undefined,
                unavailable: dep.column in row ? undefined : "not on view" }
            : await foreignValue(dep)),
        });
      }
    }
    out.push(entry);
  }

  res.json({ table, view, pk, id: row[pk], row, fields: out });
}));

// --- one cell: the popover read --------------------------------------------
// Same shape as a row entry, for a single column. Powers the inference
// popover that any screen can attach to any value.
app.get("/api/explore/cell/:table/:id/:column", h(async (req, res) => {
  const { table, id, column } = req.params;
  const view = `vw_${snake(table)}`;
  if (!VIEWS.includes(snake(table))) {
    return res.status(404).json({ error: `No view for table '${table}'` });
  }
  const pk = PK_OF.get(view);
  const [row] = await readView(view, { where: `${pk} = $1`, params: [id] });
  if (!row) return res.status(404).json({ error: `No ${table} row '${id}'` });
  if (!(column in row)) {
    return res.status(404).json({ error: `No column '${column}' on ${view}` });
  }

  const f = CAT_BY_COL.get(`${view}|${column}`) ?? null;
  const deps = f?.is_derived ? formulaDeps(f.formula, table) : [];
  res.json({
    table, view, id, column,
    value: row[column],
    field: f?.field_name ?? column,
    fieldType: f?.field_type ?? "unmapped",
    datatype: f?.datatype ?? null,
    formula: f?.formula || null,
    isDerived: f?.is_derived ?? false,
    isWitness: f?.is_witness ?? false,
    question: f?.invented_for_question ?? null,
    inputs: deps.map((d) => ({
      ...d,
      value: d.isLocal && d.column in row ? row[d.column] : undefined,
      unavailable: d.isLocal ? (d.column in row ? undefined : "not on view") : "foreign",
    })),
  });
}));

// --- the inference index: every derived field in the model -----------------
// The headline read. 925 derived fields, filterable, each with its formula,
// the question that motivated it, and how many rows it currently computes on.
app.get("/api/explore/inferences", h(async (req, res) => {
  const { kind, table, witness, q } = req.query;
  let rows = CATALOG.filter((f) => f.is_derived);
  if (kind) rows = rows.filter((f) => f.field_type === kind);
  if (table) rows = rows.filter((f) => f.target_table === table);
  if (witness === "true") rows = rows.filter((f) => f.is_witness);
  if (q) {
    const s = String(q).toLowerCase();
    rows = rows.filter((f) =>
      `${f.target_table}.${f.field_name}`.toLowerCase().includes(s) ||
      String(f.formula ?? "").toLowerCase().includes(s));
  }
  res.json({
    total: CATALOG.filter((f) => f.is_derived).length,
    matched: rows.length,
    // Surfaced, not swallowed: a catalog field with no view column means the
    // rulebook and the substrate disagree, and the UI says so.
    unresolved: UNRESOLVED,
    byKind: ["calculated", "lookup", "aggregation"].map((k) => ({
      kind: k, n: CATALOG.filter((f) => f.is_derived && f.field_type === k).length,
    })),
    rawTotal: CATALOG.filter((f) => !f.is_derived).length,
    fields: rows.slice(0, 600).map((f) => ({
      id: f.rulebook_field_id,
      table: f.target_table,
      field: f.field_name,
      column: snake(f.field_name),
      view: `vw_${snake(f.target_table)}`,
      fieldType: f.field_type,
      datatype: f.datatype,
      formula: f.formula,
      isWitness: f.is_witness,
      question: f.invented_for_question,
      deps: formulaDeps(f.formula, f.target_table),
    })),
    truncated: rows.length > 600,
  });
}));

// ===========================================================================
// ACCESS CONTROL
//
// Everything below reaches Postgres AS THE SIGNED-IN PRINCIPAL. The API does
// no filtering of its own: RLS decides which rows, the principal's schema
// decides which tables and columns. If a caller can see it here, they could
// see it with psql and the same token -- which is the point. The security is
// in the database, and this server is a proxy in front of it.
// ===========================================================================
import { listSignIns, mintToken, requireAuth, PUBLIC_KEY_PEM, ISSUER }
  from "./auth.js";
import { asPrincipal, adminQuery } from "./db.js";

// --- sign-in ---------------------------------------------------------------

// The login grid. Open by design: it lists who MAY sign in, never any of
// their data. Read as owner because nobody is authenticated yet.
app.get("/api/auth/sign-ins", h(async (_req, res) => {
  const rows = await listSignIns({ query: adminQuery });
  res.json({
    issuer: ISSUER,
    signIns: rows.map((r) => ({
      appUserId: r.app_user_id,
      principalId: r.principal_id,
      displayName: r.display_name,
      email: r.email_address,
      organization: r.organization,
      agentKind: r.agent_kind,
      principalLabel: r.principal_label,
      domainRole: r.domain_role,
      isAdministrator: r.is_administrator === true,
      isDefault: r.is_default === true,
      responsibility: r.responsibility,
      schemaName: r.schema_name,
    })),
  });
}));

// Mint. The client asks to be a principal; the server checks whether it may.
app.post("/api/auth/sign-in", h(async (req, res) => {
  const { appUserId, principalId } = req.body || {};
  if (!appUserId || !principalId) {
    return res.status(400).json({ error: "appUserId and principalId required" });
  }
  try {
    const out = await mintToken({ query: adminQuery }, appUserId, principalId);
    res.json(out);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
}));

// The public key, so anything else can verify our tokens without asking us.
app.get("/api/auth/public-key", (_req, res) =>
  res.type("text/plain").send(PUBLIC_KEY_PEM));

// Who am I, and what can I reach? Answered by querying the database AS the
// caller -- the schema listing IS their world, not a computed opinion of it.
app.get("/api/me", requireAuth, h(async (req, res) => {
  const out = await asPrincipal(req.claims, async (client, p) => {
    const { rows: tables } = await client.query(
      `SELECT table_name FROM information_schema.views
        WHERE table_schema = $1 ORDER BY table_name`, [p.schema_name]);
    return {
      claims: req.claims,
      schema: p.schema_name,
      pgRole: p.pg_role_name,
      isAdministrator: p.is_administrator === true,
      tables: tables.map((t) => t.table_name),
    };
  });
  res.json(out);
}));

// --- the data explorer, scoped to the caller -------------------------------
// select * from <table in my schema>. No allow-list here on purpose: the
// caller's search_path contains exactly one schema, so naming anything they
// were not granted simply does not resolve.
app.get("/api/my/:table", requireAuth, h(async (req, res) => {
  const t = String(req.params.table);
  if (!/^[a-z0-9_]+$/.test(t)) {
    return res.status(400).json({ error: "bad table name" });
  }
  const limit = Math.min(Number(req.query.limit) || 500, 2000);
  try {
    const out = await asPrincipal(req.claims, async (client, p) => {
      const { rows } = await client.query(
        `SELECT * FROM ${p.schema_name}.${t} LIMIT ${limit}`);
      return rows;
    });
    res.json({ table: t, rows: out, count: out.length });
  } catch (e) {
    // A table outside the principal's schema genuinely does not exist for
    // them. Report that honestly rather than dressing it up as empty.
    if (/does not exist/i.test(e.message)) {
      return res.status(404).json({
        error: "not_in_your_schema",
        detail: `${t} is not visible to ${req.claims.principal}`,
      });
    }
    throw e;
  }
}));

// --- static frontend (prod mode) -------------------------------------------
const dist = path.join(__dirname, "../frontend/dist");
app.use(express.static(dist));
app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(dist, "index.html")));

// Boot only after the views are confirmed present — see loadViews().
loadViews()
  .then(loadCatalog)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[api] PKO Procedure Register on http://localhost:${PORT}`);
      console.log(`[api] reading views from ${DATABASE_URL}`);
    });
  })
  .catch((err) => {
    console.error(`[api] FATAL: ${err.message}`);
    process.exit(1);
  });

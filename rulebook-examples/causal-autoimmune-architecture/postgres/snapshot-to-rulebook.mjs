#!/usr/bin/env node
// ============================================================================
// snapshot-to-rulebook.mjs — REVERSE-SYNC: live Postgres vw_* -> rulebook data[]
// ============================================================================
// This is the DB -> rulebook input spoke the rest of the project flagged as
// "not yet built" (see admin-app/server/routes/loops.js ROUND-TRIP CAVEAT and
// routes/export.js). It makes the rulebook snapshot-consistent ON DISK: every
// row's RAW *and COMPUTED* values (Name/Slug, scores, the IsClinicallyActionable
// keystone, counts, calibration fractions, relationship arrays — everything the
// view exposes) are written back into effortless-rulebook.json so the hub is
// complete even before a build regenerates it.
//
// TWO MODES:
//   upsert (DEFAULT) — conservative, "never lose data":
//       - row present in rulebook (same PK)   -> UPDATE in place (merge columns)
//       - row in the view but not the rulebook -> ADD it
//       - row in the rulebook but not the view  -> LEAVE IT ALONE (never delete)
//   replace (--replace / SNAPSHOT_MODE=replace) — full overwrite per entity:
//       - an entity that HAS a view: its data[] is REPLACED wholesale with the
//         view's rows (so rows deleted in the DB disappear from the rulebook too).
//       - an entity with NO view is still left untouched (never blanked) — so even
//         a full overwrite can never erase data that has no DB counterpart.
//
// Both modes, for every entity that has BOTH a `schema` and a `data` array AND a
// matching vw_<snake(entityKey)> view:
//   * Read every row of the view.
//   * Map each view column (snake_case) -> the schema field whose snake(name)
//     matches, and write the value under that field's PascalCase `name` so the
//     existing data[] key casing is preserved.
//   * Key rows by PRIMARY KEY (the first schema field, by ERB convention).
//   * Entities with no matching view (e.g. __meta__) are skipped untouched.
//   * `_meta`, `__meta__`, `$schema`, `Name`, `Description` and every other
//     top-level key that is not a {schema,data} entity are left untouched.
//
// Worst case (a column/view is missing, a query throws): that entity is skipped
// and whatever was already in the rulebook simply stays. Nothing is removed.
//
// Writes effortless-rulebook.json.bak before overwriting, then writes the
// rulebook back with the SAME 2-space indentation + trailing newline so the
// diff stays minimal.
//
// Usage:
//   node snapshot-to-rulebook.mjs [DATABASE_URL]            # upsert (default)
//   node snapshot-to-rulebook.mjs --replace [DATABASE_URL]  # full overwrite
//   DATABASE_URL=... SNAPSHOT_MODE=replace node snapshot-to-rulebook.mjs
// Env:
//   RULEBOOK_PATH  override the rulebook location (default: ../effortless-rulebook/effortless-rulebook.json)
//   SNAPSHOT_MODE  'upsert' (default) | 'replace'  — equivalent to the --replace flag
//   SNAPSHOT_NO_BAK=true  skip writing the .bak (the API uses git as its safety net)
// Output: a JSON summary on stdout (so the API can relay it); human log on stderr.
// ============================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));

// `pg` lives in admin-app/node_modules (not postgres/), and ESM `import 'pg'`
// won't honour NODE_PATH. Resolve it from the admin-app package explicitly so
// this script runs the same whether launched from postgres/, the repo root, or
// the admin-app server. CJS `pg` loads fine via require().
const requireFromAdminApp = createRequire(
  path.resolve(HERE, '..', 'admin-app', 'package.json'),
);
const pg = requireFromAdminApp('pg');
const RULEBOOK_PATH =
  process.env.RULEBOOK_PATH ||
  path.resolve(HERE, '..', 'effortless-rulebook', 'effortless-rulebook.json');

// Parse argv: a lone `--replace` flag (anywhere) selects replace mode; the first
// non-flag positional is treated as the DATABASE_URL.
const argv = process.argv.slice(2);
const flagReplace = argv.includes('--replace');
const positional = argv.find((a) => !a.startsWith('--'));

const MODE =
  flagReplace || process.env.SNAPSHOT_MODE === 'replace' ? 'replace' : 'upsert';

const DATABASE_URL =
  process.env.DATABASE_URL ||
  positional ||
  'postgresql://postgres@localhost:5432/causal_autoimmune';

// PascalCase / camelCase -> snake_case, matching the rulebook-to-postgres column
// convention (verified against every live view column for this rulebook).
function snake(s) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

function log(...a) { process.stderr.write('[snapshot] ' + a.join(' ') + '\n'); }

// pg returns NUMERIC/DECIMAL (1700) and BIGINT (20) as strings to avoid float
// drift. The rulebook stored these as JSON numbers, so parse them back to keep
// the on-disk type stable (same choice the admin-app db.js makes).
const { Pool, types } = pg;
types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v)));
types.setTypeParser(20, (v) => (v === null ? null : parseInt(v, 10)));

// Dates/timestamps: by default pg parses these into JS Date objects, which
// JSON.stringify renders with millisecond precision and a TZ-shifted local form
// — so an authored "2023-04-10" becomes "2023-04-10T05:00:00.000Z" and an
// authored "2026-06-02T09:00:00Z" comes back local. Both are lossy/noisy
// round-trips that churn the rulebook AND the regenerated seed SQL.
//
// This rulebook authors timestamptz columns in TWO shapes, and we must round-trip
// each back to the SAME shape:
//   * a bare DATE  "2023-04-10"           — stored as LOCAL midnight, e.g. the
//                                           DB text "2023-04-10 00:00:00-05".
//   * a UTC instant "2026-06-02T09:00:00Z" — stored at that instant, e.g. the DB
//                                            text "2026-06-02 04:00:00-05".
// The disambiguator is the LOCAL wall-clock time: midnight => it was a bare date.
// So we parse the DB's own TEXT (which already carries the session-local wall
// clock + offset) rather than a JS Date:
//   * local time is 00:00:00            -> emit bare "YYYY-MM-DD"
//   * otherwise                          -> emit canonical UTC ISO "…T..:..:..Z"
// Working from the text keeps this correct regardless of the DB session timezone
// and drops sub-second noise (none of this rulebook's datetimes carry it).
const pad = (n, w = 2) => String(n).padStart(w, '0');
const canonicalTs = (text) => {
  if (text === null) return null;
  // "YYYY-MM-DD HH:MM:SS[.ffff][+-HH[:MM]]"  (pg's timestamptz text form)
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?([+-]\d{2})(?::?(\d{2}))?$/.exec(text);
  if (!m) return text; // unrecognized shape — leave it exactly as the DB gave it
  const [, Y, Mo, D, h, mi, s, offH, offM = '00'] = m;
  if (h === '00' && mi === '00' && s === '00') return `${Y}-${Mo}-${D}`; // local midnight => bare date
  // Convert local wall-clock + offset to a UTC instant, then format as ...Z.
  const utcMs = Date.UTC(+Y, +Mo - 1, +D, +h, +mi, +s) - (Number(offH) * 60 + Math.sign(Number(offH)) * Number(offM)) * 60000;
  const d = new Date(utcMs);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}Z`;
};
// Tell pg NOT to pre-parse these into Date objects — hand us the raw text so the
// rules above see the session-local wall clock.
types.setTypeParser(1082, (v) => v);          // date — already bare "YYYY-MM-DD"
types.setTypeParser(1114, canonicalTs);       // timestamp without time zone
types.setTypeParser(1184, canonicalTs);       // timestamp with time zone

async function main() {
  const raw = readFileSync(RULEBOOK_PATH, 'utf8');
  const rb = JSON.parse(raw);

  // Discover entities: top-level keys whose value is an object carrying both a
  // `schema` array and a `data` array. (Mirrors how the transpiler treats them.)
  const entities = Object.keys(rb).filter(
    (k) =>
      rb[k] &&
      typeof rb[k] === 'object' &&
      !Array.isArray(rb[k]) &&
      Array.isArray(rb[k].schema) &&
      Array.isArray(rb[k].data),
  );

  const pool = new Pool({ connectionString: DATABASE_URL });
  const summary = {
    target: DATABASE_URL,
    mode: MODE,
    entities: [],
    updated: 0,
    added: 0,
    replaced: 0,
    skipped: [],
  };

  try {
    // Which views actually exist — so a missing view is a clean skip, not a throw.
    const viewRows = (
      await pool.query("SELECT viewname FROM pg_views WHERE viewname LIKE 'vw_%'")
    ).rows;
    const views = new Set(viewRows.map((r) => r.viewname));

    for (const key of entities) {
      const ent = rb[key];
      const view = 'vw_' + snake(key);
      if (!views.has(view)) {
        summary.skipped.push({ entity: key, reason: `no view ${view}` });
        log(`SKIP  ${key} (no ${view})`);
        continue;
      }

      const schema = ent.schema;
      const pkField = schema[0]; // ERB convention: first field is the PK
      const pkName = pkField.name;          // PascalCase key used in data[]
      const pkCol = snake(pkName);          // snake_case column in the view

      // snake-column -> PascalCase field name, for columns this entity declares.
      const colToName = new Map();
      for (const f of schema) colToName.set(snake(f.name), f.name);

      let viewRowsData;
      try {
        viewRowsData = (await pool.query(`SELECT * FROM ${view}`)).rows;
      } catch (e) {
        // Any read failure -> skip this entity entirely; existing data stays put.
        summary.skipped.push({ entity: key, reason: `read failed: ${String(e.message || e)}` });
        log(`SKIP  ${key} (read failed: ${e.message || e})`);
        continue;
      }

      // Build the {PascalName: value} patch for a view row: every column this
      // entity declares in its schema (raw + calculated + aggregation +
      // relationship). Columns the view has but the schema doesn't are ignored.
      const toPatch = (vrow) => {
        const patch = {};
        for (const [col, val] of Object.entries(vrow)) {
          const name = colToName.get(col);
          if (name) patch[name] = val;
        }
        return patch;
      };

      if (MODE === 'replace') {
        // Full overwrite: rebuild data[] from the view (in view order). Rows the
        // DB no longer has vanish from the rulebook. A view with zero usable rows
        // is treated as "nothing to replace with" and the entity is left as-is, so
        // a transient empty read can never blank out the rulebook.
        const rebuilt = [];
        for (const vrow of viewRowsData) {
          const pkVal = vrow[pkCol];
          if (pkVal === undefined || pkVal === null) continue;
          rebuilt.push(toPatch(vrow));
        }
        if (rebuilt.length === 0 && ent.data.length > 0) {
          summary.skipped.push({ entity: key, reason: 'view empty — kept existing rows' });
          log(`KEEP  ${key} (view ${view} empty; existing ${ent.data.length} rows preserved)`);
          continue;
        }
        const before = ent.data.length;
        ent.data = rebuilt;
        summary.replaced += rebuilt.length;
        summary.entities.push({ entity: key, view, rows: viewRowsData.length, mode: 'replace', before, after: rebuilt.length });
        log(`REPL  ${key.padEnd(26)} ${view}  rows ${before} -> ${rebuilt.length}`);
        continue;
      }

      // upsert mode: index existing rulebook rows by PK for in-place merge.
      const byPk = new Map();
      for (const row of ent.data) byPk.set(String(row[pkName]), row);

      let updated = 0;
      let added = 0;

      for (const vrow of viewRowsData) {
        const pkVal = vrow[pkCol];
        if (pkVal === undefined || pkVal === null) continue; // can't key it; leave rulebook alone
        const pkKey = String(pkVal);
        const patch = toPatch(vrow);

        const existing = byPk.get(pkKey);
        if (existing) {
          Object.assign(existing, patch); // merge: update present, add new keys; never drop keys
          updated++;
        } else {
          ent.data.push(patch); // brand-new row from the DB
          byPk.set(pkKey, patch);
          added++;
        }
      }

      summary.entities.push({ entity: key, view, rows: viewRowsData.length, mode: 'upsert', updated, added });
      summary.updated += updated;
      summary.added += added;
      log(`OK    ${key.padEnd(26)} ${view}  updated=${updated} added=${added}`);
    }
  } finally {
    await pool.end();
  }

  // Backup (unless the caller relies on git as the safety net) then write back
  // with the original 2-space indentation + trailing newline (minimal diff).
  if (process.env.SNAPSHOT_NO_BAK !== 'true') {
    const bak = RULEBOOK_PATH + '.bak';
    writeFileSync(bak, raw);
    log(`backup written: ${path.basename(bak)}`);
  }
  const trailing = raw.endsWith('\n') ? '\n' : '';
  writeFileSync(RULEBOOK_PATH, JSON.stringify(rb, null, 2) + trailing);
  log(
    MODE === 'replace'
      ? `done [replace]: ${summary.replaced} rows written across ` +
          `${summary.entities.length} entities (${summary.skipped.length} skipped)`
      : `done [upsert]: ${summary.updated} rows updated, ${summary.added} added across ` +
          `${summary.entities.length} entities (${summary.skipped.length} skipped)`,
  );

  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
}

main().catch((e) => {
  // Top-level failure: report and exit non-zero WITHOUT having written the
  // rulebook (the write only happens after the loop completes), so a crash mid-run
  // leaves the rulebook exactly as it was.
  process.stderr.write('[snapshot] FAILED: ' + (e.stack || e.message || String(e)) + '\n');
  process.exit(1);
});

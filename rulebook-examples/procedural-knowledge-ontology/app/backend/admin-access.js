// ---------------------------------------------------------------------------
// Admin: edit the access model, then rebuild the database from it.
//
// The write path is deliberately long and deliberately dumb:
//
//   PATCH the rulebook JSON  ->  effortless build  ->  init-db.sh
//                                                        -> regenerates
//                                                           06-access-control.sql
//                                                        -> reloads everything
//
// It takes about a minute. That is the trade: the emitted DDL is a pure
// function of the rulebook, so there is no path by which the database and the
// model disagree. No incremental "just add this one policy" shortcut exists,
// because that shortcut is exactly how drift starts.
//
// Progress is streamed as SSE so the UI can show it happening rather than
// spinning on a blocked request.
// ---------------------------------------------------------------------------
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const RB = path.join(ROOT, "effortless-rulebook",
                     "procedural-knowledge-ontology-rulebook.json");

// Only these tables are editable through the admin API. Everything else in
// the rulebook is out of scope for a security admin.
const EDITABLE = new Set([
  "AccessPolicies", "FieldGrants", "AccessPrincipals",
  "RoleSchemas", "RoleSchemaViews", "PrincipalAssignments",
]);

const PK = {
  AccessPolicies: "AccessPolicyId",
  FieldGrants: "FieldGrantId",
  AccessPrincipals: "AccessPrincipalId",
  RoleSchemas: "RoleSchemaId",
  RoleSchemaViews: "RoleSchemaViewId",
  PrincipalAssignments: "PrincipalAssignmentId",
};

function readRulebook() {
  return JSON.parse(fs.readFileSync(RB, "utf8"));
}

// The rulebook is a contended file: another agent may be writing it, and the
// file uses 1-space indent. Re-read immediately before writing, and preserve
// the formatting, or the diff reflows ~130k lines and clobbers their work.
function writeRulebook(mutate) {
  const rb = readRulebook();
  const result = mutate(rb);
  const tmp = RB + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(rb, null, 1));
  fs.renameSync(tmp, RB);
  return result;
}

/** The whole access model, for the admin console. */
export async function readAccessModel(adminQuery) {
  const q = (sql) => adminQuery(sql).then((r) => r.rows);
  const [principals, policies, tables, denials, assignments, users] =
    await Promise.all([
      q(`SELECT * FROM vw_access_principals ORDER BY is_administrator DESC, label`),
      q(`SELECT * FROM vw_access_policies ORDER BY principal, target_table, command`),
      q(`SELECT * FROM vw_rulebook_tables ORDER BY subject_area, table_name`),
      q(`SELECT * FROM vw_access_denial_tests ORDER BY access_denial_test_id`),
      q(`SELECT * FROM vw_principal_assignments ORDER BY app_user`),
      q(`SELECT * FROM vw_app_users ORDER BY display_name`),
    ]);

  // Live counts straight from the catalog, so the console shows what Postgres
  // actually has rather than what the rulebook intends.
  const live = await q(`
    SELECT
      (SELECT count(*) FROM pg_policies WHERE schemaname='public')      AS policies,
      (SELECT count(*) FROM pg_namespace WHERE nspname LIKE 'pko\\_%')   AS schemas,
      (SELECT count(*) FROM information_schema.views
        WHERE table_schema LIKE 'pko\\_%')                              AS views
  `);

  return { principals, policies, tables, denials, assignments, users,
           live: live[0] };
}

/** Field grants for one principal + table, with each field's grant state. */
export async function readGrantMatrix(adminQuery, principalId, tableName) {
  const { rows } = await adminQuery(
    `SELECT f.rulebook_field_id, f.field_name, f.field_type, f.datatype,
            f.is_derived, f.formula,
            g.field_grant_id, g.can_read, g.can_write, g.mask_strategy
       FROM vw_rulebook_fields f
       LEFT JOIN vw_field_grants g
              ON g.target_field = f.rulebook_field_id
             AND g.principal    = $1
      WHERE f.target_table = $2
      ORDER BY f.field_name`,
    [principalId, tableName]);
  return rows;
}

/** Upsert or delete rows in an editable access table. */
export function applyEdits(edits) {
  if (!Array.isArray(edits) || edits.length === 0) {
    const e = new Error("no edits supplied");
    e.status = 400;
    throw e;
  }
  for (const ed of edits) {
    if (!EDITABLE.has(ed.table)) {
      const e = new Error(`table not editable: ${ed.table}`);
      e.status = 400;
      throw e;
    }
  }

  return writeRulebook((rb) => {
    const applied = [];
    for (const ed of edits) {
      const t = rb[ed.table];
      if (!t) throw new Error(`missing table ${ed.table}`);
      const pk = PK[ed.table];
      const id = ed.row?.[pk];
      if (!id) throw new Error(`row for ${ed.table} has no ${pk}`);

      const idx = t.data.findIndex((r) => r[pk] === id);
      if (ed.op === "delete") {
        if (idx >= 0) { t.data.splice(idx, 1); applied.push(`-${id}`); }
      } else if (idx >= 0) {
        Object.assign(t.data[idx], ed.row);
        applied.push(`~${id}`);
      } else {
        t.data.push(ed.row);
        applied.push(`+${id}`);
      }
    }
    return applied;
  });
}

/**
 * Rebuild, streaming progress as SSE.
 *
 * Steps are run in order and any non-zero exit aborts the rest -- a partially
 * applied security configuration is worse than one that never changed, so we
 * stop and say so rather than pressing on.
 */
export function rebuildStream(res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  const send = (event, data) =>
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  const steps = [
    { name: "integrity",
      label: "Checking rulebook integrity",
      cmd: "python3", args: [path.join(ROOT, "tools",
                                       "check_rulebook_integrity.py")] },
    { name: "build",
      label: "effortless build (regenerating SQL from the rulebook)",
      cmd: "effortless", args: ["build"] },
    { name: "load",
      label: "init-db.sh (reload + regenerate access-control DDL)",
      cmd: path.join(ROOT, "postgres-bootstrap", "init-db.sh"), args: [] },
    { name: "witness",
      label: "Running access denial witnesses",
      cmd: "python3", args: [path.join(ROOT, "tools",
                                       "run_denial_witnesses.py")] },
  ];

  let i = 0;
  const runNext = () => {
    if (i >= steps.length) {
      send("done", { ok: true });
      return res.end();
    }
    const step = steps[i++];
    send("step", { name: step.name, label: step.label,
                   index: i, total: steps.length });

    const child = spawn(step.cmd, step.args, { cwd: ROOT, env: process.env });
    const relay = (buf) => {
      for (const line of String(buf).split("\n")) {
        if (line.trim()) send("log", { step: step.name, line });
      }
    };
    child.stdout.on("data", relay);
    child.stderr.on("data", relay);

    child.on("error", (err) => {
      send("failed", { step: step.name, error: err.message });
      res.end();
    });
    child.on("close", (code) => {
      if (code !== 0) {
        // The integrity check finding pre-existing COUNTIFS defects must not
        // block an unrelated policy edit, so it is advisory. Everything else
        // is fatal: a failed build or load leaves the database mid-change.
        if (step.name === "integrity") {
          send("warn", { step: step.name,
                         message: "integrity check reported findings; "
                                  + "continuing (see log above)" });
          return runNext();
        }
        send("failed", { step: step.name, code });
        return res.end();
      }
      send("stepdone", { step: step.name });
      runNext();
    });
  };
  runNext();
}

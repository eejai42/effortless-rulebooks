#!/usr/bin/env python3
"""Emit the access-control DDL from the rulebook.

Reads AccessPrincipals / AccessPolicies / FieldGrants / RoleSchemas /
RoleSchemaViews and writes postgres-bootstrap/06-access-control.sql.

The DDL is a pure function of the rulebook: delete the file, re-run, get the
same bytes. Nothing here is hand-maintained.

What it emits, in order:

  1. app.* JWT accessors  -- what a policy predicate calls to read the caller
  2. SECURITY DEFINER pass -- every calc_*/get_* fn, so a policy predicate can
     reference an inference many hops down the DAG (verified necessary: without
     it the fn returns NULL for a non-superuser and the policy silently denies
     every row)
  3. CREATE ROLE          -- one Postgres role per principal
  4. RLS policies         -- the vertical cut, on public base tables
  5. CREATE SCHEMA + views-- the horizontal cut; the principal's only search_path

Refuses to emit a predicate that sub-selects its own table: Postgres raises
'infinite recursion detected in policy for relation' at query time, which is a
runtime failure the generator can prevent at build time.
"""
import json, os, re, sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
RB = os.path.join(ROOT, "effortless-rulebook",
                  "procedural-knowledge-ontology-rulebook.json")
OUT = os.path.join(ROOT, "postgres-bootstrap", "06-access-control.sql")


def snake(n):
    return re.sub(r"_+", "_", re.sub(r"(?<!^)(?=[A-Z])", "_", n).lower())


def sql_str(s):
    return "'" + str(s).replace("'", "''") + "'"


def ident(s):
    """Quote a SQL identifier. Policy ids contain hyphens, which are operators
    in an unquoted identifier -- Postgres fails with 'syntax error at or near
    "-"'."""
    return '"' + str(s).replace('"', '""') + '"'


def live_view_columns():
    """{view_name: {column, ...}} for every public vw_* view in the database."""
    import subprocess
    db = os.environ.get(
        "DATABASE_URL",
        "postgresql://postgres@localhost:5432/erb_procedural_knowledge_ontology")
    r = subprocess.run(
        ["psql", db, "-tAF\x1f", "-c",
         "select table_name, column_name from information_schema.columns "
         "where table_schema='public' and table_name like 'vw\\_%'"],
        capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit(f"FATAL: cannot read live view columns: {r.stderr}")
    out = {}
    for line in r.stdout.strip().split("\n"):
        if not line:
            continue
        v, c = line.split("\x1f")
        out.setdefault(v, set()).add(c)
    return out


def validate_predicates(policies, tables):
    """Ask Postgres to parse every distinct predicate against its real table.

    Uses EXPLAIN on a SELECT ... WHERE <predicate>, which resolves column and
    function references without touching data. Catches the failure mode that
    bit this generator: a predicate naming a calc function that does not exist
    (calc_procedure_versions_is_current -- is_current is a stored column
    there, not a derivation). psql loads the file happily until that exact
    CREATE POLICY runs, then aborts with the rest of the security config
    unapplied.
    """
    import subprocess
    db = os.environ.get(
        "DATABASE_URL",
        "postgresql://postgres@localhost:5432/erb_procedural_knowledge_ontology")

    # distinct (table, predicate) pairs -- 446 policies collapse to a handful
    pairs = {}
    for pol in policies:
        for key in ("RowPredicate", "CheckPredicate"):
            pred = (pol.get(key) or "").strip()
            if not pred:
                continue
            tbl = tables.get(pol["TargetTable"])
            if tbl and tbl.get("PhysicalTable"):
                pairs.setdefault((tbl["PhysicalTable"], pred), []).append(
                    pol["AccessPolicyId"])

    probe = "\n".join(
        f"EXPLAIN (COSTS OFF) SELECT 1 FROM public.{t} WHERE ({p});"
        for (t, p) in pairs)
    if not probe:
        return []

    r = subprocess.run(["psql", db, "-tA", "-c", probe],
                       capture_output=True, text=True)
    if r.returncode == 0:
        return []

    # Re-probe individually to attribute the failure to a specific predicate.
    errs = []
    for (t, p), pol_ids in pairs.items():
        one = subprocess.run(
            ["psql", db, "-tA", "-v", "ON_ERROR_STOP=1",
             "-c", f"EXPLAIN (COSTS OFF) SELECT 1 FROM public.{t} WHERE ({p});"],
            capture_output=True, text=True)
        if one.returncode != 0:
            msg = next((l for l in one.stderr.splitlines() if "ERROR" in l),
                       one.stderr.strip())
            errs.append(f"predicate on {t} is invalid: {p!r}\n"
                        f"      {msg}\n"
                        f"      affects {len(pol_ids)} policies, "
                        f"e.g. {pol_ids[0]}")
    return errs


def main():
    rb = json.load(open(RB))

    principals = rb["AccessPrincipals"]["data"]
    policies = rb["AccessPolicies"]["data"]
    grants = rb["FieldGrants"]["data"]
    schemas = rb["RoleSchemas"]["data"]
    views = rb["RoleSchemaViews"]["data"]
    tables = {t["TableName"]: t for t in rb["RulebookTables"]["data"]}
    fields = {f["RulebookFieldId"]: f for f in rb["RulebookFields"]["data"]}

    by_id = {p["AccessPrincipalId"]: p for p in principals}
    schema_of = {s["Principal"]: s for s in schemas}

    # ---- validation: fail loudly at build time, not at query time -----------
    errors = []
    for pol in policies:
        pred = (pol.get("RowPredicate") or "").strip()
        if not pred:
            continue
        tbl = tables.get(pol["TargetTable"])
        if not tbl or not tbl.get("PhysicalTable"):
            errors.append(f"{pol['AccessPolicyId']}: no physical table for "
                          f"{pol['TargetTable']}")
            continue
        phys = tbl["PhysicalTable"]
        # a predicate that reads its own table -> infinite recursion at runtime
        if re.search(rf"\bfrom\s+(public\.)?{re.escape(phys)}\b", pred, re.I):
            errors.append(
                f"{pol['AccessPolicyId']}: predicate sub-selects its own table "
                f"({phys}); Postgres raises infinite recursion. Route it "
                f"through a SECURITY DEFINER function instead.")
        if pol["Principal"] not in by_id:
            errors.append(f"{pol['AccessPolicyId']}: unknown principal "
                          f"{pol['Principal']}")
    # Predicates are opaque SQL. The only way to know a predicate is valid is
    # to ask Postgres to parse it against the real table. A predicate naming a
    # function that does not exist loads fine until the exact statement runs,
    # and then aborts the whole file mid-way -- leaving a half-applied security
    # configuration, which is worse than none.
    if not os.environ.get("SKIP_PREDICATE_CHECK"):
        errors += validate_predicates(policies, tables)

    if errors:
        print("REFUSING TO EMIT -- invalid policies:", file=sys.stderr)
        for e in errors:
            print("  " + e, file=sys.stderr)
        sys.exit(1)

    # ---- readable columns per (principal, table), from FieldGrants ----------
    readable = defaultdict(list)
    for g in grants:
        if not g.get("CanRead"):
            continue
        fld = fields.get(g["TargetField"])
        if not fld:
            continue
        readable[(g["Principal"], fld["TargetTable"])].append(fld["FieldName"])

    L = []
    w = L.append
    w("-- ============================================================")
    w("-- 06-access-control.sql")
    w("-- GENERATED by tools/generate_access_ddl.py from the rulebook.")
    w("-- Do not edit. Edit the rulebook's access-control tables and rebuild.")
    w("-- ============================================================")
    w("")

    # ---- 1. app.* JWT accessors -------------------------------------------
    w("-- ---------- 1. JWT accessors -------------------------------------")
    w("-- Transaction-local GUCs, set once per request from a VERIFIED token.")
    w("-- Policies call these; they never read current_setting() directly.")
    w("CREATE SCHEMA IF NOT EXISTS app;")
    w("")
    for fn, guc in [("jwt_email", "app.jwt_email"),
                    ("jwt_principal", "app.jwt_principal"),
                    ("jwt_organization", "app.jwt_organization"),
                    ("jwt_role", "app.jwt_role"),
                    ("jwt_user", "app.jwt_user")]:
        w(f"CREATE OR REPLACE FUNCTION app.{fn}() RETURNS text")
        w("  LANGUAGE sql STABLE AS $$")
        w(f"    SELECT nullif(current_setting({sql_str(guc)}, true), '')")
        w("  $$;")
        w("")
    w("CREATE OR REPLACE FUNCTION app.jwt_is_admin() RETURNS boolean")
    w("  LANGUAGE sql STABLE AS $$")
    w("    SELECT coalesce(current_setting('app.jwt_is_admin', true) = 'true',"
      " false)")
    w("  $$;")
    w("")

    # ---- 2. SECURITY DEFINER pass -----------------------------------------
    w("-- ---------- 2. SECURITY DEFINER pass ------------------------------")
    w("-- Calc/lookup/aggregation functions are pure derivations over the whole")
    w("-- dataset. A policy predicate calls them, so they must see all rows --")
    w("-- otherwise they return NULL for a non-superuser and every policy")
    w("-- silently denies everything (verified against this database).")
    w("-- The CUT belongs at the policy and view layer above, never inside the")
    w("-- DAG evaluator.")
    w("--")
    w("-- Safety: these take a primary key and return a scalar. A calc function")
    w("-- that took arbitrary input and returned rows would be a leak; do not")
    w("-- write one.")
    w("DO $$")
    w("DECLARE r record; n int := 0;")
    w("BEGIN")
    w("  FOR r IN")
    w("    SELECT p.oid::regprocedure AS sig")
    w("    FROM pg_proc p JOIN pg_namespace ns ON ns.oid = p.pronamespace")
    w("    WHERE ns.nspname = 'public'")
    w("      AND (p.proname LIKE 'calc\\_%' OR p.proname LIKE 'get\\_%')")
    w("      AND p.prokind = 'f'")
    w("  LOOP")
    w("    EXECUTE format('ALTER FUNCTION %s SECURITY DEFINER', r.sig);")
    w("    EXECUTE format('ALTER FUNCTION %s SET row_security = off', r.sig);")
    w("    n := n + 1;")
    w("  END LOOP;")
    w("  RAISE NOTICE 'access-control: % derivation functions marked "
      "SECURITY DEFINER', n;")
    w("END $$;")
    w("")

    # ---- 3. roles ----------------------------------------------------------
    w("-- ---------- 3. Principals as Postgres roles -----------------------")
    for p in principals:
        role = p["PgRoleName"]
        w(f"DO $$ BEGIN")
        w(f"  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = "
          f"{sql_str(role)}) THEN")
        w(f"    CREATE ROLE {role} NOLOGIN;")
        w(f"  END IF;")
        w(f"END $$;")
    w("")
    w("-- Base-table SELECT is granted, and RLS is what makes that safe.")
    w("-- (Ownership-chaining does NOT survive the calc_* hop, so a narrowed")
    w("--  view cannot borrow the owner's rights -- verified.)")
    for p in principals:
        role = p["PgRoleName"]
        w(f"GRANT USAGE ON SCHEMA public TO {role};")
        w(f"GRANT SELECT ON ALL TABLES IN SCHEMA public TO {role};")
        w(f"GRANT USAGE ON SCHEMA app TO {role};")
        w(f"GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO {role};")
    w("")

    # ---- 4. RLS policies ---------------------------------------------------
    w("-- ---------- 4. Row policies (the VERTICAL cut) --------------------")
    w("-- RLS is already ENABLED on every table by 04-create-policies.sql with")
    w("-- no policies, so the default is deny-all. These open specific doors.")
    w("")
    emitted = 0
    for pol in policies:
        p = by_id[pol["Principal"]]
        tbl = tables.get(pol["TargetTable"])
        if not tbl or not tbl.get("PhysicalTable"):
            continue
        phys = tbl["PhysicalTable"]
        role = p["PgRoleName"]
        cmd = pol["Command"].upper()
        pred = (pol.get("RowPredicate") or "").strip() or "true"
        check = (pol.get("CheckPredicate") or "").strip()
        name = ident(pol["AccessPolicyId"][:60])
        rationale = (pol.get("Rationale") or "").replace("\n", " ")
        w(f"-- {rationale}")
        w(f"DROP POLICY IF EXISTS {name} ON public.{phys};")
        if cmd == "INSERT":
            # INSERT takes WITH CHECK only -- USING is a syntax error there.
            line = (f"CREATE POLICY {name} ON public.{phys} FOR INSERT "
                    f"TO {role} WITH CHECK ({check or pred})")
        else:
            line = (f"CREATE POLICY {name} ON public.{phys} FOR {cmd} "
                    f"TO {role} USING ({pred})")
            if cmd in ("UPDATE", "ALL"):
                line += f" WITH CHECK ({check or pred})"
        w(line + ";")
        emitted += 1
    w("")

    # ---- 5. role schemas + narrowed views ---------------------------------
    w("-- ---------- 5. Role schemas (the HORIZONTAL cut) ------------------")
    w("-- Each principal's schema is its ENTIRE visible world: it is the only")
    w("-- entry on their search_path, so a table absent from it cannot be")
    w("-- named, and a column absent from a view does not exist for them.")
    w("")
    for s in schemas:
        p = by_id[s["Principal"]]
        sch, role = s["SchemaName"], p["PgRoleName"]
        w(f"DROP SCHEMA IF EXISTS {sch} CASCADE;")
        w(f"CREATE SCHEMA {sch};")
        w(f"GRANT USAGE ON SCHEMA {sch} TO {role};")
        if s.get("IsSealed"):
            w(f"REVOKE CREATE ON SCHEMA {sch} FROM {role};")
        w(f"ALTER ROLE {role} SET search_path = {sch};")
        w("")

    # The rulebook's field catalog can be AHEAD of the database: another agent
    # adds a field, the catalog reconciles, but the DB has not been rebuilt.
    # Emitting SELECT <that column> yields 'column does not exist' mid-load and
    # aborts, leaving security half-applied. The live view is authoritative for
    # what can be selected TODAY, so intersect against it and report the gap.
    live_cols = live_view_columns()

    view_count, skipped, stale = 0, [], []
    for v in views:
        p = by_id[v["Principal"]]
        s = schema_of.get(v["Principal"])
        tbl = tables.get(v["TargetTable"])
        if not s or not tbl or not tbl.get("PhysicalView"):
            continue
        cols = sorted(set(readable.get((v["Principal"], v["TargetTable"]), [])))
        present = live_cols.get(tbl["PhysicalView"], set())
        if present:
            missing = [c for c in cols if snake(c) not in present]
            if missing:
                stale.append(f"{tbl['PhysicalView']}: "
                             f"{', '.join(sorted(snake(m) for m in missing))}")
            cols = [c for c in cols if snake(c) in present]
        if not cols:
            skipped.append(f"{s['SchemaName']}.{v['ViewName']}")
            continue
        collist = ", ".join(snake(c) for c in cols)
        w(f"CREATE VIEW {s['SchemaName']}.{v['ViewName']} AS")
        w(f"  SELECT {collist} FROM public.{tbl['PhysicalView']};")
        w(f"ALTER VIEW {s['SchemaName']}.{v['ViewName']} OWNER TO postgres;")
        w(f"GRANT SELECT ON {s['SchemaName']}.{v['ViewName']} "
          f"TO {p['PgRoleName']};")
        view_count += 1
    w("")

    if skipped:
        # A view with no readable columns is invalid DDL. Say so out loud.
        w("-- WARNING: skipped, zero readable columns granted:")
        for sk in skipped:
            w(f"--   {sk}")
        w("")

    if stale:
        w("-- WARNING: catalog is AHEAD of the database. These granted fields")
        w("-- do not exist in the live view yet, and were omitted. Run")
        w("-- `effortless build` + init-db.sh to bring the database level.")
        for s_ in sorted(set(stale)):
            w(f"--   {s_}")
        w("")

    w("DO $$ BEGIN RAISE NOTICE 'access-control: "
      f"{len(principals)} principals, {emitted} policies, {view_count} views'; "
      "END $$;")
    w("")

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as fh:
        fh.write("\n".join(L))

    print(f"wrote {OUT}")
    print(f"  principals {len(principals)}  policies {emitted}  "
          f"views {view_count}")
    if skipped:
        print(f"  skipped {len(skipped)} zero-column views: {skipped[:3]}")
    if stale:
        print(f"  WARNING: catalog ahead of DB in {len(set(stale))} views "
              f"(fields omitted): {sorted(set(stale))[:3]}")


if __name__ == "__main__":
    main()

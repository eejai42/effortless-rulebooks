#!/usr/bin/env python3
"""Run the AccessDenialTests against Postgres and write the results back.

A policy with no failing case seeded against it is an assertion, not evidence.
Each test names a principal, a table, and a row that must (or must not) be
visible when queried AS that principal through its own schema.

Results are written back into the rulebook's AccessDenialTests.ObservedVisible
and LastRunAt -- the substrate is the oracle, never Python.

Exit code is non-zero if any test fails, so this can gate a build.
"""
import json, os, re, subprocess, sys
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
RB = os.path.join(ROOT, "effortless-rulebook",
                  "procedural-knowledge-ontology-rulebook.json")
DB = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres@localhost:5432/erb_procedural_knowledge_ontology")


def snake(n):
    return re.sub(r"_+", "_", re.sub(r"(?<!^)(?=[A-Z])", "_", n).lower())


def run(sql):
    r = subprocess.run(["psql", DB, "-tA", "-v", "ON_ERROR_STOP=1", "-c", sql],
                       capture_output=True, text=True)
    return r.returncode, r.stdout.strip(), r.stderr.strip()


def main():
    rb = json.load(open(RB))
    tests = rb["AccessDenialTests"]["data"]
    principals = {p["AccessPrincipalId"]: p
                  for p in rb["AccessPrincipals"]["data"]}
    tables = {t["TableName"]: t for t in rb["RulebookTables"]["data"]}
    users = rb["AppUsers"]["data"]
    assigns = rb["PrincipalAssignments"]["data"]

    # a representative signed-in user for each principal, for the GUCs
    user_for = {}
    for a in assigns:
        u = next((x for x in users if x["AppUserId"] == a["AppUser"]), None)
        if u:
            user_for.setdefault(a["Principal"], u)

    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    results, failures = [], []

    for t in tests:
        p = principals[t["Principal"]]
        tbl = tables[t["TargetTable"]]
        view = snake(t["TargetTable"])
        pk = snake(rb[t["TargetTable"]]["schema"][0]["name"])
        u = user_for.get(t["Principal"], {})

        # The column-absence test is a different question: not "is the row
        # filtered" but "does the column exist at all". Selecting it must ERROR.
        is_column_test = "contact_address" in (t.get("Rationale") or "").lower() \
            or "ContactAddress" in (t.get("Rationale") or "")

        gucs = (
            f"SELECT set_config('app.jwt_email',{sq(u.get('EmailAddress',''))},true);"
            f"SELECT set_config('app.jwt_principal',{sq(t['Principal'])},true);"
            f"SELECT set_config('app.jwt_organization',{sq(p.get('OrganizationScope') or org_of(rb,p))},true);"
            f"SELECT set_config('app.jwt_role',{sq(p['DomainRole'])},true);"
            f"SELECT set_config('app.jwt_is_admin',{sq(str(bool(p.get('IsAdministrator'))).lower())},true);"
        )

        if is_column_test:
            sql = (f"BEGIN;{gucs}SET LOCAL ROLE {p['PgRoleName']};"
                   f"SELECT contact_address FROM {p['SchemaName']}.{view} "
                   f"LIMIT 1;COMMIT;")
            rc, out, err = run(sql)
            # visible == the column could be selected
            observed = (rc == 0)
            detail = "column absent (error as required)" if rc else \
                     "COLUMN IS READABLE -- leak"
        else:
            sql = (f"BEGIN;{gucs}SET LOCAL ROLE {p['PgRoleName']};"
                   f"SELECT count(*) FROM {p['SchemaName']}.{view} "
                   f"WHERE {pk} = {sq(t['ForbiddenRowId'])};COMMIT;")
            rc, out, err = run(sql)
            if rc != 0:
                failures.append((t["AccessDenialTestId"], f"query failed: {err}"))
                t["ObservedVisible"] = None
                t["LastRunAt"] = now
                results.append((t["AccessDenialTestId"], None,
                                t["ExpectedVisible"], "ERROR: " + err[:60]))
                continue
            n = int([l for l in out.split("\n") if l.strip().isdigit()][-1])
            observed = n > 0
            detail = f"{n} row(s)"

        t["ObservedVisible"] = observed
        t["LastRunAt"] = now
        ok = (observed == t["ExpectedVisible"])
        if not ok:
            failures.append((t["AccessDenialTestId"],
                             f"expected visible={t['ExpectedVisible']}, "
                             f"observed={observed}"))
        results.append((t["AccessDenialTestId"], observed,
                        t["ExpectedVisible"], detail))

    # write results back -- re-read first, the file is contended
    rb2 = json.load(open(RB))
    by_id = {t["AccessDenialTestId"]: t for t in tests}
    for t in rb2["AccessDenialTests"]["data"]:
        src = by_id.get(t["AccessDenialTestId"])
        if src:
            t["ObservedVisible"] = src["ObservedVisible"]
            t["LastRunAt"] = src["LastRunAt"]
    tmp = RB + ".tmp"
    json.dump(rb2, open(tmp, "w"), indent=1, ensure_ascii=False)
    os.replace(tmp, RB)

    print(f"{'TEST':44s} {'EXPECT':7s} {'OBSERVED':9s} DETAIL")
    for tid, obs, exp, detail in results:
        mark = "ok " if obs == exp else "FAIL"
        print(f"{mark} {tid:40s} {str(exp):7s} {str(obs):9s} {detail}")

    n_deny = sum(1 for t in tests if not t["ExpectedVisible"])
    n_allow = len(tests) - n_deny
    print(f"\n{len(tests)} tests: {n_deny} denials, {n_allow} positive controls")
    if failures:
        print(f"\n{len(failures)} FAILURES:")
        for tid, why in failures:
            print(f"  {tid}: {why}")
        sys.exit(1)
    print("all passing")


def sq(s):
    return "'" + str(s).replace("'", "''") + "'"


def org_of(rb, p):
    for r in rb["Roles"]["data"]:
        if r["RoleId"] == p["DomainRole"]:
            return r.get("Organization") or ""
    return ""


if __name__ == "__main__":
    main()

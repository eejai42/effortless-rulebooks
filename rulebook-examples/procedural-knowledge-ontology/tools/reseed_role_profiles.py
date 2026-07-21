#!/usr/bin/env python3
"""Re-seed AccessPolicies / FieldGrants / RoleSchemaViews from role_profiles.py.

Replaces the first-pass seeding, where every non-admin got the same 29 tables
from one shared list -- twelve principals with two distinct views between them.
Each principal now gets only the tables and fields its job needs.

Every field named in a profile is checked against the real schema. A typo
would otherwise become a silently-missing column: the generator intersects
grants against live view columns, so an unknown name is dropped without
comment and the role quietly loses a field it was supposed to have.
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from role_profiles import PROFILES, ALL

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
RB = os.path.join(ROOT, "effortless-rulebook",
                  "procedural-knowledge-ontology-rulebook.json")
IRI = "urn:effortless:pko-extension#"


def snake(n):
    return re.sub(r"_+", "_", re.sub(r"(?<!^)(?=[A-Z])", "_", n).lower())


# Row predicates stay as they were -- the vertical cut is orthogonal to which
# tables a role can reach, and it was already correct.
ORG_SCOPED = {
    "Agents": "organization = app.jwt_organization()",
    "Recipients": "organization = app.jwt_organization()",
    "CommunitiesOfPractice": "organization = app.jwt_organization()",
}
INFERENCE_SCOPED = {
    "ChangeRequests": (
        "public.calc_change_requests_is_open(change_request_id)",
        "Open change requests only. is_open is derived several hops down the "
        "DAG, so the policy stays one line while the semantics stay deep."),
    "KnowledgeGaps": (
        "public.calc_knowledge_gaps_is_open(knowledge_gap_id)",
        "Open knowledge gaps only; resolved gaps are governance history."),
    "RoleAssignments": (
        "public.calc_role_assignments_is_current(role_assignment_id)",
        "Only assignments in force at the modelled evaluation instant."),
    "ProcedureVersions": (
        "is_current",
        "Only the current version of each procedure. is_current is a stored "
        "column here, not a derivation, so the predicate reads it directly."),
}
OWN_ROLE = {
    "KnowledgeFragments": "owner_role = app.jwt_role()",
    "StewardshipAssignments": "steward_role = app.jwt_role()",
}


def main():
    rb = json.load(open(RB))
    tables = {k: v for k, v in rb.items()
              if isinstance(v, dict) and "schema" in v}
    fields_by_table = {}
    for f in rb["RulebookFields"]["data"]:
        fields_by_table.setdefault(f["TargetTable"], {})[f["FieldName"]] = f

    principals = rb["AccessPrincipals"]["data"]
    by_role = {p["DomainRole"]: p for p in principals}

    # ---- validate the profiles before touching anything -------------------
    errors = []
    for role, prof in PROFILES.items():
        if role not in by_role:
            errors.append(f"{role}: no principal for this domain role")
        if prof.get("admin"):
            continue
        for tname, flds in prof["tables"].items():
            if tname not in tables:
                errors.append(f"{role}: table {tname!r} does not exist")
                continue
            if flds == ALL:
                continue
            known = fields_by_table.get(tname, {})
            for fn in flds:
                if fn not in known:
                    near = [k for k in known if k.lower().startswith(fn[:6].lower())]
                    errors.append(
                        f"{role}: {tname}.{fn} does not exist"
                        + (f" (did you mean {near[0]}?)" if near else ""))
    if errors:
        print("REFUSING TO SEED -- profile errors:", file=sys.stderr)
        for e in errors:
            print("  - " + e, file=sys.stderr)
        sys.exit(1)

    # ---- build ------------------------------------------------------------
    admin_tables = [t["TableName"] for t in rb["RulebookTables"]["data"]
                    if t.get("PhysicalView")]
    policies, grants, views = [], [], []

    for p in principals:
        role = p["DomainRole"]
        pid = p["AccessPrincipalId"]
        prof = PROFILES[role]
        short = role.replace("-", "")

        if prof.get("admin"):
            wanted = {t: ALL for t in admin_tables}
        else:
            wanted = prof["tables"]

        for tname, flds in wanted.items():
            tbl = tables.get(tname)
            if not tbl:
                continue

            # policy (the vertical cut)
            pred, why = "", ("Full read: this principal is a declared "
                             "administrator." if prof.get("admin")
                             else prof["why"])
            infer = False
            if not prof.get("admin"):
                if tname in ORG_SCOPED:
                    pred = ORG_SCOPED[tname]
                    why = ("Tenancy boundary: only rows belonging to this "
                           "principal's own organization.")
                elif tname in INFERENCE_SCOPED:
                    pred, why = INFERENCE_SCOPED[tname]
                    infer = "calc_" in pred
                elif tname in OWN_ROLE:
                    pred = OWN_ROLE[tname]
                    why = "Ownership: only the rows this role owns."
            policies.append({
                "AccessPolicyId": f"pol-{short}-{snake(tname)}-select",
                "Principal": pid, "TargetTable": tname, "Command": "SELECT",
                "RowPredicate": pred, "CheckPredicate": "",
                "Rationale": why, "ReferencesInference": infer,
                "SemanticTypeIri": IRI + "AccessPolicy",
            })

            # grants (the horizontal cut)
            names = (list(fields_by_table.get(tname, {}))
                     if flds == ALL else list(flds))
            for fn in names:
                grants.append({
                    "FieldGrantId": f"fg-{role}-{tname}.{fn}",
                    "Principal": pid, "TargetField": f"{tname}.{fn}",
                    "CanRead": True, "CanWrite": False, "MaskStrategy": "plain",
                    "SemanticTypeIri": IRI + "FieldGrant",
                })

            views.append({
                "RoleSchemaViewId": f"rsv-{role}-{snake(tname)}",
                "RoleSchema": f"schema-{role}", "Principal": pid,
                "TargetTable": tname, "ViewName": snake(tname),
                "SemanticTypeIri": IRI + "RoleSchemaView",
            })

    # ---- write ------------------------------------------------------------
    rb2 = json.load(open(RB))          # re-read: contended file
    rb2["AccessPolicies"]["data"] = policies
    rb2["FieldGrants"]["data"] = grants
    rb2["RoleSchemaViews"]["data"] = views
    tmp = RB + ".tmp"
    json.dump(rb2, open(tmp, "w"), indent=1, ensure_ascii=False)
    os.replace(tmp, RB)

    print(f"policies {len(policies)}  grants {len(grants)}  views {len(views)}\n")
    print(f"{'principal':26s} {'tables':>7s} {'fields':>7s}")
    for p in principals:
        role = p["DomainRole"]
        t = sum(1 for v in views if v["Principal"] == p["AccessPrincipalId"])
        g = sum(1 for x in grants if x["Principal"] == p["AccessPrincipalId"])
        tag = "  (admin)" if PROFILES[role].get("admin") else ""
        print(f"  {role:24s} {t:7d} {g:7d}{tag}")


if __name__ == "__main__":
    main()

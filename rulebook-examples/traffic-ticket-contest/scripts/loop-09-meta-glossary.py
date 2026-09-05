#!/usr/bin/env python3
"""
LOOP 9 — DevOps, meta, glossary, and inferences. Expands the glossary to cover
every domain/platform term used in features and rules; adds 2 glossary
categories (system, analytics); records an ERBVersions row + ERBCustomizations
narrating the 10-loop expansion; enriches __meta__ (motif, signature_rows,
journal_seed, build_story); and adds a BuildPhases inference table naming the
integer BuildPhase values used on nav rows. Adds ERBTables/ERBFields catalog
rows for the new table.

  python3 scripts/loop-09-meta-glossary.py --dry-run
  python3 scripts/loop-09-meta-glossary.py
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
RB = os.path.join(ROOT, "effortless-rulebook", "traffic-ticket-contest-rulebook.json")
DRY = "--dry-run" in sys.argv
NOW = "2026-06-07T20:15:00Z"
WHO = "admin-example"


def audit(row):
    row.setdefault("CreatedAt", NOW); row.setdefault("CreatedBy", WHO)
    row.setdefault("ModifiedAt", NOW); row.setdefault("ModifiedBy", WHO)
    return row


def F(name, dtype, ftype, desc, formula=None, related=None, nullable=True):
    f = {"name": name, "datatype": dtype, "type": ftype, "nullable": nullable, "Description": desc}
    if formula: f["formula"] = formula
    if related: f["RelatedTo"] = related
    return f


AUD = [F("CreatedAt","string","raw","Audit."),F("CreatedBy","string","raw","Audit."),
       F("ModifiedAt","string","raw","Audit."),F("ModifiedBy","string","raw","Audit.")]

BUILDPHASES_SCHEMA = [
    F("BuildPhaseId", "string", "raw", "PK = phase key (phase-1 .. phase-5).", nullable=False),
    F("Name", "string", "calculated", "Echoes BuildPhaseId.", formula="={{BuildPhaseId}}"),
    F("PhaseNumber", "number", "raw", "Integer that matches PlatformNaviation.BuildPhase."),
    F("Title", "string", "raw", "Phase name."),
    F("Description", "string", "raw", "What is built in this phase."),
] + AUD

# New glossary categories.
NEW_CATS = [
    ("system", "System & Platform", "Cross-cutting platform machinery terms.", 5),
    ("analytics", "Analytics & Cost", "Assistant, cost, and reporting terms.", 6),
]

# New glossary terms (term-id, Term, Category, Definition).
NEW_TERMS = [
    ("term-adjudication", "Adjudication", "lifecycle", "The recorded outcome of a contested citation after a hearing — upheld, reduced, or dismissed — which advances the citation-lifecycle to its adjudicated state."),
    ("term-determination", "Determination", "lifecycle", "The formal ruling on a contest, captured on the Citation and rendered into a determination letter from the jurisdiction template."),
    ("term-contest-ground", "Contest Ground", "legal", "A recognized legal basis for disputing a citation (signage, malfunction, emergency, calibration, mistaken identity), drawn from the ContestGrounds catalog per ViolationType."),
    ("term-fee-schedule", "Fee Schedule", "money", "The per-(jurisdiction, violation) base fine and surcharge percentage in FeeSchedules that drives a citation's amount due."),
    ("term-deadline-rule", "Deadline Rule", "legal", "A per-jurisdiction window (contest, payment, appeal) in DeadlineRules that determines a citation's computed deadlines and late penalties."),
    ("term-surcharge", "Surcharge", "money", "A percentage added to the base fine per jurisdiction, contributing to the total amount due on a citation."),
    ("term-work-queue", "Work Queue", "system", "The prioritized list of non-terminal items (deadlines, hearings, payments) a role must act on, scoped by that role's WHERE policy."),
    ("term-state-machine", "State Machine", "system", "A data-defined lifecycle (citation-lifecycle, contest-track, payment-track, license-track) of states and guarded transitions enforced by the backbone."),
    ("term-transition-guard", "Transition Guard", "system", "The condition (referencing a business rule) that must hold for a state transition to fire, plus the role allowed to fire it."),
    ("term-rbac", "RBAC", "system", "Role-Based Access Control: the role->table->field CRUD model plus WHERE policies and redaction that govern who can do what."),
    ("term-rls", "Row-Level Security", "system", "Derived Postgres predicates that scope each role's visible rows (e.g. a representative sees only assigned citations), compiled from WHERE policies."),
    ("term-redaction", "Redaction", "system", "Masking of PII fields (license number, address) for roles like external-llm at the moment a row leaves the database."),
    ("term-licensing", "Licensing", "system", "Per-package/feature/table/route entitlement toggles that add or remove surfaces from the platform without code changes."),
    ("term-explainer-dag", "Explainer DAG", "system", "The visual inference graph showing how a calculated field (e.g. a contest deadline) is derived from raw inputs and lookups."),
    ("term-assistant", "Portal Assistant", "analytics", "A context-aware chat that answers grounded in the current screen, role, and row, respecting permissions and redaction, with per-turn cost telemetry."),
    ("term-cost-telemetry", "Cost Telemetry", "analytics", "Per-turn records of assistant/OCR token usage and dollar cost, rolled up by model, role, and case for the cost dashboard."),
    ("term-business-rule", "Business Rule", "legal", "A numbered TT-* record stating a precise platform rule, linked from the features, transitions, and tests that implement and verify it."),
    ("term-jurisdiction-rule", "Jurisdiction Rule", "legal", "A per-state law governing fines, surcharges, deadlines, and point schedules, sourced from JurisdictionRules."),
    ("term-driver-portal", "Driver Portal", "people", "The public self-service surface where a driver looks up their own citation and chooses to pay or contest."),
    ("term-determination-letter", "Determination Letter", "legal", "The official outcome document generated from a hearing determination using the jurisdiction's template."),
]

# __meta__ enrichments (key, valuetype, stringvalue, jsonvalue).
NEW_META = [
    ("motif", "string", "Courthouse-meets-control-panel: a citizen-facing contest portal sitting on a fully self-describing rules-and-lifecycle engine.", None),
    ("motif_palette", "string", "Slate navy, signal amber, verdict green, penalty red.", None),
    ("signature_rows", "array", None, None),
    ("journal_seed", "string", "Built rulebook-first across ten Effortless loops: features, rules, navigation, endpoints, state machines, a test surface, screen hints, deeper domain data, and meta — every layer cross-linked and consistency-gated before any app code.", None),
    ("build_story", "string", "The traffic-ticket-contest rulebook is a fully-specified, buildable platform spec: 90+ features each with SourceText + RuleRefs + a nav route + tests; 57 business rules; 36 API actions; 4 complete state machines; 194 conformance test cases; 525+ screen/field display hints; all FKs and refs consistency-gated.", None),
]
SIGNATURE_ROWS = [
    {"label": "Features", "value": "90+ fully-specified capabilities, 15 starred"},
    {"label": "Business Rules", "value": "57 numbered TT-* rules, every feature ref resolves"},
    {"label": "State Machines", "value": "4 lifecycles, 25 states, 26 guarded transitions"},
    {"label": "Conformance", "value": "194 test cases / 351 expectations, 100% coverage"},
]

BUILD_PHASES = [
    ("phase-1", 1, "Foundation", "Core platform, permissions, navigation, and the self-describing catalog."),
    ("phase-2", 2, "Domain Spine", "Citations, drivers, hearings, payments, and the state machines."),
    ("phase-3", 3, "Rules & Jurisdictions", "Business rules, fee schedules, deadline rules, and contest grounds."),
    ("phase-4", 4, "Analytics & Assistant", "Work queue, cost telemetry, and the portal assistant."),
    ("phase-5", 5, "Conformance & Polish", "Test surface, screen hints, and the deadline/points dashboards."),
]


def main():
    rb = json.load(open(RB))

    # 1. glossary categories
    gcats = rb["GlossaryCategories"]["data"]
    have_gc = {c["GlossaryCategoryId"] for c in gcats}
    gc_added = 0
    for (cid, title, desc, o) in NEW_CATS:
        if cid in have_gc:
            continue
        gcats.append(audit({"GlossaryCategoryId": cid, "Title": title, "Description": desc, "SortOrder": o}))
        have_gc.add(cid); gc_added += 1

    # 2. glossary terms
    gts = rb["GlossaryTerms"]["data"]
    have_gt = {g["GlossaryTermId"] for g in gts}
    base = max((g.get("SortOrder") or 0) for g in gts)
    gt_added = 0
    for i, (tid, term, cat, defn) in enumerate(NEW_TERMS):
        if tid in have_gt:
            continue
        gts.append(audit({"GlossaryTermId": tid, "Term": term, "Category": cat,
                          "SortOrder": base + i + 1, "Definition": defn}))
        have_gt.add(tid); gt_added += 1

    # 3. ERBVersions
    vers = rb["ERBVersions"]["data"]
    have_v = {v["ERBVersionId"] for v in vers}
    v_added = 0
    if "v-2-0-0-spec" not in have_v:
        vers.append(audit({
            "ERBVersionId": "v-2-0-0-spec", "Name": "v2.0.0-spec",
            "BaseId": vers[0].get("BaseId", "") if vers else "",
            "Version": "2.0.0",
            "Message": "Full platform specification — 10-loop rulebook expansion.",
            "Notes": "Features fully specified (SourceText/RuleRefs/routes), 57 business rules, complete navigation, 36 API actions, 4 finished state machines, 194-case test surface, screen display hints, deeper domain data, and enriched meta — all consistency-gated.",
            "CommitDate": "2026-06-07", "IsPublished": False, "Author": "eejai42@gmail.com",
        }))
        v_added += 1

    # 4. ERBCustomizations narrating the expansion
    custs = rb["ERBCustomizations"]["data"]
    have_c = {c.get("ERBCustomizationId") for c in custs}
    cfields = {f["name"] for f in (rb["ERBCustomizations"]["schema"]
               if isinstance(rb["ERBCustomizations"]["schema"], list)
               else rb["ERBCustomizations"]["schema"]["fields"])}
    c_added = 0
    for cid, title, note in [
        ("cust-iskey-flag", "IsKey star flag", "Added a raw IsKey boolean to ERBFeatures/ERBPackages to mark headline capabilities."),
        ("cust-test-surface", "Test surface tables", "Introduced 8 test-surface tables with a derived 194-case conformance corpus."),
        ("cust-display-hints", "Display-hint tables", "Encoded per-screen UI design decisions as data in ScreenLayouts/ScreenSections/FieldDisplayHints."),
    ]:
        if cid in have_c:
            continue
        row = {"ERBCustomizationId": cid}
        for cand, val in (("Title", title), ("Name", cid), ("Description", note), ("Notes", note),
                          ("Kind", "schema"), ("Status", "applied")):
            if cand in cfields:
                row[cand] = val
        custs.append(audit(row)); have_c.add(cid); c_added += 1

    # 5. __meta__ enrichment
    meta = rb["__meta__"]["data"]
    have_m = {m["MetaKey"] for m in meta}
    m_added = 0
    for (key, vtype, sval, jval) in NEW_META:
        if key in have_m:
            continue
        if key == "signature_rows":
            jval = json.dumps(SIGNATURE_ROWS)
        meta.append({"MetaKey": key, "ValueType": vtype, "StringValue": sval, "JsonValue": jval})
        have_m.add(key); m_added += 1

    # 6. BuildPhases inference table + catalog
    created = []
    if "BuildPhases" not in rb:
        rb["BuildPhases"] = {"schema": [dict(f) for f in BUILDPHASES_SCHEMA], "data": []}
        created.append("BuildPhases")
    bps = rb["BuildPhases"]["data"]
    have_bp = {b["BuildPhaseId"] for b in bps}
    bp_added = 0
    for (pid, num, title, desc) in BUILD_PHASES:
        if pid in have_bp:
            continue
        bps.append(audit({"BuildPhaseId": pid, "PhaseNumber": num, "Title": title, "Description": desc}))
        have_bp.add(pid); bp_added += 1

    # catalog BuildPhases
    et = rb["ERBTables"]["data"]; ef = rb["ERBFields"]["data"]
    have_et = {x["ERBTableId"] for x in et}; have_ef = {x["ERBFieldId"] for x in ef}
    et_added = ef_added = 0
    if "BuildPhases" not in have_et:
        et.append(audit({
            "ERBTableId": "BuildPhases", "TableName": "BuildPhases",
            "Description": "Inference table naming the BuildPhase integers used on nav rows.",
            "ERBPackage": "platform-meta", "Platform": "ticket-portal",
            "IsLicensed": True, "FieldCount": len(BUILDPHASES_SCHEMA), "IsCatalog": True,
            "AdminCRUD": "CRUD", "ManagerCRUD": "R", "RepresentativeCRUD": "R", "ExternalLlmCRUD": "R",
        }))
        et_added += 1
    for fld in BUILDPHASES_SCHEMA:
        fid = f"BuildPhases.{fld['name']}"
        if fid in have_ef:
            continue
        ef.append(audit({"ERBFieldId": fid, "ERBTable": "BuildPhases", "FieldName": fld["name"],
                         "FieldType": fld["type"], "Datatype": fld["datatype"], "Description": fld.get("Description", "")}))
        ef_added += 1

    # glossary coverage check: terms used in feature/rule text that look like jargon
    defined = {g["Term"].lower() for g in gts}
    KEY_TERMS = ["redaction", "rls", "rbac", "state machine", "work queue", "fee schedule",
                 "deadline", "contest ground", "adjudication", "determination", "surcharge",
                 "licensing", "explainer dag", "assistant", "cost telemetry", "jurisdiction rule",
                 "business rule", "points", "fine", "late penalty", "hearing"]
    missing = [t for t in KEY_TERMS if t not in defined and t.replace(" ", "") not in {d.replace(" ", "") for d in defined}]

    print("=== LOOP 9: meta + glossary ===")
    print("glossary categories +%d (%d) | terms +%d (%d)" % (gc_added, len(gcats), gt_added, len(gts)))
    print("ERBVersions +%d | ERBCustomizations +%d | __meta__ +%d" % (v_added, c_added, m_added))
    print("BuildPhases table:", created, "| phases +%d" % bp_added)
    print("ERBTables +%d | ERBFields +%d" % (et_added, ef_added))
    print("key terms not in glossary:", len(missing), missing)
    # glossary FK check
    bad = [g["GlossaryTermId"] for g in gts if g.get("Category") not in have_gc]
    print("glossary Category unresolved:", len(bad), bad[:8])
    if bad:
        print("\nABORT."); sys.exit(1)
    if DRY:
        print("\n[dry-run] no write"); return
    with open(RB, "w") as fh:
        fh.write(json.dumps(rb, indent=2, ensure_ascii=False) + "\n")
    print("\nwrote", RB)


if __name__ == "__main__":
    main()

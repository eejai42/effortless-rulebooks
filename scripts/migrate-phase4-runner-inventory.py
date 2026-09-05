#!/usr/bin/env python3
"""Phase 4 of PLATFORM-EXPLORER-PLAN.md: the legacy-runner succession ledger.

`rulebook-examples/legacy-runner/` is a permanent, ordinary governed example: the
way the platform used to run every project, kept working as the legacy view of the
same pipeline. It is no longer *privileged*. `LegacyRunnerCapabilities` records,
for each of its capabilities, which platform surface now owns that role (the root
explorer, the generated editor, the effortless CLI's local transpiler host, or
nothing). The runner keeps its copy of every capability; nothing is deleted.

Decision vocabulary: promote (root now owns it), separate (a standalone tool now
owns it), replace (a generated or CLI surface now owns it), retire (no platform
role any more; stays in the runner as history). Status: decided / in-progress /
done, where done means the successor exists and is wired.

Also reconciles US-051 / US-052 and points the explorer's progress route at the table.

Usage:
    python3 scripts/migrate-phase4-runner-inventory.py effortless-rulebook/effortless-rulebook.json
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

PROJECT = "erb-001"
BUS_DESTINATION = (
    "Its own governed project (working name rulebook-examples/transpiler-bus/) with its own rulebook, "
    "README, CLAUDE.md and start.sh; until the move, launch it with "
    "rulebook-examples/legacy-runner/ssotme-proxy/start.sh"
)

# id, title, runner path, summary, decision, destination, rationale, status, dependents
CAPABILITIES = [
    ("cap-admin-portal", "Admin portal", "admin-portal/",
     "Two-rulebook web editor on :7777 with users, roles, navigation, screens and APIs modeled in the runner rulebook.",
     "replace", "Generated effortless-rulebook-editor (:42442, :42441) plus the root explorer (:42440).",
     "The generated editor edits any rulebook with zero bespoke code and the explorer covers discovery and guidance; the portal's overlay contradicts one-rulebook-per-project.",
     "done", "None outside the runner. Root start.sh has no dependency on it (US-052-ac1)."),
        ("cap-transpiler-bus", "ssotme-proxy transpiler bus", "ssotme-proxy/", "HTTP server on :4242 exposing 13 repo-local injectors as ssotme:// transpiler routes.", "replace", BUS_DESTINATION, "26 governed projects have enabled routes on :4242; the CLI is absorbing the bus as infrastructure (Step 12) so no project has to start a server. The runner keeps ssotme-proxy as the legacy bus.", "decided", "26 child effortless.json files; talismans-special-solutions/postgres-bootstrap/ensure-orchestrator.sh."),
        ("cap-execution-substrates", "Execution substrates (injectors)", "execution-substrates/", "Python, Go, COBOL, binary, CSV, XLSX, UML, OWL, English, explain-DAG, Airtable and postgres-calculated-to-rulebook injectors plus take-test harnesses.", "replace", BUS_DESTINATION, "Each inject-into-<technology>.py maps one-to-one onto a Step 12 script tool (EFFORTLESS_INPUT_DIR / EFFORTLESS_OUTPUT_DIR). The runner keeps the injectors and the menu that drives them.", "decided", "ssotme-proxy/server.py TRANSPILERS table; orchestration/test-orchestrator.py."),
        ("cap-formula-core", "Shared formula parser and utilities", "orchestration/shared.py, orchestration/formula_parser.py", "Rulebook loading, candidate resolution and the Excel-dialect formula parser every injector imports.", "replace", BUS_DESTINATION, "Travels with the injectors that import it. The runner keeps its copy.", "decided", "42 files under execution-substrates/; ssotme-proxy/server.py."),
        ("cap-conformance-harness", "Conformance harness and reports", "testing/, orchestration/test-orchestrator.py, orchestration/grade-and-record.py, orchestration/generate-report.py, orchestration/llm-fuzzy-grader.py", "Blank tests, answer keys, per-substrate grading, fuzzy LLM grading and the substrate-equivalence report.", "promote", "Conformance results as first-class rows in the root rulebook, displayed by the root explorer the way slot witnesses are; the runner keeps the harness and its report as the legacy view.", "Orchestration is what the explorer does visually: pick a project, build it, see every substrate graded. The harness stays runnable in the runner and its results become data the explorer shows.", "decided", "take-test.sh in every substrate; SubstrateContractPhases / EvaluationSteps rows in the runner rulebook."),
        ("cap-cli-menu", "CLI orchestration menu", "start.sh, orchestration/orchestrate.sh, run-web-portal.sh, run-in-docker.sh, docker-compose.yml, Dockerfile", "Interactive menu that picks an active domain, builds it, runs substrates and launches the portal.", "replace", "Root explorer (:42440) plus per-project ./start.sh for the platform role; the runner keeps the menu as its own experience (./start.sh here launches it).", "Every governed project owns its start and the explorer shows what the menu showed. The menu remains the legacy way to run the same pipeline.", "done", "None outside the runner."),
    ("cap-build-all", "Cross-project build tooling", "orchestration/build-all-domains.sh, orchestration/build-status-report.py, devops/buildall.sh",
     "Loops over every domain running effortless build and writes a status report.",
     "replace", "scripts/scan-project-slots.py with ProjectSlotWitnesses / ConsistencyFindings views and the generated progress report.",
     "Repository status is now derived from witnessed slots and finding rows rather than a build loop's log.",
     "done", "None."),
        ("cap-diagnostics", "Diagnostics and TSP research artifacts", "diagnostics/, research-campaigns/", "TSP workflow diagnostics, alignment notes and wall-clock studies.", "retire", "Stay in the runner as research history; no platform role.", "Research evidence, not platform behavior; nothing consumes it at runtime.", "done", "None."),
    ("cap-devops", "Devops scripts", "devops/pull.sh, devops/rebuild-on-trigger.sh, devops/last-payload.json",
     "Pull-and-rebuild hooks for the old hosted runner.",
     "retire", "Root ./start.sh owns restart; the editor container owns rebuild via /tmp/rebuild-trigger.",
     "The hosted runner no longer exists; the root's launch contract covers restart and rebuild.",
     "done", "None."),
    ("cap-docs-transpiler", "Platform docs transpiler", "transpilers/platform-rulebook-to-docs.py, docs/generate-rulebook-md.hbars, JsonHbarsTransform step",
     "Hand-written Python and Handlebars that rendered the platform rulebook to Markdown.",
     "replace", "rulebook-to-rulespeak, rulebook-to-progress-report and the root explorer, all registered in the root effortless.json.",
     "Bespoke doc generation duplicated what published transpilers now emit from the same rulebook.",
     "done", "Runner effortless.json only."),
        ("cap-gt-explorer", "Glamorous Toolkit explorer notes", "execution-substrate-gt-explorer/", "Notes and a playground for browsing the repo from Glamorous Toolkit.", "retire", "Stays in the runner as history; the root explorer is the supported browsing surface.", "An exploration aid with no runtime role; the root explorer is the supported browsing surface.", "done", "None."),
        ("cap-portal-model", "Portal model tables in the runner rulebook", "effortless-rulebook/legacy-runner-rulebook.json (AppUsers, UserRoles, AppPermissions, AppNavigation, AppScreens, AppAPIs, RoleScreenHints, ClickTargets, AdminPortalRuntime, PortalCliParity)", "Rows describing the admin portal's users, roles, navigation, screens and API surface.", "retire", "Stay in the runner rulebook with the portal they describe.", "They describe a surface the platform has replaced; keeping them would make the separated bus carry portal configuration.", "done", "admin-portal/server.js and the runner's generated Postgres."),
]

DECISIONS = {"promote", "separate", "replace", "retire"}
STATUSES = {"decided", "in-progress", "done"}


def field(name, datatype, ftype, description, *, formula=None, nullable=True, **extra):
    row = {"name": name, "datatype": datatype, "type": ftype, "nullable": nullable, "Description": description}
    if formula is not None:
        row["formula"] = formula
    row.update(extra)
    return row


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    path = Path(sys.argv[1])
    rulebook = json.loads(path.read_text(encoding="utf-8"))

    for cap in CAPABILITIES:
        if cap[4] not in DECISIONS:
            raise SystemExit(f"{cap[0]}: decision {cap[4]!r} is not one of {sorted(DECISIONS)}")
        if cap[7] not in STATUSES:
            raise SystemExit(f"{cap[0]}: status {cap[7]!r} is not one of {sorted(STATUSES)}")
        if not cap[5].strip():
            raise SystemExit(f"{cap[0]}: destination is required")

    table = {
        "Description": (
            "Succession ledger for rulebook-examples/legacy-runner/, a permanent governed example that is no longer "
            "privileged. Each row records which platform surface now owns a capability's role (promote / separate / "
            "replace) or that it has none (retire). The runner keeps its copy of every capability; nothing is deleted."
        ),
        "schema": [
            field("LegacyRunnerCapabilityId", "string", "raw", "PK.", nullable=False),
            field("Name", "string", "calculated", "Order 1. Display alias (calculated).", formula="={{Title}}"),
            field("Title", "string", "raw", "Capability name.", nullable=False),
            field("RunnerPath", "string", "raw", "Where the capability lives inside legacy-runner/."),
            field("Summary", "string", "raw", "What the capability does."),
            field("Decision", "string", "raw", "promote | separate | replace | retire.", nullable=False),
            field("Destination", "string", "raw", "Who owns the behavior after retirement, or why nothing needs to.", nullable=False),
            field("Rationale", "string", "raw", "Why this decision."),
            field("Status", "string", "raw", "decided | in-progress | done. done means the successor exists and is wired; the runner keeps its copy regardless.", nullable=False),
            field("Dependents", "string", "raw", "Known consumers that must be repointed before removal."),
            field("Project", "string", "relationship", "FK to ProjectMetadata.", nullable=False,
                  RelatedTo="ProjectMetadata", isReversed=False, prefersSingleRecordLink=True, InverseField="LegacyRunnerCapabilities"),
            field("IsDecided", "boolean", "calculated", "Order 1. A decision and a destination are both recorded.",
                  formula='=AND({{Decision}} <> "", {{Destination}} <> "")'),
            field("DecidedFlag", "number", "calculated", "Order 1. 1 when decided — rollup carrier.",
                  formula='=IF(AND({{Decision}} <> "", {{Destination}} <> ""), 1, 0)'),
            field("IsKept", "boolean", "calculated", "Order 1. The platform still needs the behavior (promote or separate).",
                  formula='=OR({{Decision}} = "promote", {{Decision}} = "separate")'),
            field("IsResolved", "boolean", "calculated", "Order 1. The decision has been carried out.",
                  formula='={{Status}} = "done"'),
            field("ResolvedFlag", "number", "calculated", "Order 1. 1 when resolved — rollup carrier.",
                  formula='=IF({{Status}} = "done", 1, 0)'),
            field("CapabilityState", "string", "calculated", "Order 2. undecided / decided / resolved.",
                  formula='=IF(NOT({{IsDecided}}), "undecided", IF({{IsResolved}}, "resolved", "decided"))'),
            field("CapabilityLabel", "string", "calculated", "Order 1. Display label with decision.",
                  formula='=CONCAT({{Title}}, " [", {{Decision}}, "]")'),
        ],
        "data": [
            {
                "LegacyRunnerCapabilityId": cid,
                "Title": title,
                "RunnerPath": runner_path,
                "Summary": summary,
                "Decision": decision,
                "Destination": destination,
                "Rationale": rationale,
                "Status": status,
                "Dependents": dependents,
                "Project": PROJECT,
            }
            for cid, title, runner_path, summary, decision, destination, rationale, status, dependents in CAPABILITIES
        ],
    }

    # Insert the table right after RulebookDomains so it sits with the other catalog tables.
    if "LegacyRunnerCapabilities" in rulebook:
        rulebook["LegacyRunnerCapabilities"] = table
    else:
        rebuilt = {}
        for key, value in rulebook.items():
            rebuilt[key] = value
            if key == "ProjectLocalServices":
                rebuilt["LegacyRunnerCapabilities"] = table
        if "LegacyRunnerCapabilities" not in rebuilt:
            raise SystemExit("ProjectLocalServices table not found; cannot place LegacyRunnerCapabilities")
        rulebook.clear()
        rulebook.update(rebuilt)

    pm = rulebook["ProjectMetadata"]
    existing = {f["name"] for f in pm["schema"]}
    additions = [
        field("LegacyRunnerCapabilities", "string", "relationship", "Reverse relationship: legacy-runner capabilities inventoried for this project.",
              RelatedTo="LegacyRunnerCapabilities", isReversed=True, InverseField="Project"),
        field("RunnerCapabilityCount", "number", "aggregation", "Order 1. Legacy-runner capabilities inventoried.",
              formula="=COUNTIFS(LegacyRunnerCapabilities!{{Project}}, ProjectMetadata!{{ProjectId}})"),
        field("DecidedCapabilityCount", "number", "aggregation", "Order 2. Capabilities with a decision and destination.",
              formula="=SUMIFS(LegacyRunnerCapabilities!{{DecidedFlag}}, LegacyRunnerCapabilities!{{Project}}, ProjectMetadata!{{ProjectId}})"),
        field("ResolvedCapabilityCount", "number", "aggregation", "Order 2. Capabilities whose successor exists and is wired.",
              formula="=SUMIFS(LegacyRunnerCapabilities!{{ResolvedFlag}}, LegacyRunnerCapabilities!{{Project}}, ProjectMetadata!{{ProjectId}})"),
        field("IsRunnerInventoryComplete", "boolean", "calculated", "Order 3. Every inventoried capability has a recorded decision and destination (US-051).",
              formula="=AND({{RunnerCapabilityCount}} > 0, {{DecidedCapabilityCount}} = {{RunnerCapabilityCount}})"),
        field("IsRunnerSuccessionComplete", "boolean", "calculated", "Order 4. Every capability's successor exists and is wired.",
              formula="=AND({{IsRunnerInventoryComplete}}, {{ResolvedCapabilityCount}} = {{RunnerCapabilityCount}})"),
    ]
    retired_fields = {"RemovalBlockingCapabilityCount", "IsRunnerRemovalUnblocked", "BlocksRemovalFlag"}
    pm["schema"] = [g for g in pm["schema"] if g["name"] not in retired_fields]
    for f in additions:
        if f["name"] in existing:
            pm["schema"] = [g for g in pm["schema"] if g["name"] != f["name"]]
        pm["schema"].append(f)

    # US-051: inventory complete with decisions; no new runner features since 2026-08-30.
    stories = {row["UserStoryId"]: row for row in rulebook["UserStories"]["data"]}
    stories["us-051"]["Status"] = "done"
    stories["us-051"]["DevProgressPercent"] = 100
    stories["us-051"]["StoryText"] = (
        "As a platform maintainer, I want every legacy-runner capability assigned a promote, separate, replace, or "
        "retire decision naming its successor, so the runner can stay an ordinary example without any platform role "
        "silently depending on it."
    )
    criteria = {row["AcceptanceCriterionId"]: row for row in rulebook["AcceptanceCriteria"]["data"]}
    for cid in ("us-051-ac1", "us-051-ac2"):
        criteria[cid]["IsMet"] = True

    # US-052: the runner is a permanent governed example, not a removal candidate.
    stories["us-052"]["StoryText"] = (
        "As a platform maintainer, I want the root experience independent of the legacy portal and two-rulebook "
        "overlay, so the promoted platform has one explicit owner while legacy-runner remains an ordinary governed example."
    )
    stories["us-052"]["Status"] = "done"
    stories["us-052"]["DevProgressPercent"] = 100
    criteria["us-052-ac2"]["Criterion"] = (
        "Every capability the platform still needs names its successor surface in LegacyRunnerCapabilities, and root documentation points there."
    )
    criteria["us-052-ac2"]["IsMet"] = True
    criteria["us-052-ac3"]["Criterion"] = (
        "legacy-runner remains a governed rulebook-examples project with a working ./start.sh; no file under it is removed."
    )
    criteria["us-052-ac3"]["IsMet"] = True

    rules = {row["ConsistencyRuleId"]: row for row in rulebook["ConsistencyRules"]["data"]}
    rules["cr-18"]["Statement"] = (
        "The promoted root platform has no runtime dependency on the legacy portal or two-rulebook overlay, and every "
        "runner capability the platform still needs names its successor surface."
    )
    rules["cr-18"]["FixPlaybook"] = (
        "Record the successor in LegacyRunnerCapabilities (root, standalone tool, generated or CLI surface) and point "
        "documentation at it. The runner keeps its copy; never delete runner files to satisfy this rule."
    )
    findings = {row["ConsistencyFindingId"]: row for row in rulebook["ConsistencyFindings"]["data"]}
    findings["cr-18-01"]["Status"] = "fixed"

    programme = {
        ("ERBPackages", "ERBPackageId", "pkg-retirement"): {"Title": "Legacy Runner Succession", "Summary": "Inventory every runner capability, name the surface that now owns its platform role, and remove root dependencies; the runner stays an ordinary example."},
        ("ERBFeatureCategories", "ERBFeatureCategoryId", "cat-legacy-retirement"): {"Title": "Legacy Runner Succession", "Summary": "Capability-by-capability succession (promote, separate, replace, or retire) with no silent dependencies and no deletion."},
        ("ERBFeatures", "ERBFeatureId", "feat-runner-retirement"): {"Title": "Root Independence from the Runner", "Summary": "The root experience has no dependency on the legacy portal or two-rulebook overlay; the runner stays an ordinary example."},
        ("ERBFeatures", "ERBFeatureId", "feat-runner-inventory"): {"Summary": "Every legacy-runner capability receives an explicit promote, separate, replace, or retire decision naming its successor."},
        ("BuildPhases", "BuildPhaseId", "phase-5"): {"Title": "Catalog, Skills & Legacy Succession", "Summary": "Complete catalog and skill reconciliation, then name the successor of every legacy-runner capability and remove all root dependencies on it."},
        ("RulebookDomains", "DomainId", "domain-legacy-runner"): {
            "Purpose": "The way the platform used to run every project: CLI menu, ssotme-proxy transpiler bus on :4242, execution substrates and conformance harness, plus the replaced admin portal. An ordinary governed example, no longer privileged; do not add platform features here.",
            "ProgressionNote": "Its platform roles pass to the root explorer, the generated editor, and the effortless CLI's local transpiler host (LegacyRunnerCapabilities); the runner itself stays as the legacy view of the same pipeline.",
        },
    }
    for (table, key, pk), values in programme.items():
        row = next(r for r in rulebook[table]["data"] if r[key] == pk)
        row.update(values)

    # The progress route now also reads the retirement ledger.
    for row in rulebook["MobileRoutes"]["data"]:
        if row["MobileRouteId"] == "route-progress" and "LegacyRunnerCapabilities" not in row["ReadsEntities"]:
            row["ReadsEntities"] += ",LegacyRunnerCapabilities"

    with path.open("w", encoding="utf-8") as handle:
        json.dump(rulebook, handle, indent=2, ensure_ascii=False)
        handle.write("\n")
    print(f"Succession ledger: {len(CAPABILITIES)} legacy-runner capabilities; US-051 and US-052 done; cr-18 reframed.")


if __name__ == "__main__":
    main()

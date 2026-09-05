#!/usr/bin/env python3
"""Reconcile the root explorer's navigation model (PLATFORM-EXPLORER-PLAN.md §3).

Replaces the stale `/m/*` mobile-shell rows in `MobileNavTabs` and `MobileRoutes`
with the root React explorer's route surface. The tables keep their names so the
existing `ProjectMetadata.ShippableTabCount` rollup, stories, and features stay
attached; their descriptions now say what they model.

`Screen` names the React component that implements the route, as
`pages/<File>.jsx:<Export>` under `app/src/`. It is blank until the component
exists, so `UnbuiltFlag` / `BuildCoveragePercent` / `TabState` remain the honest
build backlog for Phase 3. The script also reconciles the Phase 3 stories and
acceptance criteria that were verified against the running explorer on 2026-09-04
(headless route sweep at 1280px and 375px, health-probe checks, view-only reads).

Usage:
    python3 scripts/migrate-phase3-explorer-routes.py effortless-rulebook/effortless-rulebook.json
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

PROJECT = "erb-001"

TABS = [
    {
        "MobileNavTabId": "tab-home",
        "Label": "Home",
        "Icon": "Home",
        "RootPath": "/",
        "SortOrder": 1,
        "Purpose": "The platform story, the shortest getting-started path, and how the root rulebook governs the repository.",
        "Project": PROJECT,
    },
    {
        "MobileNavTabId": "tab-learn",
        "Label": "Learn",
        "Icon": "BookOpen",
        "RootPath": "/concepts",
        "SortOrder": 2,
        "Purpose": "Concepts (ERB, CMCC, SDLAF, the loop, views, rules, glossary) and the Claude skill catalog with its routes.",
        "Project": PROJECT,
    },
    {
        "MobileNavTabId": "tab-projects",
        "Label": "Projects",
        "Icon": "FolderTree",
        "RootPath": "/projects",
        "SortOrder": 3,
        "Purpose": "Every governed project, filtered as toys or fully implemented examples, with launch instructions and health-gated localhost links.",
        "Project": PROJECT,
    },
    {
        "MobileNavTabId": "tab-health",
        "Label": "Health",
        "Icon": "Activity",
        "RootPath": "/consistency",
        "SortOrder": 4,
        "Purpose": "Consistency rules, the findings work queue, and delivery progress read from the generated views.",
        "Project": PROJECT,
    },
    {
        "MobileNavTabId": "tab-tools",
        "Label": "Tools",
        "Icon": "Wrench",
        "RootPath": "/tools",
        "SortOrder": 5,
        "Purpose": "Generated editor, generated API, CLI, local transpilers, and setup diagnostics.",
        "Project": PROJECT,
    },
]

# (id, path, title, tab, parent, kind, sort, reads, description, screen)
ROUTES = [
    ("route-home", "/", "Effortless Rulebooks", "tab-home", None, "dashboard", 1,
     "ProjectMetadata,RulebookDomains,ConsistencyFindings,UserStories",
     "Platform overview: what the repository is, headline readiness and consistency counts from the views, and the shortest successful getting-started path.",
     "pages/Home.jsx:Home"),
    ("route-getting-started", "/getting-started", "Getting Started", "tab-home", "route-home", "detail", 2,
     "ProjectLaunchProfiles,ProjectLocalServices,RulebookSourceSpokes",
     "Prerequisites, CLI setup, root startup via ./start.sh, opening the generated editor, and running a first project.",
     "pages/Home.jsx:GettingStarted"),
    ("route-about-rulebook", "/about-the-rulebook", "About the Rulebook", "tab-home", "route-home", "detail", 3,
     "ProjectMetadata,OntologyAxioms,FramingInvariants,ProjectLayoutSlots,ConsistencyRules",
     "How the root rulebook governs and explains the repository: axioms, framing invariants, the canonical project shape, and the rules derived from it.",
     "pages/Home.jsx:AboutRulebook"),
    ("route-concepts", "/concepts", "Concepts", "tab-learn", None, "list", 1,
     "Glossary,OntologyAxioms,FramingInvariants,CMCCSummary",
     "ERB, CMCC, SDLAF, the loop, views, rules, and the glossary.",
     "pages/Learn.jsx:Concepts"),
    ("route-concept-detail", "/concepts/:concept", "Concept", "tab-learn", "route-concepts", "detail", 2,
     "Glossary,OntologyAxioms,FramingInvariants",
     "One concept or glossary term with its definition and related terms.",
     "pages/Learn.jsx:ConceptDetail"),
    ("route-skills", "/skills", "Skills", "tab-learn", None, "list", 3,
     "ClaudeSkills,SkillRoutes",
     "Skill catalog with load gates and the routing relationships between skills.",
     "pages/Learn.jsx:Skills"),
    ("route-skill-detail", "/skills/:skill", "Skill", "tab-learn", "route-skills", "detail", 4,
     "ClaudeSkills,SkillRoutes",
     "One skill: purpose, load gate, triggers, and the skills it routes to and from.",
     "pages/Learn.jsx:SkillDetail"),
    ("route-projects", "/projects", "Projects", "tab-projects", None, "list", 1,
     "RulebookDomains,ProjectLaunchProfiles",
     "All governed projects with derived readiness state, area, and coverage.",
     "pages/Projects.jsx:Projects"),
    ("route-toys", "/toys", "Toys", "tab-projects", None, "list", 2,
     "RulebookDomains",
     "Projects whose derived readiness state classifies them as toys.",
     "pages/Projects.jsx:Projects"),
    ("route-examples", "/examples", "Examples", "tab-projects", None, "list", 3,
     "RulebookDomains",
     "Projects whose derived readiness state classifies them as fully implemented examples.",
     "pages/Projects.jsx:Projects"),
    ("route-project-detail", "/projects/:slug", "Project", "tab-projects", "route-projects", "detail", 4,
     "RulebookDomains,ProjectLaunchProfiles,ProjectLocalServices,ProjectSlotWitnesses,ConsistencyFindings,DemoNarratives",
     "Project purpose, concepts demonstrated, rulebook and RuleSpeak links, readiness, slot witnesses, findings, exact launch instructions, and a localhost link shown only when a modeled service passes its health check.",
     "pages/Projects.jsx:ProjectDetail"),
    ("route-consistency", "/consistency", "Consistency", "tab-health", None, "dashboard", 1,
     "ConsistencyRules,ConsistencyFindings,RulebookDomains",
     "Repository and per-project consistency: rules, open finding counts, and the findings work queue.",
     "pages/Health.jsx:Consistency"),
    ("route-progress", "/progress", "Progress", "tab-health", None, "dashboard", 2,
     "BuildPhases,ERBPackages,ERBFeatures,UserStories,AcceptanceCriteria",
     "Programme, phases, packages, stories, acceptance criteria, and a link to the generated progress report.",
     "pages/Health.jsx:ProgressPage"),
    ("route-tools", "/tools", "Tools", "tab-tools", None, "dashboard", 1,
     "ProjectLocalServices,RulebookSourceSpokes,FormulaDialects",
     "Generated editor and API links, CLI and local transpiler setup, and setup diagnostics.",
     "pages/Tools.jsx:Tools"),
]


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    path = Path(sys.argv[1])
    rulebook = json.loads(path.read_text(encoding="utf-8"))

    tabs = rulebook["MobileNavTabs"]
    routes = rulebook["MobileRoutes"]

    tabs["Description"] = (
        "Primary navigation groups of the root explorer (app/). Rendered as a top navigation bar at "
        "desktop width and a bottom tab bar at phone width; each group roots a MobileRoutes subtree. "
        "The table name is historical: there is no separate /m mobile shell."
    )
    routes["Description"] = (
        "Route surface of the root explorer (PLATFORM-EXPLORER-PLAN.md §3): deep-linkable routes under "
        "each navigation group. Screen names the React component (pages/<File>.jsx:<Export> under app/src/) "
        "that implements the route and stays blank until it exists, so the derived unbuilt counts are the "
        "Phase 3 build backlog."
    )

    def field(table: dict, name: str) -> dict:
        matches = [f for f in table["schema"] if f["name"] == name]
        if len(matches) != 1:
            raise SystemExit(f"expected exactly one field {name!r}, found {len(matches)}")
        return matches[0]

    field(tabs, "Icon")["Description"] = "Icon name from the lucide icon set."
    field(tabs, "RootPath")["Description"] = "Path of the group's root route."
    field(tabs, "SortOrder")["Description"] = "Left-to-right order in the navigation bar."
    field(tabs, "Purpose")["Description"] = "What the navigation group is for."
    field(tabs, "MobileRoutes")["Description"] = "Reverse relationship: routes under this navigation group."

    field(routes, "Tab")["Description"] = "FK to MobileNavTabs — the navigation group that owns this route."
    field(routes, "ParentRoute")["Description"] = (
        "FK to MobileRoutes — the breadcrumb parent; null for a group's root and for sibling lists."
    )
    field(routes, "Screen")["Description"] = (
        "React component implementing this route, as pages/<File>.jsx:<Export> under app/src/; blank until built."
    )
    field(routes, "HasScreen")["Description"] = "Order 1. Route is implemented by a React component."
    field(routes, "UnbuiltFlag")["Description"] = (
        "Order 1. 1 when no component exists yet — rollup carrier for the Phase 3 backlog."
    )

    depth = field(routes, "Depth")
    depth["formula"] = '=IF({{Path}} = "/", 0, LEN({{Path}}) - LEN(SUBSTITUTE({{Path}}, "/", "")))'
    depth["Description"] = "Order 1. Number of path segments; the root path / is depth 0."

    is_detail = field(routes, "IsDetail")
    is_detail["formula"] = '=LEN({{Path}}) <> LEN(SUBSTITUTE({{Path}}, ":", ""))'

    consistent = field(routes, "IsDepthConsistent")
    consistent["formula"] = '=IF({{ParentRoute}} = "", {{Depth}} <= 1, {{Depth}} = {{ParentDepth}} + 1)'
    consistent["Description"] = (
        "Order 3. A route without a parent is at most one segment deep; a child is exactly one segment deeper than its parent."
    )

    tabs["data"] = TABS
    routes["data"] = [
        {
            "MobileRouteId": rid,
            "Path": route_path,
            "Title": title,
            "Tab": tab,
            "ParentRoute": parent,
            "Screen": screen,
            "RouteKind": kind,
            "SortOrder": sort,
            "ReadsEntities": reads,
            "Description": description,
        }
        for rid, route_path, title, tab, parent, kind, sort, reads, description, screen in ROUTES
    ]

    tab_ids = {t["MobileNavTabId"] for t in TABS}
    route_ids = {r["MobileRouteId"] for r in routes["data"]}
    known_tables = {k for k, v in rulebook.items() if isinstance(v, dict) and "schema" in v}
    for row in routes["data"]:
        if row["Tab"] not in tab_ids:
            raise SystemExit(f"{row['MobileRouteId']}: unknown tab {row['Tab']}")
        if row["ParentRoute"] is not None and row["ParentRoute"] not in route_ids:
            raise SystemExit(f"{row['MobileRouteId']}: unknown parent {row['ParentRoute']}")
        for table in row["ReadsEntities"].split(","):
            if table not in known_tables:
                raise SystemExit(f"{row['MobileRouteId']}: ReadsEntities names unknown table {table}")

    # Phase 3 stories and criteria verified against the running explorer (2026-09-04).
    DONE_STORIES = ["us-026", "us-028", "us-029", "us-030", "us-031", "us-032", "us-033", "us-034", "us-035", "us-048", "us-049", "us-050"]
    MET_CRITERIA = [
        "us-026-ac2",
        "us-028-ac1", "us-028-ac2", "us-029-ac1", "us-030-ac1", "us-030-ac2", "us-031-ac1",
        "us-032-ac1", "us-032-ac2", "us-033-ac1", "us-033-ac2", "us-034-ac1", "us-035-ac1",
        "us-048-ac2", "us-048-ac3", "us-049-ac1", "us-049-ac2", "us-050-ac1", "us-050-ac2",
        "us-052-ac1",
    ]
    stories = {row["UserStoryId"]: row for row in rulebook["UserStories"]["data"]}
    for story_id in DONE_STORIES:
        if story_id not in stories:
            raise SystemExit(f"UserStories has no row {story_id}")
        stories[story_id]["Status"] = "done"
        stories[story_id]["DevProgressPercent"] = 100
    criteria = {row["AcceptanceCriterionId"]: row for row in rulebook["AcceptanceCriteria"]["data"]}
    for criterion_id in MET_CRITERIA:
        if criterion_id not in criteria:
            raise SystemExit(f"AcceptanceCriteria has no row {criterion_id}")
        criteria[criterion_id]["IsMet"] = True
    # us-052 stays in progress: the explorer is independent of the legacy portal (ac1),
    # but runner capabilities are not yet re-homed (ac2) and removal has not happened (ac3).
    stories["us-052"]["Status"] = "in-progress"
    stories["us-052"]["DevProgressPercent"] = 33

    with path.open("w", encoding="utf-8") as handle:
        json.dump(rulebook, handle, indent=2, ensure_ascii=False)
        handle.write("\n")

    print(f"Reconciled {len(TABS)} navigation groups, {len(routes['data'])} explorer routes, {len(DONE_STORIES)} done stories, {len(MET_CRITERIA)} met criteria.")


if __name__ == "__main__":
    main()

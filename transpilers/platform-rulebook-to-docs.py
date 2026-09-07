#!/usr/bin/env python3
"""
platform-rulebook-to-docs.py

Mechanically projects the PLATFORM rulebook
(effortless-platform/effortless-rulebook/effortless-rulebook.json) into a set of
human-readable markdown files under docs/derived/.

This transpiler is intentionally narrow: it only knows the PLATFORM rulebook.
The platform rulebook's path is a fixed literal in this repo (see CLAUDE.md).

Run modes:

    # Default — reads the platform rulebook, writes to <repo>/docs/derived/
    python3 platform-rulebook-to-docs.py

    # Override input/output (still fails loudly if input is missing):
    python3 platform-rulebook-to-docs.py \\
        --input  /abs/path/to/effortless-rulebook.json \\
        --output /abs/path/to/docs/derived

Every file written carries a DO-NOT-EDIT header pointing back to the rulebook
table it was generated from. The headline ADP rule applies to docs themselves:
anything under docs/derived/ is mechanically rebuildable, and `effortless -clean`
will remove it.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]  # the repo root
DEFAULT_INPUT = REPO_ROOT / "effortless-rulebook" / "effortless-rulebook.json"
DEFAULT_OUTPUT = REPO_ROOT / "docs" / "derived"


def _do_not_edit_header(source_table: str | None, rulebook_rel: str) -> str:
    src = f" (table: `{source_table}`)" if source_table else ""
    return (
        f"<!-- GENERATED FILE — DO NOT EDIT. -->\n"
        f"<!-- Source: {rulebook_rel}{src} -->\n"
        f"<!-- Regenerate with: cd effortless-platform && effortless build -->\n\n"
    )


def _load_rulebook(path: Path) -> dict:
    if not path.exists():
        raise FileNotFoundError(
            f"Platform rulebook not found at expected path: {path}. "
            f"This transpiler will not search alternate locations — the platform "
            f"rulebook lives at a fixed literal path under effortless-platform/."
        )
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _table(rb: dict, name: str) -> list[dict]:
    if name not in rb:
        raise KeyError(
            f"Table '{name}' missing from platform rulebook. The transpiler will "
            f"not fall back to a default — fix the rulebook or add the table."
        )
    node = rb[name]
    if not isinstance(node, dict) or "data" not in node or not isinstance(node["data"], list):
        raise TypeError(f"Table '{name}' is not in {{schema, data:[...]}} shape.")
    return node["data"]


def _table_description(rb: dict, name: str) -> str:
    return rb[name].get("Description", "").strip()


def _write(out_root: Path, rel_path: str, body: str) -> Path:
    target = out_root / rel_path
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open("w", encoding="utf-8") as f:
        f.write(body)
    return target


def _md_table(rows: list[dict], columns: list[tuple[str, str]]) -> str:
    """columns is [(field_name, header_label), ...]."""
    if not rows:
        return "_(no rows)_\n"
    header = "| " + " | ".join(h for _, h in columns) + " |\n"
    sep = "| " + " | ".join("---" for _ in columns) + " |\n"
    body_lines = []
    for row in rows:
        cells = []
        for field, _ in columns:
            v = row.get(field, "")
            if isinstance(v, bool):
                cells.append("✓" if v else "—")
            elif v is None:
                cells.append("—")
            else:
                cells.append(str(v).replace("\n", " ").replace("|", "\\|"))
        body_lines.append("| " + " | ".join(cells) + " |")
    return header + sep + "\n".join(body_lines) + "\n"


# --------------------------------------------------------------------------
# Section generators — one per family of rulebook tables.
# Each returns a list[(relative_path, body)].
# --------------------------------------------------------------------------

def gen_index(rb: dict, rulebook_rel: str) -> list[tuple[str, str]]:
    pm = _table(rb, "ProjectMetadata")[0]
    feature_rows = _table(rb, "PlatformFeatures")
    axioms = _table(rb, "OntologyAxioms")
    invariants = _table(rb, "FramingInvariants")
    substrates = _table(rb, "ExecutionSubstrates")
    domains = _table(rb, "RulebookDomains")
    apis = _table(rb, "AppAPIs")
    nav = _table(rb, "AppNavigation")
    screens = _table(rb, "AppScreens")
    flavors = _table(rb, "RulebookFlavors")

    body = _do_not_edit_header(None, rulebook_rel)
    body += f"# {pm.get('Name', 'ERB Platform')} — Derived Docs\n\n"
    body += f"> {pm.get('Purpose', '').strip()}\n\n" if pm.get("Purpose") else ""
    body += (
        "This directory is 100% generated from the platform rulebook by "
        "`effortless-platform/transpilers/platform-rulebook-to-docs.py`. "
        "Edit the rulebook (or its source spokes), then re-run `effortless build` from "
        "inside `effortless-platform/` to regenerate.\n\n"
    )
    body += "## Index\n\n"
    body += f"- [Project Metadata](project-metadata.md) — 1 row\n"
    body += f"- [Ontology Axioms](axioms.md) — {len(axioms)} rows\n"
    body += f"- [Framing Invariants](invariants.md) — {len(invariants)} rows\n"
    body += f"- [Platform Features](features.md) — {len(feature_rows)} rows\n"
    body += f"- [Execution Substrates](substrates.md) — {len(substrates)} rows\n"
    body += f"- [Substrate Contract (Inject / Execute / Grade)](substrate-contract.md)\n"
    body += f"- [Fuzzy Grading Providers](fuzzy-grading.md)\n"
    body += f"- [Formula Dialects](formula-dialects.md)\n"
    body += f"- [Demo Narratives](demo-narratives.md)\n"
    body += f"- [Rulebook Domains](domains.md) — {len(domains)} rows\n"
    body += f"- [Rulebook Flavors](flavors.md) — {len(flavors)} rows\n"
    body += f"- [Admin Portal Navigation](navigation.md) — {len(nav)} rows\n"
    body += f"- [Admin Portal Screens](screens.md) — {len(screens)} rows\n"
    body += f"- [Admin Portal API Surface](api-surface.md) — {len(apis)} rows\n"
    body += f"- [Permissions](permissions.md)\n"
    body += f"- [Click Targets](click-map.md)\n"
    body += "\n"
    return [("README.md", body)]


def gen_project_metadata(rb: dict, rulebook_rel: str) -> list[tuple[str, str]]:
    rows = _table(rb, "ProjectMetadata")
    body = _do_not_edit_header("ProjectMetadata", rulebook_rel)
    body += "# Project Metadata\n\n"
    body += _table_description(rb, "ProjectMetadata") + "\n\n" if _table_description(rb, "ProjectMetadata") else ""
    for row in rows:
        body += f"## {row.get('Name', row.get('ProjectId', '?'))}\n\n"
        for k, v in row.items():
            if v in (None, "", []):
                continue
            body += f"- **{k}**: {v}\n"
        body += "\n"
    return [("project-metadata.md", body)]


def gen_axioms(rb: dict, rulebook_rel: str) -> list[tuple[str, str]]:
    rows = _table(rb, "OntologyAxioms")
    body = _do_not_edit_header("OntologyAxioms", rulebook_rel)
    body += "# Ontology Axioms\n\n"
    desc = _table_description(rb, "OntologyAxioms")
    if desc:
        body += desc + "\n\n"
    for row in rows:
        body += f"## {row.get('ShortName', row.get('AxiomId'))}\n\n"
        body += f"**Statement.** {row.get('Statement', '')}\n\n"
        if row.get("Why"):
            body += f"**Why.** {row['Why']}\n\n"
        if row.get("Implication"):
            body += f"**Implication.** {row['Implication']}\n\n"
        if row.get("Status"):
            body += f"_Status: {row['Status']}_\n\n"
    return [("axioms.md", body)]


def gen_invariants(rb: dict, rulebook_rel: str) -> list[tuple[str, str]]:
    rows = _table(rb, "FramingInvariants")
    body = _do_not_edit_header("FramingInvariants", rulebook_rel)
    body += "# Framing Invariants\n\n"
    desc = _table_description(rb, "FramingInvariants")
    if desc:
        body += desc + "\n\n"
    by_cat: dict[str, list[dict]] = {}
    for r in rows:
        by_cat.setdefault(r.get("Category", "uncategorized"), []).append(r)
    for cat in sorted(by_cat):
        body += f"## Category: {cat}\n\n"
        for r in by_cat[cat]:
            body += f"### {r.get('Name', r.get('InvariantId'))}\n\n"
            if r.get("WrongFraming"):
                body += f"**Wrong framing.** {r['WrongFraming']}\n\n"
            if r.get("CorrectFraming"):
                body += f"**Correct framing.** {r['CorrectFraming']}\n\n"
            if r.get("Why"):
                body += f"**Why.** {r['Why']}\n\n"
            tags = []
            if r.get("ViolatedAxiomId"):
                tags.append(f"violates `{r['ViolatedAxiomId']}`")
            if r.get("Severity"):
                tags.append(f"severity: {r['Severity']}")
            if r.get("Status"):
                tags.append(f"status: {r['Status']}")
            if tags:
                body += "_" + " · ".join(tags) + "_\n\n"
    return [("invariants.md", body)]


def gen_features(rb: dict, rulebook_rel: str) -> list[tuple[str, str]]:
    rows = _table(rb, "PlatformFeatures")
    body = _do_not_edit_header("PlatformFeatures", rulebook_rel)
    body += "# Platform Features\n\n"
    desc = _table_description(rb, "PlatformFeatures")
    if desc:
        body += desc + "\n\n"
    by_tier: dict[str, list[dict]] = {}
    for r in rows:
        by_tier.setdefault(r.get("Tier", "uncategorized"), []).append(r)
    for tier in sorted(by_tier, key=lambda t: (t != "headline", t != "additional", t)):
        body += f"## Tier: {tier}\n\n"
        tier_rows = sorted(by_tier[tier], key=lambda r: r.get("Priority", 999))
        for r in tier_rows:
            body += f"### {r.get('Name')}\n\n"
            if r.get("OneLineSummary"):
                body += f"{r['OneLineSummary']}\n\n"
            meta = []
            if r.get("ShortName"):
                meta.append(f"short: `{r['ShortName']}`")
            if r.get("ReadmeFilePath"):
                meta.append(f"hand-doc: [{r['ReadmeFilePath']}]({_relpath_to_docs_derived(r['ReadmeFilePath'])})")
            if r.get("RelatedAxiomId"):
                meta.append(f"axiom: `{r['RelatedAxiomId']}`")
            if r.get("Status"):
                meta.append(f"status: {r['Status']}")
            if meta:
                body += "_" + " · ".join(meta) + "_\n\n"
            if r.get("ReadmeStubContent"):
                body += r["ReadmeStubContent"].strip() + "\n\n"
    return [("features.md", body)]


def _relpath_to_docs_derived(p: str) -> str:
    # PlatformFeatures.ReadmeFilePath is relative to the repo root.
    # docs/derived/<file>.md needs to reach repo-root/<p>, which is "../../<p>".
    return f"../../{p.lstrip('/')}"


def gen_substrates(rb: dict, rulebook_rel: str) -> list[tuple[str, str]]:
    rows = _table(rb, "ExecutionSubstrates")
    body = _do_not_edit_header("ExecutionSubstrates", rulebook_rel)
    body += "# Execution Substrates\n\n"
    desc = _table_description(rb, "ExecutionSubstrates")
    if desc:
        body += desc + "\n\n"
    cols = [
        ("SubstrateId", "ID"),
        ("Name", "Name"),
        ("Technology", "Tech"),
        ("Maturity", "Maturity"),
        ("Determinism", "Determinism"),
        ("CanBeAnswerKey", "Answer Key?"),
        ("ExpressiveCompleteness", "Expressive"),
        ("RuntimeKind", "Runtime"),
        ("RelativePath", "Path"),
    ]
    cols = [(f, h) for f, h in cols if any(f in r for r in rows)]
    body += _md_table(rows, cols)
    return [("substrates.md", body)]


def gen_substrate_contract(rb: dict, rulebook_rel: str) -> list[tuple[str, str]]:
    rows = sorted(_table(rb, "SubstrateContractPhases"), key=lambda r: r.get("Order", 99))
    body = _do_not_edit_header("SubstrateContractPhases", rulebook_rel)
    body += "# Substrate Contract — Inject / Execute / Grade\n\n"
    desc = _table_description(rb, "SubstrateContractPhases")
    if desc:
        body += desc + "\n\n"
    for r in rows:
        body += f"## Phase {r.get('Order')}: {r.get('Name')}\n\n"
        body += f"**Input.** {r.get('Input', '')}\n\n"
        body += f"**Output.** {r.get('Output', '')}\n\n"
        if r.get("ScriptPattern"):
            body += f"**Script pattern.** `{r['ScriptPattern']}`\n\n"
        body += f"{r.get('Description', '')}\n\n"
        if r.get("WhyDomainAgnostic"):
            body += f"_Why domain-agnostic:_ {r['WhyDomainAgnostic']}\n\n"
    return [("substrate-contract.md", body)]


def gen_fuzzy_grading(rb: dict, rulebook_rel: str) -> list[tuple[str, str]]:
    rows = _table(rb, "FuzzyGradingProviders")
    body = _do_not_edit_header("FuzzyGradingProviders", rulebook_rel)
    body += "# Fuzzy Grading — LLM Providers\n\n"
    desc = _table_description(rb, "FuzzyGradingProviders")
    if desc:
        body += desc + "\n\n"
    cols = [
        ("Name", "Provider"),
        ("Model", "Model"),
        ("EnvVar", "Env Var"),
        ("Determinism", "Determinism"),
        ("TypicalAccuracy", "Typical Accuracy"),
        ("SpeedRelativeToDeterministic", "Speed (relative)"),
        ("LocalRuntime", "Local?"),
        ("Notes", "Notes"),
    ]
    body += _md_table(rows, cols)
    return [("fuzzy-grading.md", body)]


def gen_formula_dialects(rb: dict, rulebook_rel: str) -> list[tuple[str, str]]:
    rows = _table(rb, "FormulaDialects")
    body = _do_not_edit_header("FormulaDialects", rulebook_rel)
    body += "# Formula Dialects\n\n"
    desc = _table_description(rb, "FormulaDialects")
    if desc:
        body += desc + "\n\n"
    for r in rows:
        body += f"## {r.get('Name')}\n\n"
        body += f"_Status: {r.get('Status', 'unknown')}_\n\n"
        body += f"- **Origin**: {r.get('Origin', '')}\n"
        body += f"- **Field reference syntax**: `{r.get('FieldRefSyntax', '')}`\n"
        body += f"- **String concatenation**: {r.get('StringConcat', '')}\n"
        body += f"- **Case sensitive**: {'yes' if r.get('CaseSensitive') else 'no'}\n"
        if r.get("PrimarySubstrates"):
            body += f"- **Primary substrates**: {r['PrimarySubstrates']}\n"
        if r.get("ExampleFormula"):
            body += f"\n```\n{r['ExampleFormula']}\n```\n"
        if r.get("Notes"):
            body += f"\n{r['Notes']}\n"
        body += "\n"
    return [("formula-dialects.md", body)]


def gen_demo_narratives(rb: dict, rulebook_rel: str) -> list[tuple[str, str]]:
    rows = _table(rb, "DemoNarratives")
    body = _do_not_edit_header("DemoNarratives", rulebook_rel)
    body += "# Demo Narratives\n\n"
    desc = _table_description(rb, "DemoNarratives")
    if desc:
        body += desc + "\n\n"
    by_name: dict[str, list[dict]] = {}
    for r in rows:
        by_name.setdefault(r.get("NarrativeName", "(unnamed)"), []).append(r)
    for narrative_name, steps in by_name.items():
        steps.sort(key=lambda r: r.get("Order", 99))
        body += f"## {narrative_name}\n\n"
        for s in steps:
            body += f"### Step {s.get('Order')}: {s.get('StepName')}\n\n"
            if s.get("RelatedDomainId"):
                body += f"_Domain:_ `{s['RelatedDomainId']}`\n\n"
            body += f"**What happens.** {s.get('WhatHappens', '')}\n\n"
            body += f"**Key lesson.** {s.get('KeyLesson', '')}\n\n"
            if s.get("ObservedCost"):
                body += f"**Observed cost.** {s['ObservedCost']}\n\n"
    return [("demo-narratives.md", body)]


def gen_domains(rb: dict, rulebook_rel: str) -> list[tuple[str, str]]:
    rows = _table(rb, "RulebookDomains")
    body = _do_not_edit_header("RulebookDomains", rulebook_rel)
    body += "# Rulebook Domains\n\n"
    desc = _table_description(rb, "RulebookDomains")
    if desc:
        body += desc + "\n\n"
    for r in rows:
        body += f"## {r.get('DomainName')}\n\n"
        meta = []
        if r.get("ComplexityLevel"):
            meta.append(f"complexity: {r['ComplexityLevel']}")
        if r.get("TableCount") is not None:
            meta.append(f"tables: {r['TableCount']}")
        if meta:
            body += "_" + " · ".join(meta) + "_\n\n"
        if r.get("Purpose"):
            body += f"{r['Purpose']}\n\n"
        if r.get("KeyFeatures"):
            body += f"**Key features.** {r['KeyFeatures']}\n\n"
        if r.get("RulebookPath"):
            body += f"_Rulebook path:_ `{r['RulebookPath']}`\n\n"
    return [("domains.md", body)]


def gen_flavors(rb: dict, rulebook_rel: str) -> list[tuple[str, str]]:
    rows = _table(rb, "RulebookFlavors")
    body = _do_not_edit_header("RulebookFlavors", rulebook_rel)
    body += "# Rulebook Flavors\n\n"
    desc = _table_description(rb, "RulebookFlavors")
    if desc:
        body += desc + "\n\n"
    cols = [
        ("ProjectSlug", "Project"),
        ("DisplayName", "Name"),
        ("Flavor", "Flavor"),
        ("Complexity", "Complexity"),
        ("EntityCount", "Entities"),
        ("CalculatedCount", "Calcs"),
        ("AggregationCount", "Aggs"),
        ("LookupCount", "Lookups"),
        ("LearningFocus", "Focus"),
        ("GoodAnswerKeyFor", "Answer Key For"),
    ]
    cols = [(f, h) for f, h in cols if any(f in r for r in rows)]
    body += _md_table(rows, cols)
    return [("flavors.md", body)]


def gen_navigation(rb: dict, rulebook_rel: str) -> list[tuple[str, str]]:
    rows = _table(rb, "AppNavigation")
    body = _do_not_edit_header("AppNavigation", rulebook_rel)
    body += "# Admin Portal Navigation\n\n"
    desc = _table_description(rb, "AppNavigation")
    if desc:
        body += desc + "\n\n"
    by_parent: dict = {}
    for r in rows:
        by_parent.setdefault(r.get("ParentNavId") or "ROOT", []).append(r)

    def walk(parent_key: str, depth: int) -> str:
        out = ""
        children = sorted(by_parent.get(parent_key, []), key=lambda r: r.get("Order", 999))
        for c in children:
            indent = "  " * depth
            label = c.get("Label", c.get("NavId"))
            screen = f" → `{c['ScreenId']}`" if c.get("ScreenId") else ""
            min_role = f" _(min role: {c['MinRoleId']})_" if c.get("MinRoleId") else ""
            beat = f" — {c['StoryBeat']}" if c.get("StoryBeat") else ""
            out += f"{indent}- **{label}**{screen}{min_role}{beat}\n"
            out += walk(c["NavId"], depth + 1)
        return out

    body += walk("ROOT", 0) + "\n"
    return [("navigation.md", body)]


def gen_screens(rb: dict, rulebook_rel: str) -> list[tuple[str, str]]:
    rows = _table(rb, "AppScreens")
    body = _do_not_edit_header("AppScreens", rulebook_rel)
    body += "# Admin Portal Screens\n\n"
    desc = _table_description(rb, "AppScreens")
    if desc:
        body += desc + "\n\n"
    cols = [
        ("ScreenId", "ID"),
        ("Path", "Path"),
        ("Title", "Title"),
        ("MinRoleId", "Min Role"),
        ("Layout", "Layout"),
        ("ReadsEntities", "Reads"),
        ("WritesEntities", "Writes"),
        ("PrimaryAction", "Primary Action"),
    ]
    cols = [(f, h) for f, h in cols if any(f in r for r in rows)]
    body += _md_table(rows, cols)
    body += "\n## Story\n\n"
    for r in rows:
        if r.get("Story"):
            body += f"### {r.get('Title', r.get('ScreenId'))}\n\n{r['Story']}\n\n"
    return [("screens.md", body)]


def gen_apis(rb: dict, rulebook_rel: str) -> list[tuple[str, str]]:
    rows = _table(rb, "AppAPIs")
    body = _do_not_edit_header("AppAPIs", rulebook_rel)
    body += "# Admin Portal API Surface\n\n"
    desc = _table_description(rb, "AppAPIs")
    if desc:
        body += desc + "\n\n"
    cols = [
        ("Method", "Method"),
        ("Path", "Path"),
        ("Resource", "Resource"),
        ("Action", "Action"),
        ("WritesThrough", "Writes Through"),
        ("Description", "Description"),
    ]
    cols = [(f, h) for f, h in cols if any(f in r for r in rows)]
    body += _md_table(rows, cols)
    return [("api-surface.md", body)]


def gen_permissions(rb: dict, rulebook_rel: str) -> list[tuple[str, str]]:
    rows = _table(rb, "AppPermissions")
    roles = {r["RoleId"]: r for r in _table(rb, "UserRoles")}
    body = _do_not_edit_header("AppPermissions", rulebook_rel)
    body += "# Permissions\n\n"
    desc = _table_description(rb, "AppPermissions")
    if desc:
        body += desc + "\n\n"
    by_role: dict[str, list[dict]] = {}
    for r in rows:
        by_role.setdefault(r.get("RoleId", "unknown"), []).append(r)
    for role_id in sorted(by_role):
        role = roles.get(role_id, {})
        body += f"## Role: {role.get('Name', role_id)}\n\n"
        if role.get("Tagline"):
            body += f"_{role['Tagline']}_\n\n"
        cols = [
            ("Resource", "Resource"),
            ("Action", "Action"),
            ("Allow", "Allow"),
            ("RlsPredicate", "RLS Predicate"),
        ]
        body += _md_table(by_role[role_id], cols) + "\n"
    return [("permissions.md", body)]


def gen_clickmap(rb: dict, rulebook_rel: str) -> list[tuple[str, str]]:
    rows = _table(rb, "ClickTargets")
    body = _do_not_edit_header("ClickTargets", rulebook_rel)
    body += "# Click Targets\n\n"
    desc = _table_description(rb, "ClickTargets")
    if desc:
        body += desc + "\n\n"
    cols = [
        ("ClickId", "ID"),
        ("FromKind", "From Kind"),
        ("FromContext", "From Context"),
        ("ToPath", "To Path"),
        ("Filter", "Filter"),
        ("Story", "Story"),
    ]
    cols = [(f, h) for f, h in cols if any(f in r for r in rows)]
    body += _md_table(rows, cols)
    return [("click-map.md", body)]


GENERATORS = [
    gen_index,
    gen_project_metadata,
    gen_axioms,
    gen_invariants,
    gen_features,
    gen_substrates,
    gen_substrate_contract,
    gen_fuzzy_grading,
    gen_formula_dialects,
    gen_demo_narratives,
    gen_domains,
    gen_flavors,
    gen_navigation,
    gen_screens,
    gen_apis,
    gen_permissions,
    gen_clickmap,
]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--input", type=Path, default=None, help="Override input rulebook path.")
    parser.add_argument("--output", type=Path, default=None, help="Override output directory.")
    parser.add_argument("--clean", action="store_true", help="Remove all files under output dir before writing.")
    args = parser.parse_args(argv)

    # Allow env-var overrides from ssotme-proxy if this script is ever invoked
    # via the proxy, but never silently fall back to wrong paths. Both env vars
    # have to point at real, expected locations.
    env_input = sys.modules["os"].environ.get("ERB_RULEBOOK_PATH") if "os" in sys.modules else None
    if env_input is None:
        import os as _os
        env_input = _os.environ.get("ERB_RULEBOOK_PATH")
        env_output = _os.environ.get("ERB_OUTPUT_DIR")
    else:
        import os as _os
        env_output = _os.environ.get("ERB_OUTPUT_DIR")

    input_path = (args.input or (Path(env_input) if env_input else DEFAULT_INPUT)).resolve()
    output_path = (args.output or (Path(env_output) if env_output else DEFAULT_OUTPUT)).resolve()

    rb = _load_rulebook(input_path)
    try:
        rulebook_rel = str(input_path.relative_to(REPO_ROOT))
    except ValueError:
        rulebook_rel = str(input_path)

    if args.clean and output_path.exists():
        for child in output_path.rglob("*"):
            if child.is_file():
                child.unlink()
        # Leave directories — they'll be recreated.

    output_path.mkdir(parents=True, exist_ok=True)

    written: list[Path] = []
    skipped: list[str] = []
    for gen in GENERATORS:
        try:
            for rel_path, body in gen(rb, rulebook_rel):
                written.append(_write(output_path, rel_path, body))
        except KeyError as exc:
            # The catalog tables (domains, flavors, axioms...) moved to the repo-root
            # rulebook when the platform became rulebook-examples/legacy-runner/.
            # Say exactly which section was skipped rather than emitting a wrong doc.
            skipped.append(f"{gen.__name__}: {exc.args[0] if exc.args else exc}")
    for s in skipped:
        print(f"[platform-rulebook-to-docs] SKIPPED section not in this rulebook: {s}")

    print(f"[platform-rulebook-to-docs] wrote {len(written)} files to {output_path}")
    for p in written:
        try:
            print(f"  - {p.relative_to(REPO_ROOT)}")
        except ValueError:
            print(f"  - {p}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

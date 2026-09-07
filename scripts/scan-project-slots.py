#!/usr/bin/env python3
"""Install and refresh the root rulebook's project-slot witness model.

Usage:
    python3 scripts/scan-project-slots.py \
        effortless-rulebook/effortless-rulebook.json . \
        --witnessed-on 2026-08-30

The scan is strict: malformed manifests/rulebooks, ambiguous hubs, unmodeled
project directories, and modeled directories missing from disk are errors.
Findings are preserved and resolved by changing Status to "fixed".
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import subprocess
from collections import OrderedDict, defaultdict
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


SLOTS: tuple[dict[str, Any], ...] = (
    {
        "id": "slot-effortless-json",
        "title": "effortless.json",
        "kind": "manifest",
        "pattern": "effortless.json",
        "root": True,
        "example": True,
        "toy": True,
        "description": "A valid project build manifest with a ProjectTranspilers array.",
    },
    {
        "id": "slot-rulebook-dir",
        "title": "effortless-rulebook/",
        "kind": "directory",
        "pattern": "effortless-rulebook/",
        "root": True,
        "example": True,
        "toy": True,
        "description": "The folder containing the project's authoritative rulebook hub.",
    },
    {
        "id": "slot-rulebook-file",
        "title": "rulebook JSON",
        "kind": "rulebook",
        "pattern": "effortless-rulebook/{effortless-rulebook.json|<slug>-rulebook.json}",
        "root": True,
        "example": True,
        "toy": True,
        "description": "Exactly one accepted hub file directly inside effortless-rulebook/.",
    },
    {
        "id": "slot-meta-table",
        "title": "__meta__ table",
        "kind": "rulebook-table",
        "pattern": "__meta__",
        "root": True,
        "example": True,
        "toy": True,
        "description": "Typed-row project metadata inside the authoritative rulebook.",
    },
    {
        "id": "slot-readme",
        "title": "README.md",
        "kind": "file",
        "pattern": "README.md",
        "root": True,
        "example": True,
        "toy": True,
        "description": "Project purpose, layout, build instructions, and launch guidance.",
    },
    {
        "id": "slot-readme-bus",
        "title": "README local-bus section",
        "kind": "readme-final-section",
        "pattern": "## Local transpiler bus (`localhost:4242`)",
        "root": True,
        "example": True,
        "toy": True,
        "description": "The final level-two README section points to the current local transpiler bus.",
    },
    {
        "id": "slot-claude-md",
        "title": "CLAUDE.md",
        "kind": "file",
        "pattern": "CLAUDE.md",
        "root": True,
        "example": True,
        "toy": True,
        "description": "The ERB doctrine marker and project-specific operating contract.",
    },
    {
        "id": "slot-rulespeak",
        "title": "RuleSpeak transpiler",
        "kind": "transpiler",
        "pattern": "rulebooktorulespeak",
        "names": ("rulebooktorulespeak",),
        "root": True,
        "example": True,
        "toy": True,
        "description": "Plain-English RuleSpeak output is registered in the build pipeline.",
    },
    {
        "id": "slot-postgres",
        "title": "Postgres transpiler",
        "kind": "transpiler",
        "pattern": "rulebooktopostgres",
        "names": ("rulebooktopostgres",),
        "root": True,
        "example": True,
        "toy": False,
        "description": "The reference Postgres substrate and vw_* views are registered.",
    },
    {
        "id": "slot-init-db",
        "title": "init-db build step",
        "kind": "init-db",
        "pattern": "ProjectTranspilers entry executing an explicit init-db script",
        "root": True,
        "example": True,
        "toy": False,
        "description": "The build pipeline contains an explicit step that executes postgres/reset-rulebook-db.sh (formerly init-db.sh).",
    },
    {
        "id": "slot-editor",
        "title": "rulebook editor",
        "kind": "transpiler",
        "pattern": "effortlessrulebookeditor",
        "names": ("effortlessrulebookeditor",),
        "root": True,
        "example": True,
        "toy": False,
        "description": "The generated browser editor/API stack is registered.",
    },
    {
        "id": "slot-minimize",
        "title": "minimize-rulebook",
        "kind": "transpiler",
        "pattern": "minimizerulebook",
        "names": ("minimizerulebook",),
        "root": False,
        "example": False,
        "toy": False,
        "description": "Optional token-efficient derived rulebook ladder.",
    },
    {
        "id": "slot-explainer",
        "title": "explainer DAG",
        "kind": "transpiler",
        "pattern": "rulebooktoexplainerdag",
        "names": ("rulebooktoexplainerdag",),
        "root": False,
        "example": False,
        "toy": False,
        "description": "Optional generated in-app field-provenance visualization.",
    },
    {
        "id": "slot-xlsx",
        "title": "XLSX export",
        "kind": "transpiler",
        "pattern": "rulebooktoxlsx",
        "names": ("rulebooktoxlsx", "rulebooktoxlsxeffortless"),
        "root": False,
        "example": False,
        "toy": False,
        "description": "Optional spreadsheet projection of the rulebook.",
    },
    {
        "id": "slot-app",
        "title": "view-backed application",
        "kind": "one-of-directories",
        "pattern": "app/|web/|server/|webapp/|admin-app/|admin-portal/",
        "paths": ("app", "web", "server", "webapp", "admin-app", "admin-portal"),
        "root": True,
        "example": True,
        "toy": False,
        "description": "A project application whose runtime contract is generated vw_* views.",
    },
    {
        "id": "slot-start-sh",
        "title": "executable start.sh",
        "kind": "executable",
        "pattern": "start.sh",
        "root": True,
        "example": True,
        "toy": True,
        "description": "The universal fail-loud run/restart entry point.",
    },
    {
        "id": "slot-start-sh-syntax",
        "title": "start.sh syntax",
        "kind": "start-script-syntax",
        "pattern": "bash -n start.sh",
        "root": True,
        "example": True,
        "toy": True,
        "description": "The universal launcher parses successfully as Bash.",
    },
    {
        "id": "slot-start-sh-restart",
        "title": "start.sh restart contract",
        "kind": "start-script-restart",
        "pattern": "declared-port cleanup before launch",
        "root": True,
        "example": True,
        "toy": True,
        "description": "Launchers with local services own clean restart behavior for their declared ports.",
    },
    {
        "id": "slot-start-sh-urls",
        "title": "start.sh URL declarations",
        "kind": "start-script-urls",
        "pattern": "PROJECT_NAME, EXPERIENCE_DESCRIPTION, START_COMMAND, PRIMARY_URL, HEALTH_URL",
        "root": True,
        "example": True,
        "toy": True,
        "description": "The launcher identifies its project and prints every modeled localhost URL.",
    },
    {
        "id": "slot-start-sh-health",
        "title": "start.sh health contract",
        "kind": "start-script-health",
        "pattern": "modeled primary service and explicit health URL",
        "root": True,
        "example": True,
        "toy": True,
        "description": "Every URL-bearing experience has one modeled primary service and explicit health endpoint.",
    },
    {
        "id": "slot-tests",
        "title": "tests",
        "kind": "one-of-directories",
        "pattern": "testing/|tests/|test-data/",
        "paths": ("testing", "tests", "test-data"),
        "root": False,
        "example": False,
        "toy": False,
        "description": "Optional conformance, integration, or scenario evidence.",
    },
    {
        "id": "slot-docs",
        "title": "docs/",
        "kind": "directory",
        "pattern": "docs/",
        "root": False,
        "example": False,
        "toy": False,
        "description": "Optional long-form documentation beyond README.md and RuleSpeak.",
    },
)


class ScanError(RuntimeError):
    """A repository/model mismatch that must not be hidden."""


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ScanError(message)


def read_json(path: Path) -> OrderedDict[str, Any]:
    require(path.is_file(), f"Expected JSON file does not exist: {path}")
    with path.open(encoding="utf-8") as handle:
        value = json.load(handle, object_pairs_hook=OrderedDict)
    require(isinstance(value, dict), f"Expected a JSON object: {path}")
    return value


def write_json(path: Path, value: OrderedDict[str, Any]) -> None:
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def field(
    name: str,
    datatype: str,
    field_type: str,
    nullable: bool,
    description: str,
    *,
    formula: str | None = None,
    related_to: str | None = None,
    inverse_field: str | None = None,
    is_reversed: bool = False,
    lookup_field: str | None = None,
    via_field: str | None = None,
) -> OrderedDict[str, Any]:
    result: OrderedDict[str, Any] = OrderedDict(
        (
            ("name", name),
            ("datatype", datatype),
            ("type", field_type),
            ("nullable", nullable),
            ("Description", description),
        )
    )
    if related_to is not None:
        result["RelatedTo"] = related_to
        result["isReversed"] = is_reversed
        if not is_reversed:
            result["prefersSingleRecordLink"] = True
        if inverse_field is not None:
            result["InverseField"] = inverse_field
    if lookup_field is not None:
        result["LookupField"] = lookup_field
    if via_field is not None:
        result["ViaField"] = via_field
    if formula is not None:
        result["formula"] = formula
    return result


def calc(name: str, datatype: str, formula: str, order: int, description: str) -> OrderedDict[str, Any]:
    return field(
        name,
        datatype,
        "calculated",
        True,
        f"Order {order}. {description}",
        formula=formula,
    )


def aggregation(
    name: str,
    formula: str,
    order: int,
    description: str,
) -> OrderedDict[str, Any]:
    return field(
        name,
        "number",
        "aggregation",
        True,
        f"Order {order}. {description}",
        formula=formula,
    )


def lookup(
    table: str,
    name: str,
    via_field: str,
    target: str,
    target_id: str,
    target_field: str,
    datatype: str,
    order: int,
    description: str,
) -> OrderedDict[str, Any]:
    return field(
        name,
        datatype,
        "lookup",
        True,
        f"Order {order}. {description}",
        formula=(
            f"=INDEX({target}!{{{{{target_field}}}}}, "
            f"MATCH({table}!{{{{{via_field}}}}}, {target}!{{{{{target_id}}}}}, 0))"
        ),
        related_to=target,
        lookup_field=target_field,
        via_field=via_field,
    )


def schema_field(table: dict[str, Any], name: str) -> dict[str, Any] | None:
    for existing in table["schema"]:
        if existing["name"] == name:
            return existing
    return None


def ensure_field(table_name: str, table: dict[str, Any], expected: OrderedDict[str, Any]) -> None:
    existing = schema_field(table, expected["name"])
    if existing is None:
        table["schema"].append(expected)
        return
    require(
        existing == expected,
        f"{table_name}.{expected['name']} already exists with a different definition",
    )


def insert_table_before(
    rulebook: OrderedDict[str, Any],
    name: str,
    table: OrderedDict[str, Any],
    before: str,
) -> None:
    require(name not in rulebook, f"Table already exists unexpectedly: {name}")
    require(before in rulebook, f"Cannot place {name}; anchor table is missing: {before}")
    items = list(rulebook.items())
    index = next(i for i, (key, _) in enumerate(items) if key == before)
    items.insert(index, (name, table))
    rulebook.clear()
    rulebook.update(items)


def ensure_root_domain(rulebook: OrderedDict[str, Any], repo_root: Path) -> dict[str, Any]:
    rows = rulebook["RulebookDomains"]["data"]
    matches = [row for row in rows if row["DomainId"] == "domain-root"]
    require(len(matches) <= 1, "RulebookDomains contains duplicate domain-root rows")
    if matches:
        root_row = matches[0]
    else:
        project_id = rulebook["ProjectMetadata"]["data"][0]["ProjectId"]
        root_row = OrderedDict(
            (
                ("DomainId", "domain-root"),
                ("Area", "root"),
                ("IsIntentionalException", False),
                ("Name", repo_root.name),
                ("DomainName", repo_root.name),
                ("RelativePath", "./"),
                ("RulebookPath", "./effortless-rulebook/effortless-rulebook.json"),
                ("ComplexityLevel", "platform"),
                ("TableCount", 0),
                (
                    "KeyFeatures",
                    "governing rulebook, generated editor, repository consistency, root explorer programme",
                ),
                (
                    "Purpose",
                    "The repository's governing Effortless project and promoted platform experience.",
                ),
                ("ParentDomainId", None),
                (
                    "ProgressionNote",
                    "Root project: governs and explains every toy, example, skill, rule, finding, and delivery story.",
                ),
                ("Project", project_id),
            )
        )
        rows.insert(0, root_row)
    require(root_row["Area"] == "root", "domain-root must have Area = root")
    require(root_row["RelativePath"] == "./", "domain-root must have RelativePath = ./")
    return root_row


def ensure_slot_model(rulebook: OrderedDict[str, Any], repo_root: Path) -> None:
    root_row = ensure_root_domain(rulebook, repo_root)
    project_id = rulebook["ProjectMetadata"]["data"][0]["ProjectId"]

    slot_schema = [
        field("ProjectLayoutSlotId", "string", "raw", False, "PK."),
        calc("Name", "string", "={{Title}}", 1, "Human display alias."),
        field("Title", "string", "raw", False, "Human label of the slot."),
        field(
            "Kind",
            "string",
            "raw",
            False,
            "file | directory | executable | manifest | rulebook | rulebook-table | readme-final-section | transpiler | init-db | one-of-directories | start-script-syntax | start-script-restart | start-script-urls | start-script-health.",
        ),
        field("Pattern", "string", "raw", False, "The exact path or manifest condition checked."),
        field(
            "RequiredForRoot",
            "boolean",
            "raw",
            False,
            "The repository root must fill this slot.",
        ),
        field(
            "RequiredForExample",
            "boolean",
            "raw",
            False,
            "A fully implemented example must fill this slot.",
        ),
        field(
            "RequiredForToy",
            "boolean",
            "raw",
            False,
            "Every governed toy must fill this universal slot.",
        ),
        field("Description", "string", "raw", False, "Why the slot exists."),
        field(
            "Project",
            "string",
            "relationship",
            False,
            "FK to the root ProjectMetadata row.",
            related_to="ProjectMetadata",
            inverse_field="ProjectLayoutSlots",
        ),
        field(
            "Witnesses",
            "string",
            "relationship",
            True,
            "Reverse relationship: project scans of this slot.",
            related_to="ProjectSlotWitnesses",
            inverse_field="Slot",
            is_reversed=True,
        ),
        aggregation(
            "WitnessCount",
            "=COUNTIFS(ProjectSlotWitnesses!{{Slot}}, ProjectLayoutSlots!{{ProjectLayoutSlotId}})",
            1,
            "Projects scanned for this slot.",
        ),
        aggregation(
            "PresentCount",
            "=SUMIFS(ProjectSlotWitnesses!{{PresentFlag}}, ProjectSlotWitnesses!{{Slot}}, ProjectLayoutSlots!{{ProjectLayoutSlotId}})",
            2,
            "Projects that currently fill this slot.",
        ),
        aggregation(
            "ImplementationGapCount",
            "=SUMIFS(ProjectSlotWitnesses!{{ImplementationGapFlag}}, ProjectSlotWitnesses!{{Slot}}, ProjectLayoutSlots!{{ProjectLayoutSlotId}})",
            3,
            "Projects missing this slot when required for full implementation.",
        ),
        calc(
            "CoveragePercent",
            "number",
            "=IF({{WitnessCount}} = 0, 0, ROUND(100 * {{PresentCount}} / {{WitnessCount}}, 0))",
            3,
            "Percent of scanned projects that fill this slot.",
        ),
        calc(
            "IsUniversallyFilled",
            "boolean",
            "={{CoveragePercent}} = 100",
            4,
            "Every scanned project fills this slot.",
        ),
        calc(
            "SlotHealth",
            "string",
            '=IF({{ImplementationGapCount}} = 0, "clean", IF({{ImplementationGapCount}} <= 3, "few-gaps", "widespread"))',
            4,
            "clean | few-gaps | widespread.",
        ),
        calc(
            "SlotLabel",
            "string",
            '=CONCAT({{Title}}, " [", {{SlotHealth}}, "]")',
            5,
            "Display label with current health.",
        ),
    ]

    witness_schema = [
        field("ProjectSlotWitnessId", "string", "raw", False, "PK: <domain>:<slot>."),
        calc("Name", "string", "={{ProjectSlotWitnessId}}", 1, "Display alias."),
        field(
            "Domain",
            "string",
            "relationship",
            False,
            "FK to the governed project row.",
            related_to="RulebookDomains",
            inverse_field="SlotWitnesses",
        ),
        field(
            "Slot",
            "string",
            "relationship",
            False,
            "FK to the canonical layout slot.",
            related_to="ProjectLayoutSlots",
            inverse_field="Witnesses",
        ),
        field("IsPresent", "boolean", "raw", False, "The strict scan currently passes this slot."),
        field("WitnessedPath", "string", "raw", True, "The matched repository-relative path or transpiler Name."),
        field("WitnessedDetail", "string", "raw", False, "Exact observed success or failure."),
        field("WitnessedOn", "string", "raw", False, "ISO date of the scan."),
        calc("PresentFlag", "number", "=IF({{IsPresent}}, 1, 0)", 1, "1 when present."),
        lookup(
            "ProjectSlotWitnesses",
            "SlotRequiredForRoot",
            "Slot",
            "ProjectLayoutSlots",
            "ProjectLayoutSlotId",
            "RequiredForRoot",
            "boolean",
            1,
            "Whether the slot is required of the repository root.",
        ),
        lookup(
            "ProjectSlotWitnesses",
            "SlotRequiredForExample",
            "Slot",
            "ProjectLayoutSlots",
            "ProjectLayoutSlotId",
            "RequiredForExample",
            "boolean",
            1,
            "Whether the slot is required for full example implementation.",
        ),
        lookup(
            "ProjectSlotWitnesses",
            "SlotRequiredForToy",
            "Slot",
            "ProjectLayoutSlots",
            "ProjectLayoutSlotId",
            "RequiredForToy",
            "boolean",
            1,
            "Whether the slot is universal for toys.",
        ),
        lookup(
            "ProjectSlotWitnesses",
            "DomainArea",
            "Domain",
            "RulebookDomains",
            "DomainId",
            "Area",
            "string",
            1,
            "Physical project area.",
        ),
        lookup(
            "ProjectSlotWitnesses",
            "DomainKind",
            "Domain",
            "RulebookDomains",
            "DomainId",
            "Kind",
            "string",
            1,
            "The declared Kind (root | toy | example) of the witnessed project.",
        ),
        lookup(
            "ProjectSlotWitnesses",
            "DomainIsException",
            "Domain",
            "RulebookDomains",
            "DomainId",
            "IsIntentionalException",
            "boolean",
            1,
            "Whether the row is a doctrine-sanctioned non-project container.",
        ),
        calc(
            "IsRequiredHere",
            "boolean",
            '=AND(NOT(COALESCE({{DomainIsException}}, FALSE())), OR(AND({{DomainKind}} = "root", COALESCE({{SlotRequiredForRoot}}, FALSE())), AND({{DomainKind}} = "example", COALESCE({{SlotRequiredForExample}}, FALSE())), AND({{DomainKind}} = "toy", COALESCE({{SlotRequiredForToy}}, FALSE()))))',
            2,
            "The slot is required for this row's declared Kind.",
        ),
        calc(
            "ImplementationGapFlag",
            "number",
            '=IF(AND(NOT({{IsPresent}}), NOT(COALESCE({{DomainIsException}}, FALSE())), OR(AND({{DomainKind}} = "root", COALESCE({{SlotRequiredForRoot}}, FALSE())), AND({{DomainKind}} <> "root", COALESCE({{SlotRequiredForExample}}, FALSE())))), 1, 0)',
            2,
            "1 when this absence prevents full implementation.",
        ),
        calc(
            "UniversalGapFlag",
            "number",
            "=IF(AND(NOT({{IsPresent}}), NOT(COALESCE({{DomainIsException}}, FALSE())), COALESCE({{SlotRequiredForToy}}, FALSE())), 1, 0)",
            2,
            "1 when a universal slot is absent.",
        ),
        calc(
            "IsGap",
            "boolean",
            "=AND(NOT({{IsPresent}}), {{IsRequiredHere}})",
            3,
            "Required here and absent.",
        ),
        calc(
            "GapFlag",
            "number",
            "=IF(AND(NOT({{IsPresent}}), {{IsRequiredHere}}), 1, 0)",
            3,
            "1 when this required-here slot is absent.",
        ),
        calc(
            "RequiredHereFlag",
            "number",
            "=IF({{IsRequiredHere}}, 1, 0)",
            3,
            "1 when this slot is required here.",
        ),
        calc(
            "RequiredPresentFlag",
            "number",
            "=IF(AND({{IsPresent}}, {{IsRequiredHere}}), 1, 0)",
            3,
            "1 when a required-here slot is present.",
        ),
        calc(
            "WitnessState",
            "string",
            '=IF({{IsGap}}, "gap", IF({{IsPresent}}, "filled", "optional-empty"))',
            4,
            "gap | filled | optional-empty.",
        ),
        calc(
            "IsBlockingGap",
            "boolean",
            '={{WitnessState}} = "gap"',
            5,
            "A current required-here conformance blocker.",
        ),
    ]

    if "ProjectLayoutSlots" not in rulebook:
        insert_table_before(
            rulebook,
            "ProjectLayoutSlots",
            OrderedDict(
                (
                    (
                        "Description",
                        "The canonical root/example/toy project shape as first-class, scan-witnessed data.",
                    ),
                    ("schema", slot_schema),
                    ("data", []),
                )
            ),
            "CMCCSummary",
        )
    else:
        require(
            rulebook["ProjectLayoutSlots"]["schema"] == slot_schema,
            "ProjectLayoutSlots exists with a schema not owned by this scanner",
        )

    if "ProjectSlotWitnesses" not in rulebook:
        insert_table_before(
            rulebook,
            "ProjectSlotWitnesses",
            OrderedDict(
                (
                    (
                        "Description",
                        "Strict filesystem/manifest witnesses for every governed project x canonical slot. Refresh with scripts/scan-project-slots.py.",
                    ),
                    ("schema", witness_schema),
                    ("data", []),
                )
            ),
            "CMCCSummary",
        )
    else:
        require(
            rulebook["ProjectSlotWitnesses"]["schema"] == witness_schema,
            "ProjectSlotWitnesses exists with a schema not owned by this scanner",
        )

    domains = rulebook["RulebookDomains"]
    ensure_field(
        "RulebookDomains",
        domains,
        field(
            "SlotWitnesses",
            "string",
            "relationship",
            True,
            "Reverse relationship: canonical slot witnesses for this project.",
            related_to="ProjectSlotWitnesses",
            inverse_field="Domain",
            is_reversed=True,
        ),
    )
    domain_fields = (
        aggregation(
            "SlotWitnessCount",
            "=COUNTIFS(ProjectSlotWitnesses!{{Domain}}, RulebookDomains!{{DomainId}})",
            1,
            "Canonical slots scanned for this project.",
        ),
        aggregation(
            "PresentSlotCount",
            "=SUMIFS(ProjectSlotWitnesses!{{PresentFlag}}, ProjectSlotWitnesses!{{Domain}}, RulebookDomains!{{DomainId}})",
            2,
            "Canonical slots this project currently fills.",
        ),
        aggregation(
            "ImplementationGapCount",
            "=SUMIFS(ProjectSlotWitnesses!{{ImplementationGapFlag}}, ProjectSlotWitnesses!{{Domain}}, RulebookDomains!{{DomainId}})",
            3,
            "Slots absent from a fully implemented root/example contract.",
        ),
        aggregation(
            "UniversalGapCount",
            "=SUMIFS(ProjectSlotWitnesses!{{UniversalGapFlag}}, ProjectSlotWitnesses!{{Domain}}, RulebookDomains!{{DomainId}})",
            3,
            "Universal project slots currently absent.",
        ),
        calc(
            "SlotCoveragePercent",
            "number",
            "=IF({{SlotWitnessCount}} = 0, 0, ROUND(100 * {{PresentSlotCount}} / {{SlotWitnessCount}}, 0))",
            3,
            "Percent of all canonical slots currently filled.",
        ),
        aggregation(
            "RequiredSlotCount",
            "=SUMIFS(ProjectSlotWitnesses!{{RequiredHereFlag}}, ProjectSlotWitnesses!{{Domain}}, RulebookDomains!{{DomainId}})",
            4,
            "Slots required for this project's physical area.",
        ),
        aggregation(
            "RequiredPresentCount",
            "=SUMIFS(ProjectSlotWitnesses!{{RequiredPresentFlag}}, ProjectSlotWitnesses!{{Domain}}, RulebookDomains!{{DomainId}})",
            4,
            "Required-here slots currently present.",
        ),
        aggregation(
            "RequiredGapCount",
            "=SUMIFS(ProjectSlotWitnesses!{{GapFlag}}, ProjectSlotWitnesses!{{Domain}}, RulebookDomains!{{DomainId}})",
            4,
            "Required-here slots currently absent.",
        ),
        calc(
            "IsFullyImplemented",
            "boolean",
            "=AND({{ImplementationGapCount}} = 0, NOT({{IsIntentionalException}}))",
            4,
            "The root/example-complete contract is fully witnessed.",
        ),
        calc(
            "IsToy",
            "boolean",
            '={{Kind}} = "toy"',
            1,
            "Declared as a toy (Kind = toy).",
        ),
        calc(
            "FullyImplementedFlag",
            "number",
            "=IF(AND({{ImplementationGapCount}} = 0, NOT({{IsIntentionalException}})), 1, 0)",
            4,
            "1 when fully implemented.",
        ),
        calc(
            "RequiredSlotCoveragePercent",
            "number",
            "=IF({{RequiredSlotCount}} = 0, 100, ROUND(100 * {{RequiredPresentCount}} / {{RequiredSlotCount}}, 0))",
            5,
            "Percent of slots required for this physical area that are present.",
        ),
        calc(
            "ExpectedArea",
            "string",
            '=IF({{Kind}} = "root", "root", IF({{IsToy}}, "toy-rulebooks", "rulebook-examples"))',
            2,
            "Folder implied by the declared Kind.",
        ),
        calc(
            "IsMisfiled",
            "boolean",
            '=AND(NOT({{IsIntentionalException}}), {{Area}} <> {{ExpectedArea}})',
            3,
            "The physical folder disagrees with the declared Kind.",
        ),
        calc(
            "ReadinessState",
            "string",
            '=IF({{IsIntentionalException}}, "intentional-exception", IF({{Kind}} = "root", IF({{IsFullyImplemented}}, "root-ready", "root-incomplete"), IF({{IsToy}}, "toy", IF({{IsFullyImplemented}}, "example-ready", "example-incomplete"))))',
            5,
            "intentional-exception | root-ready | root-incomplete | toy | example-ready | example-incomplete. Toy/example is declared (Kind); ready/incomplete is witnessed.",
        ),
    )
    for domain_field in domain_fields:
        ensure_field("RulebookDomains", domains, domain_field)

    area = schema_field(domains, "Area")
    require(area is not None, "RulebookDomains.Area is missing")
    require(schema_field(domains, "Kind") is not None, "RulebookDomains.Kind is missing (run scripts/migrate-phase5-declared-kind.py)")
    for row in domains["data"]:
        require(row.get("Kind") in {"root", "toy", "example"}, f"{row['DomainId']}: Kind must be root, toy or example, got {row.get('Kind')!r}")
    area["Description"] = (
        "Witnessed physical container: root, rulebook-examples, or toy-rulebooks. "
        "Classification is derived separately."
    )

    needs_flavor = schema_field(domains, "NeedsFlavorCard")
    needs_flavor_flag = schema_field(domains, "NeedsFlavorFlag")
    require(needs_flavor is not None, "RulebookDomains.NeedsFlavorCard is missing")
    require(needs_flavor_flag is not None, "RulebookDomains.NeedsFlavorFlag is missing")
    needs_flavor["formula"] = (
        '=AND({{Area}} <> "root", NOT({{IsIntentionalException}}), NOT({{HasFlavorCard}}))'
    )
    needs_flavor_flag["formula"] = (
        '=IF(AND({{Area}} <> "root", NOT({{IsIntentionalException}}), '
        "NOT({{HasFlavorCard}})), 1, 0)"
    )

    metadata = rulebook["ProjectMetadata"]
    ensure_field(
        "ProjectMetadata",
        metadata,
        field(
            "ProjectLayoutSlots",
            "string",
            "relationship",
            True,
            "Reverse relationship: canonical project-shape slots.",
            related_to="ProjectLayoutSlots",
            inverse_field="Project",
            is_reversed=True,
        ),
    )
    ensure_field(
        "ProjectMetadata",
        metadata,
        aggregation(
            "LayoutSlotCount",
            "=COUNTIFS(ProjectLayoutSlots!{{Project}}, ProjectMetadata!{{ProjectId}})",
            1,
            "Slots in the canonical project shape.",
        ),
    )
    ensure_field(
        "ProjectMetadata",
        metadata,
        aggregation(
            "FullyImplementedCount",
            "=SUMIFS(RulebookDomains!{{FullyImplementedFlag}}, RulebookDomains!{{Project}}, ProjectMetadata!{{ProjectId}})",
            5,
            "Governed projects that fill the full implementation contract.",
        ),
    )

    rules = rulebook["ConsistencyRules"]["data"]
    cr19 = [row for row in rules if row["ConsistencyRuleId"] == "cr-19"]
    require(len(cr19) <= 1, "ConsistencyRules contains duplicate cr-19 rows")
    if not cr19:
        rules.append(
            OrderedDict(
                (
                    ("ConsistencyRuleId", "cr-19"),
                    ("RuleCode", "canonical-project-shape"),
                    ("Severity", "major"),
                    ("Scope", "repo"),
                    (
                        "Statement",
                        "Every governed root, toy, and example fills the canonical slots required for its project kind, as witnessed from disk and effortless.json.",
                    ),
                    (
                        "CheckMechanism",
                        "scripts/scan-project-slots.py refreshes ProjectSlotWitnesses; vw_rulebook_domains.required_gap_count must be zero.",
                    ),
                    (
                        "FixPlaybook",
                        "Satisfy the missing explicit slot or correct the governing model; never substitute a legacy path or inferred success.",
                    ),
                    (
                        "SourceDoctrine",
                        "PLATFORM-EXPLORER-PLAN.md § Canonical consistency contract",
                    ),
                    ("Project", project_id),
                )
            )
        )

    root_row["TableCount"] = sum(
        1
        for key, value in rulebook.items()
        if key not in {"$schema", "Name", "Description", "_meta"}
        and isinstance(value, dict)
        and "schema" in value
        and "data" in value
    )


def modeled_project_directories(
    rulebook: OrderedDict[str, Any],
    repo_root: Path,
) -> list[tuple[dict[str, Any], Path, str]]:
    discovered: set[str] = {"domain-root"}
    for area in ("rulebook-examples", "toy-rulebooks"):
        area_path = repo_root / area
        require(area_path.is_dir(), f"Expected project area does not exist: {area_path}")
        discovered.update(
            f"domain-{path.name}"
            for path in area_path.iterdir()
            if path.is_dir() and not path.name.startswith(".")
        )

    rows = rulebook["RulebookDomains"]["data"]
    modeled = {row["DomainId"] for row in rows}
    require(
        discovered == modeled,
        "RulebookDomains/filesystem mismatch: "
        f"unmodeled={sorted(discovered - modeled)} missing={sorted(modeled - discovered)}",
    )

    result: list[tuple[dict[str, Any], Path, str]] = []
    for row in rows:
        if row["DomainId"] == "domain-root":
            project_dir = repo_root
            slug = repo_root.name
        else:
            project_dir = repo_root / row["RelativePath"]
            slug = project_dir.name
        require(project_dir.is_dir(), f"Modeled project directory is missing: {project_dir}")
        result.append((row, project_dir, slug))
    return result


def inspect_project(
    project_dir: Path,
    slug: str,
    scan_errors: list[str],
) -> dict[str, Any]:
    manifest_path = project_dir / "effortless.json"
    manifest: OrderedDict[str, Any] | None = None
    transpilers: list[dict[str, Any]] = []
    manifest_error: str | None = None
    if manifest_path.is_file():
        try:
            manifest = read_json(manifest_path)
        except (json.JSONDecodeError, OSError, ScanError) as error:
            manifest_error = f"invalid manifest {manifest_path}: {error}"
        if manifest is not None:
            if not isinstance(manifest.get("ProjectTranspilers"), list):
                manifest_error = (
                    f"manifest lacks a ProjectTranspilers array: {manifest_path}"
                )
            else:
                transpilers = manifest["ProjectTranspilers"]
                for index, transpiler in enumerate(transpilers):
                    if not isinstance(transpiler, dict):
                        manifest_error = (
                            f"ProjectTranspilers[{index}] is not an object: {manifest_path}"
                        )
                        break
                    if not (
                        isinstance(transpiler.get("Name"), str)
                        and transpiler["Name"]
                    ):
                        manifest_error = (
                            f"ProjectTranspilers[{index}] lacks Name: {manifest_path}"
                        )
                        break
                    if not isinstance(transpiler.get("CommandLine"), str):
                        manifest_error = (
                            f"ProjectTranspilers[{index}] lacks CommandLine: {manifest_path}"
                        )
                        break
        if manifest_error is not None:
            scan_errors.append(manifest_error)
            transpilers = []

    rulebook_dir = project_dir / "effortless-rulebook"
    hub_paths: list[Path] = []
    if rulebook_dir.is_dir():
        for candidate in (
            rulebook_dir / "effortless-rulebook.json",
            rulebook_dir / f"{slug}-rulebook.json",
        ):
            if candidate.is_file() and candidate not in hub_paths:
                hub_paths.append(candidate)
    referenced_hubs = [
        candidate
        for candidate in hub_paths
        if any(candidate.name in transpiler["CommandLine"] for transpiler in transpilers)
    ]
    physical_hubs = {candidate.resolve() for candidate in hub_paths}
    hub_error: str | None = None
    if len(referenced_hubs) == 1:
        hub_path = referenced_hubs[0]
    elif len(physical_hubs) <= 1:
        hub_path = hub_paths[0] if hub_paths else None
    else:
        hub_error = (
            f"Ambiguous authoritative rulebooks in {rulebook_dir}: "
            + ", ".join(str(path.name) for path in hub_paths)
        )
        scan_errors.append(hub_error)
        hub_path = None
    hub: OrderedDict[str, Any] | None = None
    if hub_path is not None:
        try:
            hub = read_json(hub_path)
        except (json.JSONDecodeError, OSError, ScanError) as error:
            hub_error = f"invalid rulebook {hub_path}: {error}"
            scan_errors.append(hub_error)

    return {
        "manifest_path": manifest_path,
        "manifest": manifest,
        "manifest_error": manifest_error,
        "transpilers": transpilers,
        "rulebook_dir": rulebook_dir,
        "hub_path": hub_path,
        "hub": hub,
        "hub_error": hub_error,
    }


def relative(repo_root: Path, path: Path) -> str:
    value = path.relative_to(repo_root).as_posix()
    return value or "."


def local_http_url(value: Any) -> bool:
    if not isinstance(value, str) or not value:
        return False
    parsed = urlparse(value)
    return (
        parsed.scheme in {"http", "https"}
        and parsed.hostname in {"localhost", "127.0.0.1"}
        and parsed.port is not None
    )


def observe_slot(
    slot: dict[str, Any],
    project_dir: Path,
    observation: dict[str, Any],
    repo_root: Path,
) -> tuple[bool, str | None, str]:
    kind = slot["kind"]
    pattern = slot["pattern"]

    if kind == "manifest":
        present = (
            observation["manifest"] is not None
            and observation["manifest_error"] is None
        )
        path = observation["manifest_path"]
        return (
            present,
            relative(repo_root, path) if path.is_file() else None,
            "valid manifest with ProjectTranspilers"
            if present
            else (
                observation["manifest_error"]
                if observation["manifest_error"] is not None
                else f"missing {pattern}"
            ),
        )

    if kind == "directory":
        path = project_dir / pattern.rstrip("/")
        present = path.is_dir()
        return (
            present,
            relative(repo_root, path) if present else None,
            f"found {pattern}" if present else f"missing directory {pattern}",
        )

    if kind == "file":
        path = project_dir / pattern
        present = path.is_file()
        return (
            present,
            relative(repo_root, path) if present else None,
            f"found {pattern}" if present else f"missing file {pattern}",
        )

    if kind == "executable":
        path = project_dir / pattern
        if not path.is_file():
            return False, None, f"missing file {pattern}"
        if not os.access(path, os.X_OK):
            return False, relative(repo_root, path), f"{pattern} exists but is not executable"
        return True, relative(repo_root, path), f"{pattern} exists and is executable"

    if kind == "start-script-syntax":
        path = project_dir / "start.sh"
        if not path.is_file():
            return False, None, "cannot syntax-check missing start.sh"
        result = subprocess.run(
            ["bash", "-n", str(path)],
            check=False,
            capture_output=True,
            text=True,
            timeout=10,
        )
        detail = (result.stderr or result.stdout).strip()
        return (
            result.returncode == 0,
            relative(repo_root, path),
            "bash -n passes"
            if result.returncode == 0
            else f"bash -n failed: {detail or f'exit {result.returncode}'}",
        )

    if kind == "start-script-restart":
        path = project_dir / "start.sh"
        if not path.is_file():
            return False, None, "cannot inspect restart behavior; start.sh is missing"
        profile = observation["launch_profile"]
        if not profile["RequiresLocalUrl"]:
            return (
                True,
                relative(repo_root, path),
                "declared experience has no local service process to restart",
            )
        text = path.read_text(encoding="utf-8")
        present = "lsof" in text and "kill" in text
        return (
            present,
            relative(repo_root, path),
            "launcher performs declared-port cleanup"
            if present
            else "URL-bearing launcher lacks port-scoped lsof/kill restart behavior",
        )

    if kind == "start-script-urls":
        path = project_dir / "start.sh"
        if not path.is_file():
            return False, None, "cannot inspect declarations; start.sh is missing"
        profile = observation["launch_profile"]
        text = path.read_text(encoding="utf-8")
        required_tokens = [
            "PROJECT_NAME=",
            "EXPERIENCE_DESCRIPTION=",
            "START_COMMAND=",
        ]
        if profile["RequiresLocalUrl"]:
            required_tokens.extend(("PRIMARY_URL=", "HEALTH_URL="))
        missing = [token.rstrip("=") for token in required_tokens if token not in text]
        service_ports = {
            urlparse(service["LocalUrl"]).port
            for service in observation["launch_services"]
            if local_http_url(service.get("LocalUrl"))
        }
        missing_ports = sorted(port for port in service_ports if str(port) not in text)
        present = not missing and not missing_ports
        detail_parts: list[str] = []
        if missing:
            detail_parts.append(f"missing declarations {missing}")
        if missing_ports:
            detail_parts.append(f"modeled ports absent from script {missing_ports}")
        return (
            present,
            relative(repo_root, path),
            "project identity and modeled localhost services are declared"
            if present
            else "; ".join(detail_parts),
        )

    if kind == "start-script-health":
        profile = observation["launch_profile"]
        services = observation["launch_services"]
        if not profile["RequiresLocalUrl"]:
            return True, profile["ProjectLaunchProfileId"], "launch profile explicitly requires no local URL"
        primary = [service for service in services if service["IsPrimaryFlag"] == 1]
        malformed = [
            service["ProjectLocalServiceId"]
            for service in services
            if not local_http_url(service.get("LocalUrl"))
            or not local_http_url(service.get("HealthUrl"))
        ]
        present = len(primary) == 1 and not malformed
        if len(primary) != 1:
            detail = f"expected exactly one primary local service; found {len(primary)}"
        elif malformed:
            detail = f"services lack explicit localhost HTTP health contracts: {malformed}"
        else:
            detail = f"primary and health URLs modeled for {len(services)} local service(s)"
        return present, profile["ProjectLaunchProfileId"], detail

    if kind == "rulebook":
        hub_path = observation["hub_path"]
        present = hub_path is not None and observation["hub"] is not None
        return (
            present,
            relative(repo_root, hub_path) if hub_path is not None else None,
            "exactly one accepted hub file"
            if present
            else (
                observation["hub_error"]
                if observation["hub_error"] is not None
                else "no accepted hub file found"
            ),
        )

    if kind == "rulebook-table":
        hub = observation["hub"]
        if hub is None:
            return (
                False,
                None,
                observation["hub_error"]
                if observation["hub_error"] is not None
                else "cannot inspect __meta__; authoritative hub is absent",
            )
        meta = hub.get("__meta__")
        present = (
            isinstance(meta, dict)
            and isinstance(meta.get("schema"), list)
            and isinstance(meta.get("data"), list)
        )
        hub_path = observation["hub_path"]
        return (
            present,
            relative(repo_root, hub_path) if present and hub_path is not None else None,
            "typed-row __meta__ table found" if present else "__meta__ table missing or malformed",
        )

    if kind == "readme-final-section":
        readme = project_dir / "README.md"
        if not readme.is_file():
            return False, None, "README.md is absent"
        text = readme.read_text(encoding="utf-8")
        headings = [line.strip() for line in text.splitlines() if line.startswith("## ")]
        present = bool(headings) and headings[-1] == pattern
        return (
            present,
            relative(repo_root, readme),
            "local-bus section is the final level-two section"
            if present
            else f"final level-two heading is not {pattern!r}",
        )

    if kind == "transpiler":
        if observation["manifest_error"] is not None:
            return False, None, observation["manifest_error"]
        wanted = set(slot["names"])
        matches = [
            transpiler["Name"]
            for transpiler in observation["transpilers"]
            if transpiler["Name"] in wanted and not transpiler.get("IsDisabled", False)
        ]
        present = bool(matches)
        return (
            present,
            matches[0] if present else None,
            f"enabled transpiler {matches[0]}" if present else f"missing enabled transpiler {sorted(wanted)}",
        )

    if kind == "init-db":
        if observation["manifest_error"] is not None:
            return False, None, observation["manifest_error"]
        matches = [
            transpiler
            for transpiler in observation["transpilers"]
            if transpiler["Name"] in {"init-db", "initdb", "execute"}
            and (
                "-exec ./reset-rulebook-db.sh" in transpiler["CommandLine"]
                or "-exec ./init-db.sh" in transpiler["CommandLine"]
                or "-exec ./init-root-db.sh" in transpiler["CommandLine"]
            )
            and not transpiler.get("IsDisabled", False)
        ]
        present = bool(matches)
        return (
            present,
            matches[0]["Name"] if present else None,
            f"enabled {matches[0]['Name']} executes an explicit init-db script"
            if present
            else "no enabled init-db/initdb/execute entry executes an explicit init-db script",
        )

    if kind == "one-of-directories":
        matches = [project_dir / name for name in slot["paths"] if (project_dir / name).is_dir()]
        present = bool(matches)
        return (
            present,
            relative(repo_root, matches[0]) if present else None,
            f"found {matches[0].name}/"
            if present
            else f"none of the expected directories exists: {pattern}",
        )

    raise ScanError(f"Unsupported slot kind: {kind}")


def update_findings(
    rulebook: OrderedDict[str, Any],
    witnesses: list[OrderedDict[str, Any]],
    witnessed_on: str,
) -> None:
    findings = rulebook["ConsistencyFindings"]["data"]
    by_id = {row["ConsistencyFindingId"]: row for row in findings}
    require(len(by_id) == len(findings), "ConsistencyFindings contains duplicate IDs")

    current: dict[str, tuple[str, str, str]] = {}
    for witness in witnesses:
        if not witness["IsGap"]:
            continue
        rule_id = (
            "cr-17"
            if witness["Slot"].startswith("slot-start-sh")
            else "cr-19"
        )
        finding_id = f"{rule_id}-slot-{witness['Domain']}-{witness['Slot']}"
        detail = (
            f"{witness['Domain']} fails {witness['Slot']}: "
            f"{witness['WitnessedDetail']}"
        )
        current[finding_id] = (rule_id, witness["Domain"], detail)

    generated_prefixes = ("cr-17-slot-", "cr-19-slot-")
    for finding in findings:
        finding_id = finding["ConsistencyFindingId"]
        if finding_id.startswith(generated_prefixes) and finding_id not in current:
            if finding["Status"] == "open":
                finding["Status"] = "fixed"

    for finding_id, (rule_id, domain_id, detail) in current.items():
        if finding_id in by_id:
            finding = by_id[finding_id]
            finding["Detail"] = detail
            finding["Status"] = "open"
        else:
            finding = OrderedDict(
                (
                    ("ConsistencyFindingId", finding_id),
                    ("Rule", rule_id),
                    ("Domain", domain_id),
                    ("Detail", detail),
                    ("Status", "open"),
                    ("DetectedOn", witnessed_on),
                )
            )
            findings.append(finding)
            by_id[finding_id] = finding

    bootstrap = by_id.get("cr-17-00")
    require(bootstrap is not None, "Expected Phase 0 bootstrap finding cr-17-00")
    bootstrap["Status"] = "fixed"


def refresh_witness_data(
    rulebook: OrderedDict[str, Any],
    repo_root: Path,
    witnessed_on: str,
) -> list[str]:
    projects = modeled_project_directories(rulebook, repo_root)
    project_id = rulebook["ProjectMetadata"]["data"][0]["ProjectId"]
    witnesses: list[OrderedDict[str, Any]] = []
    scan_errors: list[str] = []
    launch_profiles = rulebook["ProjectLaunchProfiles"]["data"]
    launch_profiles_by_domain = {
        row["Domain"]: row for row in launch_profiles
    }
    require(
        len(launch_profiles_by_domain) == len(launch_profiles),
        "ProjectLaunchProfiles contains duplicate Domain relationships",
    )
    domain_ids = {domain["DomainId"] for domain, _, _ in projects}
    require(
        set(launch_profiles_by_domain) == domain_ids,
        "Every governed row must have exactly one launch profile: "
        f"missing={sorted(domain_ids - set(launch_profiles_by_domain))} "
        f"extra={sorted(set(launch_profiles_by_domain) - domain_ids)}",
    )
    launch_services_by_profile: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for service in rulebook["ProjectLocalServices"]["data"]:
        launch_services_by_profile[service["LaunchProfile"]].append(service)

    for domain, project_dir, slug in projects:
        observation = inspect_project(project_dir, slug, scan_errors)
        launch_profile = launch_profiles_by_domain[domain["DomainId"]]
        observation["launch_profile"] = launch_profile
        observation["launch_services"] = launch_services_by_profile[
            launch_profile["ProjectLaunchProfileId"]
        ]
        area = domain["Area"]
        kind = domain["Kind"]
        is_exception = domain["IsIntentionalException"]
        for slot in SLOTS:
            present, witnessed_path, detail = observe_slot(
                slot, project_dir, observation, repo_root
            )
            if is_exception:
                required_here = False
                implementation_required = False
                universal_required = False
            else:
                if kind == "root":
                    required_here = slot["root"]
                    implementation_required = slot["root"]
                elif kind == "example":
                    required_here = slot["example"]
                    implementation_required = slot["example"]
                elif kind == "toy":
                    required_here = slot["toy"]
                    implementation_required = slot["example"]
                else:
                    raise ScanError(
                        f"Unsupported RulebookDomains.Kind {kind!r} on {domain['DomainId']}"
                    )
                universal_required = slot["toy"]

            is_gap = required_here and not present
            implementation_gap = implementation_required and not present
            universal_gap = universal_required and not present
            witness_id = f"{domain['DomainId']}:{slot['id']}"
            witnesses.append(
                OrderedDict(
                    (
                        ("ProjectSlotWitnessId", witness_id),
                        ("Name", witness_id),
                        ("Domain", domain["DomainId"]),
                        ("Slot", slot["id"]),
                        ("IsPresent", present),
                        ("WitnessedPath", witnessed_path),
                        ("WitnessedDetail", detail),
                        ("WitnessedOn", witnessed_on),
                        ("PresentFlag", 1 if present else 0),
                        ("SlotRequiredForRoot", slot["root"]),
                        ("SlotRequiredForExample", slot["example"]),
                        ("SlotRequiredForToy", slot["toy"]),
                        ("DomainArea", area),
                        ("DomainKind", kind),
                        ("DomainIsException", is_exception),
                        ("IsRequiredHere", required_here),
                        ("ImplementationGapFlag", 1 if implementation_gap else 0),
                        ("UniversalGapFlag", 1 if universal_gap else 0),
                        ("IsGap", is_gap),
                        ("GapFlag", 1 if is_gap else 0),
                        ("RequiredHereFlag", 1 if required_here else 0),
                        ("RequiredPresentFlag", 1 if required_here and present else 0),
                        (
                            "WitnessState",
                            "gap" if is_gap else ("filled" if present else "optional-empty"),
                        ),
                        ("IsBlockingGap", is_gap),
                    )
                )
            )

    existing_witnesses = rulebook["ProjectSlotWitnesses"]["data"]
    existing_ids = {row["ProjectSlotWitnessId"] for row in existing_witnesses}
    new_ids = {row["ProjectSlotWitnessId"] for row in witnesses}
    require(
        not existing_ids or existing_ids <= new_ids,
        "Witness identity set lost canonical rows; refusing destructive refresh: "
        f"removed={sorted(existing_ids - new_ids)}",
    )
    rulebook["ProjectSlotWitnesses"]["data"] = witnesses

    witness_by_slot: dict[str, list[dict[str, Any]]] = defaultdict(list)
    witness_by_domain: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for witness in witnesses:
        witness_by_slot[witness["Slot"]].append(witness)
        witness_by_domain[witness["Domain"]].append(witness)

    slot_rows: list[OrderedDict[str, Any]] = []
    for slot in SLOTS:
        slot_witnesses = witness_by_slot[slot["id"]]
        witness_count = len(slot_witnesses)
        present_count = sum(row["PresentFlag"] for row in slot_witnesses)
        implementation_gap_count = sum(
            row["ImplementationGapFlag"] for row in slot_witnesses
        )
        coverage = round(100 * present_count / witness_count) if witness_count else 0
        slot_health = (
            "clean"
            if implementation_gap_count == 0
            else ("few-gaps" if implementation_gap_count <= 3 else "widespread")
        )
        slot_rows.append(
            OrderedDict(
                (
                    ("ProjectLayoutSlotId", slot["id"]),
                    ("Name", slot["title"]),
                    ("Title", slot["title"]),
                    ("Kind", slot["kind"]),
                    ("Pattern", slot["pattern"]),
                    ("RequiredForRoot", slot["root"]),
                    ("RequiredForExample", slot["example"]),
                    ("RequiredForToy", slot["toy"]),
                    ("Description", slot["description"]),
                    ("Project", project_id),
                    ("WitnessCount", witness_count),
                    ("PresentCount", present_count),
                    ("ImplementationGapCount", implementation_gap_count),
                    ("CoveragePercent", coverage),
                    ("IsUniversallyFilled", coverage == 100),
                    ("SlotHealth", slot_health),
                    ("SlotLabel", f"{slot['title']} [{slot_health}]"),
                )
            )
        )

    existing_slots = rulebook["ProjectLayoutSlots"]["data"]
    existing_slot_ids = {row["ProjectLayoutSlotId"] for row in existing_slots}
    canonical_slot_ids = {row["ProjectLayoutSlotId"] for row in slot_rows}
    require(
        not existing_slot_ids or existing_slot_ids <= canonical_slot_ids,
        "ProjectLayoutSlots lost canonical rows; refusing destructive refresh",
    )
    rulebook["ProjectLayoutSlots"]["data"] = slot_rows

    fully_implemented_count = 0
    for domain in rulebook["RulebookDomains"]["data"]:
        rows = witness_by_domain[domain["DomainId"]]
        witness_count = len(rows)
        present_count = sum(row["PresentFlag"] for row in rows)
        implementation_gap_count = sum(row["ImplementationGapFlag"] for row in rows)
        universal_gap_count = sum(row["UniversalGapFlag"] for row in rows)
        required_count = sum(row["RequiredHereFlag"] for row in rows)
        required_present = sum(row["RequiredPresentFlag"] for row in rows)
        required_gap_count = sum(row["GapFlag"] for row in rows)
        slot_coverage = round(100 * present_count / witness_count) if witness_count else 0
        required_coverage = (
            round(100 * required_present / required_count) if required_count else 100
        )
        is_exception = domain["IsIntentionalException"]
        is_fully_implemented = not is_exception and implementation_gap_count == 0
        is_toy = domain["Kind"] == "toy"
        expected_area = (
            "root"
            if domain["Kind"] == "root"
            else ("toy-rulebooks" if is_toy else "rulebook-examples")
        )
        is_misfiled = not is_exception and domain["Area"] != expected_area
        if is_exception:
            readiness = "intentional-exception"
        elif domain["Kind"] == "root":
            readiness = "root-ready" if is_fully_implemented else "root-incomplete"
        elif is_toy:
            readiness = "toy"
        elif is_fully_implemented:
            readiness = "example-ready"
        else:
            readiness = "example-incomplete"

        domain.update(
            OrderedDict(
                (
                    ("SlotWitnessCount", witness_count),
                    ("PresentSlotCount", present_count),
                    ("ImplementationGapCount", implementation_gap_count),
                    ("UniversalGapCount", universal_gap_count),
                    ("SlotCoveragePercent", slot_coverage),
                    ("RequiredSlotCount", required_count),
                    ("RequiredPresentCount", required_present),
                    ("RequiredGapCount", required_gap_count),
                    ("IsFullyImplemented", is_fully_implemented),
                    ("IsToy", is_toy),
                    ("FullyImplementedFlag", 1 if is_fully_implemented else 0),
                    ("RequiredSlotCoveragePercent", required_coverage),
                    ("ExpectedArea", expected_area),
                    ("IsMisfiled", is_misfiled),
                    ("ReadinessState", readiness),
                )
            )
        )
        fully_implemented_count += 1 if is_fully_implemented else 0

    metadata_row = rulebook["ProjectMetadata"]["data"][0]
    metadata_row["LayoutSlotCount"] = len(SLOTS)
    metadata_row["FullyImplementedCount"] = fully_implemented_count

    update_findings(rulebook, witnesses, witnessed_on)
    return scan_errors


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("rulebook", type=Path, help="Root effortless-rulebook.json")
    parser.add_argument("repo_root", type=Path, help="Repository root directory")
    parser.add_argument(
        "--witnessed-on",
        default=dt.date.today().isoformat(),
        help="ISO date recorded on refreshed witnesses and new findings",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    rulebook_path = args.rulebook.resolve(strict=True)
    repo_root = args.repo_root.resolve(strict=True)
    require(repo_root.is_dir(), f"Repository root is not a directory: {repo_root}")
    require(
        rulebook_path == repo_root / "effortless-rulebook" / "effortless-rulebook.json",
        "This scanner only operates on the explicitly named root governing rulebook",
    )
    dt.date.fromisoformat(args.witnessed_on)

    rulebook = read_json(rulebook_path)
    ensure_slot_model(rulebook, repo_root)
    scan_errors = refresh_witness_data(rulebook, repo_root, args.witnessed_on)
    write_json(rulebook_path, rulebook)

    print(
        f"Scanned {len(rulebook['RulebookDomains']['data'])} governed rows x "
        f"{len(SLOTS)} slots = {len(rulebook['ProjectSlotWitnesses']['data'])} witnesses."
    )
    if scan_errors:
        for error in scan_errors:
            print(f"ERROR: {error}")
        raise SystemExit(
            f"Slot witnesses were recorded, but {len(scan_errors)} malformed project artifact(s) make the strict scan fail."
        )


if __name__ == "__main__":
    main()

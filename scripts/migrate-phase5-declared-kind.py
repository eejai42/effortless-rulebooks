#!/usr/bin/env python3
"""Make toy-versus-example a declared attribute of each project (2026-09-05).

Before: `IsToyByCoverage` derived "toy" from slot coverage (< 60 %), so giving a toy a
README, a CLAUDE.md and a start.sh silently reclassified it as an example and flagged it
misfiled. Toy is a statement of intent, not of file count, so:

* `RulebookDomains.Kind` (raw: root | toy | example) declares it. Seeded from the folder
  each project sits in today; change the value to re-classify a project.
* `IsToy` replaces `IsToyByCoverage`; `ExpectedArea`, `IsMisfiled`, `ReadinessState` and
  `ToyFlag` follow the declaration. `IsMisfiled` now means "the folder disagrees with the
  declared kind", which is a real inconsistency.
* `ProjectSlotWitnesses` decide which slots are required from the declared kind
  (`DomainKind`), not from the folder.

Idempotent. Usage:
    python3 scripts/migrate-phase5-declared-kind.py effortless-rulebook/effortless-rulebook.json
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

KIND_BY_AREA = {"root": "root", "toy-rulebooks": "toy", "rulebook-examples": "example"}


def field(schema, name):
    for f in schema:
        if f["name"] == name:
            return f
    raise SystemExit(f"field {name} not found")


def upsert(schema, after, spec):
    existing = [f for f in schema if f["name"] == spec["name"]]
    if existing:
        existing[0].update(spec)
        return
    idx = next(i for i, f in enumerate(schema) if f["name"] == after) + 1
    schema.insert(idx, spec)


def main() -> None:
    path = Path(sys.argv[1])
    rb = json.loads(path.read_text(encoding="utf-8"))

    dom = rb["RulebookDomains"]
    upsert(dom["schema"], "Area", {
        "name": "Kind", "datatype": "string", "type": "raw", "nullable": False,
        "Description": "Declared classification: root | toy | example. A toy is a statement of intent (a small teaching rulebook), not a count of files; change this value to re-classify a project. The folder it lives in is witnessed separately as Area.",
    })
    for row in dom["data"]:
        row.setdefault("Kind", KIND_BY_AREA[row["Area"]])
    schema = dom["schema"]
    # IsToy (previously Area = "toy-rulebooks") now follows the declaration; IsToyByCoverage is retired
    schema[:] = [f for f in schema if f["name"] != "IsToyByCoverage"]
    field(schema, "IsToy").update({"formula": '={{Kind}} = "toy"', "Description": "Order 1. Declared as a toy (Kind = toy)."})
    field(schema, "ToyFlag").update({"formula": "=IF({{IsToy}}, 1, 0)", "Description": "Order 2. 1 for declared toys — rollup carrier."})
    field(schema, "ExpectedArea").update({
        "formula": '=IF({{Kind}} = "root", "root", IF({{IsToy}}, "toy-rulebooks", "rulebook-examples"))',
        "Description": "Order 2. Folder implied by the declared Kind."})
    field(schema, "IsMisfiled").update({
        "formula": '=AND(NOT({{IsIntentionalException}}), {{Area}} <> {{ExpectedArea}})',
        "Description": "Order 3. The physical folder disagrees with the declared Kind."})
    field(schema, "ReadinessState").update({
        "formula": '=IF({{IsIntentionalException}}, "intentional-exception", IF({{Kind}} = "root", IF({{IsFullyImplemented}}, "root-ready", "root-incomplete"), IF({{IsToy}}, "toy", IF({{IsFullyImplemented}}, "example-ready", "example-incomplete"))))',
        "Description": "Order 5. intentional-exception | root-ready | root-incomplete | toy | example-ready | example-incomplete. Toy/example is declared (Kind); ready/incomplete is witnessed."})

    wit = rb["ProjectSlotWitnesses"]["schema"]
    # exact shape scripts/scan-project-slots.py emits (it owns this schema and checks equality)
    upsert(wit, "DomainArea", {
        "name": "DomainKind", "datatype": "string", "type": "lookup", "nullable": True,
        "Description": "Order 1. The declared Kind (root | toy | example) of the witnessed project.",
        "RelatedTo": "RulebookDomains", "isReversed": False, "prefersSingleRecordLink": True,
        "LookupField": "Kind", "ViaField": "Domain",
        "formula": "=INDEX(RulebookDomains!{{Kind}}, MATCH(ProjectSlotWitnesses!{{Domain}}, RulebookDomains!{{DomainId}}, 0))",
    })
    field(wit, "IsRequiredHere")["Description"] = "Order 2. The slot is required for this row's declared Kind."
    field(wit, "IsRequiredHere")["formula"] = (
        '=AND(NOT(COALESCE({{DomainIsException}}, FALSE())), OR('
        'AND({{DomainKind}} = "root", COALESCE({{SlotRequiredForRoot}}, FALSE())), '
        'AND({{DomainKind}} = "example", COALESCE({{SlotRequiredForExample}}, FALSE())), '
        'AND({{DomainKind}} = "toy", COALESCE({{SlotRequiredForToy}}, FALSE()))))')
    field(wit, "ImplementationGapFlag")["formula"] = (
        '=IF(AND(NOT({{IsPresent}}), NOT(COALESCE({{DomainIsException}}, FALSE())), OR('
        'AND({{DomainKind}} = "root", COALESCE({{SlotRequiredForRoot}}, FALSE())), '
        'AND({{DomainKind}} <> "root", COALESCE({{SlotRequiredForExample}}, FALSE())))), 1, 0)')

    path.write_text(json.dumps(rb, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    kinds = {}
    for row in dom["data"]:
        kinds[row["Kind"]] = kinds.get(row["Kind"], 0) + 1
    print("Kind declared:", kinds)


if __name__ == "__main__":
    main()

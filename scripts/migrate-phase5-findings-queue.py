#!/usr/bin/env python3
"""US-036: make "closable by hand" a modeled fact, not an id-prefix heuristic.

Adds to the root rulebook:

- ConsistencyRules.IsScannerDerived (raw boolean): true for the rules whose
  findings scripts/scan-project-slots.py re-derives (cr-17, cr-19). Those
  findings are closed by re-running the scan, never by hand.
- ConsistencyFindings.RuleIsScannerDerived (lookup) and IsHandClosable
  (calculated): open AND not scanner-derived. The explorer's work queue and
  scripts/mark-finding-fixed.py both read this instead of matching id prefixes.

Idempotent: re-running changes nothing once the fields exist.

Usage:
    python3 scripts/migrate-phase5-findings-queue.py effortless-rulebook/effortless-rulebook.json
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

SCANNER_RULES = {"cr-17", "cr-19"}

RULE_FIELD = {
    "name": "IsScannerDerived",
    "datatype": "boolean",
    "type": "raw",
    "nullable": False,
    "Description": "True when this rule's findings are re-derived by scripts/scan-project-slots.py; they close by re-running the scan, never by hand.",
}

FINDING_FIELDS = [
    {
        "name": "RuleIsScannerDerived",
        "datatype": "boolean",
        "type": "lookup",
        "nullable": True,
        "Description": "Order 1. Whether the violated rule's findings are scanner-derived.",
        "RelatedTo": "ConsistencyRules",
        "isReversed": False,
        "prefersSingleRecordLink": True,
        "LookupField": "IsScannerDerived",
        "ViaField": "Rule",
        "formula": "=INDEX(ConsistencyRules!{{IsScannerDerived}}, MATCH(ConsistencyFindings!{{Rule}}, ConsistencyRules!{{ConsistencyRuleId}}, 0))",
    },
    {
        "name": "IsHandClosable",
        "datatype": "boolean",
        "type": "calculated",
        "nullable": True,
        "Description": "Order 2. Open and not scanner-derived: the work queue may mark it fixed or accepted-exception by hand.",
        "formula": "=AND({{IsOpen}}, NOT({{RuleIsScannerDerived}}))",
    },
]


def insert_after(schema: list, after: str, field: dict) -> None:
    names = [f["name"] for f in schema]
    if field["name"] in names:
        return
    schema.insert(names.index(after) + 1, field)


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    path = Path(sys.argv[1])
    rb = json.loads(path.read_text(encoding="utf-8"))

    rules = rb["ConsistencyRules"]
    insert_after(rules["schema"], "SourceDoctrine", RULE_FIELD)
    for row in rules["data"]:
        row.setdefault("IsScannerDerived", row["ConsistencyRuleId"] in SCANNER_RULES)

    findings = rb["ConsistencyFindings"]
    insert_after(findings["schema"], "RuleSeverity", FINDING_FIELDS[0])
    insert_after(findings["schema"], "IsOpenCritical", FINDING_FIELDS[1])

    path.write_text(json.dumps(rb, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    flagged = sorted(r["ConsistencyRuleId"] for r in rules["data"] if r["IsScannerDerived"])
    print(f"scanner-derived rules: {', '.join(flagged)}")


if __name__ == "__main__":
    main()

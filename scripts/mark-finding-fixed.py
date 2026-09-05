#!/usr/bin/env python3
"""Mark hand-recorded consistency findings fixed (never deleted) in the root rulebook.

Pass --status accepted-exception (before the ids) for a finding that is true but
cannot be resolved inside this repository; the Detail row stays as the witness.

Findings of a rule with IsScannerDerived true are re-derived by
scripts/scan-project-slots.py; use this only for findings whose rule has no
mechanical witness. Refuses unknown ids and ids that are not open. The root
explorer's work queue calls this same script.

Usage:
    python3 scripts/mark-finding-fixed.py effortless-rulebook/effortless-rulebook.json cr-07-01 cr-07-02 ...
"""

from __future__ import annotations

import json
import sys
from pathlib import Path


def main() -> None:
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    path = Path(sys.argv[1])
    ids = sys.argv[2:]
    status = "fixed"
    if ids and ids[0] == "--status":
        status = ids[1]
        ids = ids[2:]
        if status not in {"fixed", "accepted-exception"}:
            raise SystemExit("--status must be fixed or accepted-exception")
    rulebook = json.loads(path.read_text(encoding="utf-8"))
    rows = {r["ConsistencyFindingId"]: r for r in rulebook["ConsistencyFindings"]["data"]}
    scanner_rules = {r["ConsistencyRuleId"] for r in rulebook["ConsistencyRules"]["data"] if r["IsScannerDerived"]}
    for fid in ids:
        if fid not in rows:
            raise SystemExit(f"no finding {fid!r} in ConsistencyFindings")
        if rows[fid]["Status"] != "open":
            raise SystemExit(f"finding {fid!r} is not open (status {rows[fid]['Status']!r})")
        if rows[fid]["Rule"] in scanner_rules:
            raise SystemExit(f"{fid!r} belongs to scanner-derived rule {rows[fid]['Rule']}; re-run scripts/scan-project-slots.py instead")
        rows[fid]["Status"] = status
    path.write_text(json.dumps(rulebook, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"marked {status}: {', '.join(ids)}")


if __name__ == "__main__":
    main()

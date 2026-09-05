#!/usr/bin/env python3
"""Reconcile UserStories / AcceptanceCriteria with what the repository actually witnesses (2026-09-05).

The Phase 2 stories (us-009 .. us-020) were delivered by the Phase 5 consistency passes,
but their rows still said todo / 0 %. Each criterion below was checked mechanically before
being flipped; the evidence is recorded next to it so the flip is auditable. Stories whose
work is genuinely not done (us-039, us-041, us-043, us-045, and us-036's write-through
criterion) are left alone.

Idempotent. Usage:
    python3 scripts/migrate-phase5-reconcile-stories.py effortless-rulebook/effortless-rulebook.json
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

# criterion id -> evidence (all verified 2026-09-05)
MET = {
    "us-009-ac1": "all six hubs live under <project>/effortless-rulebook/ (either accepted hub name)",
    "us-009-ac2": "every affected effortless.json points at the moved hub; the projects rebuilt",
    "us-009-ac3": "vw_consistency_findings: 0 open cr-01 findings",
    "us-010-ac1": "rulebook-examples/effortless-banking/effortless-rulebook.json no longer exists",
    "us-010-ac2": "traffic-ticket-contest/effortless-rulebook/ holds only traffic-ticket-contest-rulebook.json",
    "us-010-ac3": "job-search-rag/SSoT/ no longer exists",
    "us-011-ac1": "git ls-files matches no .bak, __pycache__, node_modules or .app-launch.log",
    "us-011-ac2": "root .gitignore blocks all four",
    "us-012-ac1": "toy-rulebooks/lazr-coulombs-law/.git no longer exists (it was an empty git init skeleton)",
    "us-012-ac2": "25 lazr files tracked by the monorepo; the nested repo had no history to preserve",
    "us-013-ac1": "39 manifests register rulebooktorulespeak; the only miss is the intentional exception",
    "us-013-ac2": "rulespeak/rulespeak.md (or rulespeak-english/) exists in every governed project",
    "us-014-ac1": "no effortless.json has two ProjectTranspilers entries with the same Name",
    "us-014-ac2": "tocobcol/explainddag fixed in pass B; customer-fullname's effortless-rulebook-editor normalized to effortlessrulebookeditor",
    "us-015-ac1": "naive-set-theory, planar-unit-discovery and turek-hitchens carry real manifests with rulespeak",
    "us-015-ac2": "veritasium's effortless.json is a real manifest (4 transpilers, no rulebook tables)",
    "us-016-ac1": "find rulebook-examples toy-rulebooks -name ssotme.json returns nothing",
    "us-016-ac2": "their transpiler entries live in effortless.json",
    "us-017-ac1": "40 project directories, 40 README.md files",
    "us-018-ac1": "every README's last ## heading is the Local transpiler bus block",
    "us-018-ac2": "the block says 13; ssotme-proxy TRANSPILERS has 13 top-level routes",
    "us-019-ac1": "naive-set-theory and veritasium carry __meta__ tables",
    "us-019-ac2": "the five hubs that still carried a top-level _meta had it promoted into __meta__ rows",
    "us-020-ac1": "CLAUDE.md cites none of acme-llc/star-trek/talisman-basic as rulebook-examples paths",
    "us-020-ac2": "CLAUDE.md documents toy-rulebooks/volunteer-shift-scheduler-demo/ as an intentional exception",
    "us-024-ac2": "AcceptanceCriteria.IsMet exists and drives DerivedProgressPercent / IsAcceptanceComplete",
    "us-027-ac1": "the explorer's /progress route links /generated/progress-report/progress-report.html",
    "us-036-ac1": "the explorer's /consistency route reads ConsistencyFindings through the generated API",
    "us-037-ac1": "Health.jsx reads vw_rulebook_domains conformance columns; it only sorts, never recomputes",
}
DONE = ["us-009", "us-010", "us-011", "us-012", "us-013", "us-014", "us-015", "us-016", "us-017", "us-018",
        "us-019", "us-020", "us-024", "us-027", "us-037"]
IN_PROGRESS = {"us-036": 50}


def main() -> None:
    path = Path(sys.argv[1])
    rb = json.loads(path.read_text(encoding="utf-8"))
    criteria = {c["AcceptanceCriterionId"]: c for c in rb["AcceptanceCriteria"]["data"]}
    stories = {s["UserStoryId"]: s for s in rb["UserStories"]["data"]}
    for cid in MET:
        criteria[cid]["IsMet"] = True
    for sid in DONE:
        stories[sid]["Status"] = "done"
        stories[sid]["DevProgressPercent"] = 100
    for sid, pct in IN_PROGRESS.items():
        stories[sid]["Status"] = "in-progress"
        stories[sid]["DevProgressPercent"] = pct
    # every criterion of a done story must be met, or the view will report drift
    for sid in DONE:
        for c in criteria.values():
            if c["UserStory"] == sid and not c["IsMet"]:
                raise SystemExit(f"{sid} marked done but {c['AcceptanceCriterionId']} is not met")
    path.write_text(json.dumps(rb, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{len(MET)} criteria met, {len(DONE)} stories done, {len(IN_PROGRESS)} in progress")


if __name__ == "__main__":
    main()

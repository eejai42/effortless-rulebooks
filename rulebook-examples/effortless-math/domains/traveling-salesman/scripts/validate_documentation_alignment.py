#!/usr/bin/env python3
"""Validate TSP documentation against the consolidated semantic boundary."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Iterable

HERE = Path(__file__).resolve().parent
DOMAIN = HERE.parent
REPO = DOMAIN.parents[3]
MATH = DOMAIN.parents[1]


def require_file(path: Path) -> str:
    if not path.is_file():
        raise FileNotFoundError(f"missing required documentation artifact: {path}")
    return path.read_text()


def require_terms(path: Path, terms: Iterable[str]) -> None:
    text = require_file(path)
    missing = [term for term in terms if term not in text]
    if missing:
        raise AssertionError(f"{path.relative_to(REPO)} lacks required terms: {missing}")


def reject_terms(path: Path, terms: Iterable[str]) -> None:
    text = require_file(path)
    present = [term for term in terms if term in text]
    if present:
        raise AssertionError(f"{path.relative_to(REPO)} contains stale terms: {present}")


def validate_non_readme() -> None:
    require_terms(
        MATH / "docs" / "LOOP_PROTOCOL.md",
        [
            "canonical rulebook semantic object changed",
            "A campaign plan is **not** inserted into the canonical loop ledger in bulk.",
            "Bulk insertion of future `PLANNED` rows",
        ],
    )
    require_terms(
        MATH / "RESEARCH_CURRENT_STATUS.md",
        [
            "canonical loop range       577–812",
            "canonical loop rows             236",
            "historical labels 813–1532 are reserved",
            "build-certificate.json",
        ],
    )
    require_terms(
        MATH / "RESEARCH_HANDOFF.md",
        [
            "SUPERSEDED CURRENT-STATE NOTICE",
            "canonical TSP ledger is now 577–812 with 236 rows",
            "historical provider-iteration labels 813–1532",
        ],
    )
    require_terms(
        REPO / "research-campaigns" / "_alignment" / "provider-local-result-1033-1532.md",
        [
            "Historical Iteration Labels 1033–1532",
            "not canonical TSP loops",
            "current canonical TSP ledger ends at loop 812 with 236 rows",
        ],
    )

    inventory_path = REPO / "research-campaigns" / "_alignment" / "local-artifact-inventory.json"
    inventory = json.loads(require_file(inventory_path))
    if inventory.get("canonical_tsp_loop_boundary") != 812:
        raise AssertionError("local artifact inventory canonical boundary is not 812")
    if inventory.get("canonical_tsp_loop_count") != 236:
        raise AssertionError("local artifact inventory canonical loop count is not 236")
    if inventory.get("status") != "CANONICAL_577_812_WITH_PROVIDER_LOCAL_813_1532":
        raise AssertionError("local artifact inventory status is stale")

    summary = json.loads(
        require_file(REPO / "research-campaigns" / "wall-clock-813-912" / "summary.json")
    )
    validation = json.loads(
        require_file(REPO / "research-campaigns" / "wall-clock-813-912" / "validation.json")
    )
    for name, value in (("summary", summary), ("validation", validation)):
        if value.get("historical_iteration_label_range") != [813, 912]:
            raise AssertionError(f"wall-clock {name} label range is stale")
        if value.get("canonical_rulebook_loop_count") != 0:
            raise AssertionError(f"wall-clock {name} incorrectly claims canonical loops")
        if value.get("canonical_rulebook_changed") is not False:
            raise AssertionError(f"wall-clock {name} incorrectly claims a rulebook change")


def validate_readmes() -> None:
    require_terms(
        REPO / "README.md",
        [
            "<!-- loop-protocol: canonical-rulebook-semantic-change -->",
            "A loop is one parsed canonical-rulebook semantic change",
            "canonical TSP ledger spans loops 577–812",
        ],
    )
    require_terms(
        MATH / "README.md",
        [
            "<!-- tsp-consolidation: canonical-loops=577-812 rows=236 -->",
            "A loop is exactly one change to the parsed canonical rulebook object",
            "historical provider-iteration labels 813–1532",
        ],
    )
    require_terms(
        DOMAIN / "README.md",
        [
            "<!-- tsp-consolidation: canonical-loops=577-812 rows=236 views=45 -->",
            "The single canonical `TSPLoops` ledger contains 236 closed rows",
            "provider-iteration labels 813–1532 are reserved but noncanonical",
            "testing/consolidation/build-certificate.json",
        ],
    )
    require_terms(
        REPO / "research-campaigns" / "_alignment" / "README.md",
        [
            "<!-- tsp-alignment: canonical-loops=577-812 provider-labels=813-1532 -->",
            "canonical loop boundary is 812",
            "provider-iteration labels 813–1532",
        ],
    )
    wall_clock = REPO / "research-campaigns" / "wall-clock-813-912" / "README.md"
    require_terms(
        wall_clock,
        [
            "<!-- tsp-provider-iterations: labels=813-912 canonical-loops=0 -->",
            "Historical provider-iteration labels 813–912",
            "These 100 labels are not canonical TSP loops",
        ],
    )
    reject_terms(
        wall_clock,
        [
            "# TSP wall-clock campaign — loops 813–912",
            "**Loops:** 100, contiguous from 813 through 912",
        ],
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--include-readmes", action="store_true")
    args = parser.parse_args()
    validate_non_readme()
    if args.include_readmes:
        validate_readmes()
    print(
        "traveling-salesman documentation alignment: PASS "
        f"(readmes={'included' if args.include_readmes else 'deferred'})"
    )


if __name__ == "__main__":
    main()

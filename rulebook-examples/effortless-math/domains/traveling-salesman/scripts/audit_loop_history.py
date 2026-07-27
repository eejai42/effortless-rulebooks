#!/usr/bin/env python3
"""Audit Git history against the strict TSP loop definition.

The audit proves that the 713-812 closure commits each changed exactly their own
canonical loop row. It also records, rather than conceals, the historical bulk
preregistration commit that inserted PLANNED rows before ordered closure.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
DOMAIN = HERE.parent
REPO = DOMAIN.parents[3]
RULEBOOK_REL = (DOMAIN / "effortless-rulebook" / "traveling-salesman-rulebook.json").relative_to(REPO).as_posix()
DEFAULT_OUTPUT = DOMAIN / "testing" / "consolidation" / "loop-history-audit.json"
LOOP_SUBJECT = re.compile(r"^TSP loop (\d+): .+")
PREREG_SUBJECT = "TSP loops 713-812: preregister frozen TSPLIB campaign"


def git(*args: str, check: bool = True) -> str:
    result = subprocess.run(
        ["git", *args],
        cwd=REPO,
        check=check,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    return result.stdout


def load_rulebook_at(commit: str) -> dict[str, Any] | None:
    result = subprocess.run(
        ["git", "show", f"{commit}:{RULEBOOK_REL}"],
        cwd=REPO,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if result.returncode != 0:
        return None
    return json.loads(result.stdout)


def first_parent(commit: str) -> str | None:
    parents = git("show", "-s", "--format=%P", commit).strip().split()
    return parents[0] if parents else None


def loop_map(rulebook: dict[str, Any] | None) -> dict[int, dict[str, Any]]:
    if rulebook is None:
        return {}
    return {
        int(row["LoopOrder"]): row
        for row in rulebook.get("TSPLoops", {}).get("data", [])
    }


def changed_loop_rows(before: dict[str, Any] | None, after: dict[str, Any] | None) -> list[int]:
    left = loop_map(before)
    right = loop_map(after)
    return sorted(
        order
        for order in set(left) | set(right)
        if left.get(order) != right.get(order)
    )


def semantic_changed(before: dict[str, Any] | None, after: dict[str, Any] | None) -> bool:
    return before != after


def commit_rows() -> list[tuple[str, str]]:
    rows: list[tuple[str, str]] = []
    for line in git("log", "--all", "--format=%H%x09%s").splitlines():
        sha, subject = line.split("\t", 1)
        rows.append((sha, subject))
    return rows


def unique_commit_by_subject(subject: str, rows: list[tuple[str, str]]) -> str:
    matches = [sha for sha, candidate in rows if candidate == subject]
    if len(matches) != 1:
        raise AssertionError(f"expected one commit named {subject!r}, found {matches}")
    return matches[0]


def audit() -> dict[str, Any]:
    rows = commit_rows()
    by_loop: dict[int, list[tuple[str, str]]] = {}
    for sha, subject in rows:
        match = LOOP_SUBJECT.fullmatch(subject)
        if match:
            by_loop.setdefault(int(match.group(1)), []).append((sha, subject))

    ordered_commits: list[dict[str, Any]] = []
    for order in range(713, 813):
        matches = by_loop.get(order, [])
        if len(matches) != 1:
            raise AssertionError(f"expected exactly one ordered commit for loop {order}; found {matches}")
        sha, subject = matches[0]
        parent = first_parent(sha)
        if parent is None:
            raise AssertionError(f"loop {order} commit has no parent")
        before = load_rulebook_at(parent)
        after = load_rulebook_at(sha)
        changed = changed_loop_rows(before, after)
        if not semantic_changed(before, after):
            raise AssertionError(f"loop {order} commit did not change the parsed rulebook")
        if changed != [order]:
            raise AssertionError(
                f"loop {order} commit must change exactly its own TSPLoops row; changed={changed}"
            )
        ordered_commits.append(
            {
                "loop_order": order,
                "commit": sha,
                "subject": subject,
                "parent": parent,
                "semantic_rulebook_changed": True,
                "changed_loop_rows": changed,
            }
        )

    prereg = unique_commit_by_subject(PREREG_SUBJECT, rows)
    prereg_parent = first_parent(prereg)
    if prereg_parent is None:
        raise AssertionError("preregistration commit has no parent")
    prereg_before = load_rulebook_at(prereg_parent)
    prereg_after = load_rulebook_at(prereg)
    prereg_changed = changed_loop_rows(prereg_before, prereg_after)
    if prereg_changed != list(range(711, 813)):
        raise AssertionError(
            f"unexpected bulk preregistration loop-row surface: {prereg_changed[:5]}...{prereg_changed[-5:]} count={len(prereg_changed)}"
        )

    current = json.loads((REPO / RULEBOOK_REL).read_text())
    current_orders = sorted(loop_map(current))
    if current_orders != list(range(577, 813)):
        raise AssertionError("current canonical rulebook is not contiguous 577-812")

    return {
        "schema_version": 1,
        "status": "PASS_WITH_RECORDED_HISTORICAL_EXCEPTION",
        "loop_definition": "One loop equals one parsed canonical rulebook semantic change.",
        "canonical_loop_range": [577, 812],
        "canonical_loop_count": 236,
        "ordered_campaign_loop_commit_count": len(ordered_commits),
        "ordered_campaign_commits": ordered_commits,
        "historical_bulk_preregistration": {
            "status": "RECORDED_PROTOCOL_EXCEPTION",
            "commit": prereg,
            "parent": prereg_parent,
            "subject": PREREG_SUBJECT,
            "semantic_rulebook_changed": True,
            "changed_loop_rows": prereg_changed,
            "explanation": "The runner inserted bridge rows 711-712 and PLANNED rows 713-812 in one semantic rulebook change before the 100 ordered closure commits. The final ledger and closure evidence are retained. Future campaign plans must remain outside the canonical rulebook until each individual semantic loop is committed.",
        },
        "earlier_history": {
            "loop_range": [577, 710],
            "mode": "SQUASHED_CANONICAL_LEDGER",
            "per_loop_git_subjects_required": False,
            "verification_basis": [
                "canonical TSPLoops rows",
                "historical loop-range certificates",
                "calibration canonical-ledger replay",
                "current consolidated Effortless/Postgres/peer replay"
            ]
        },
        "future_enforcement": {
            "semantic_commit_subject": "TSP loop <order>: <conceptual change>",
            "maximum_changed_loop_rows": 1,
            "bulk_planned_row_insertion_allowed": False,
            "code_only_loop_label_allowed": False
        }
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    report = audit()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
    print(
        json.dumps(
            {
                "status": report["status"],
                "canonical_loop_range": report["canonical_loop_range"],
                "ordered_campaign_loop_commit_count": report["ordered_campaign_loop_commit_count"],
                "preregistration_changed_loop_row_count": len(report["historical_bulk_preregistration"]["changed_loop_rows"]),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()

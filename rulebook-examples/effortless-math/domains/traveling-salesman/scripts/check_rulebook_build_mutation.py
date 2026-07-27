#!/usr/bin/env python3
"""Detect whether an Effortless build changed TSP rulebook semantics.

The transpiler may rewrite JSON presentation. Raw-byte changes are recorded, but
only a change to the parsed JSON object is a semantic mutation. A semantic
mutation fails unless an explicit future migration teaches this checker how to
accept and explain it.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any


def load_json(path: Path) -> Any:
    if not path.is_file():
        raise FileNotFoundError(f"missing required rulebook snapshot: {path}")
    return json.loads(path.read_text())


def raw_sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def semantic_bytes(path: Path) -> bytes:
    value = load_json(path)
    return json.dumps(
        value,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    ).encode("utf-8")


def semantic_sha256(path: Path) -> str:
    return hashlib.sha256(semantic_bytes(path)).hexdigest()


def snapshot(path: Path) -> dict[str, Any]:
    return {
        "path": path.as_posix(),
        "size_bytes": path.stat().st_size,
        "raw_sha256": raw_sha256(path),
        "semantic_sha256": semantic_sha256(path),
    }


def compare(before: Path, after: Path) -> dict[str, Any]:
    before_state = snapshot(before)
    after_state = snapshot(after)
    semantic_equal = (
        before_state["semantic_sha256"] == after_state["semantic_sha256"]
    )
    report = {
        "status": "PASS" if semantic_equal else "FAIL",
        "semantic_object_equal": semantic_equal,
        "raw_bytes_equal": before_state["raw_sha256"] == after_state["raw_sha256"],
        "before": before_state,
        "after": after_state,
        "explanation": (
            "The build preserved the parsed rulebook object. Any raw-byte change "
            "is presentation-only."
            if semantic_equal
            else "The build changed the parsed rulebook object. This is a semantic "
            "mutation and must be represented as a new canonical loop before it can "
            "be accepted."
        ),
    }
    return report


def write_report(path: Path | None, report: dict[str, Any]) -> None:
    if path is None:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--before", type=Path, required=True)
    parser.add_argument("--after", type=Path, required=True)
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()

    report = compare(args.before, args.after)
    write_report(args.report, report)
    print(json.dumps(report, indent=2, ensure_ascii=False))
    if report["status"] != "PASS":
        raise SystemExit(1)


if __name__ == "__main__":
    main()

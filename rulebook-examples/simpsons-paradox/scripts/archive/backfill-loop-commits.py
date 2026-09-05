#!/usr/bin/env python3
"""Record git commit provenance on Loops rows + Conclusion lookups for discovery replay."""
from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RB_PATH = ROOT / "effortless-rulebook" / "simpsons-paradox-rulebook.json"
RULEBOOK_GIT_PATH = "rulebook-examples/simpsons-paradox/effortless-rulebook/simpsons-paradox-rulebook.json"

MILESTONE_TAGS = {
    "b96e0fe": "sp-loop-milestone-01-loops-01-10",
    "29337f5": "sp-loop-milestone-02-loop-10-amend",
    "49f01e7": "sp-loop-milestone-03-loops-11-15",
    "ca31095": "sp-loop-milestone-04-loops-16-31",
    "a6e0725": "sp-loop-milestone-05-loops-23b-33",
    "5a14dcb": "sp-loop-milestone-06-loops-34-57",
    "4172aae": "sp-loop-milestone-07-loops-58-60",
    "7b3938e": "sp-loop-milestone-08-loop-61",
    "6118290": "sp-loop-milestone-09-schema-polish",
}


def compact_data_rows(rb: dict) -> str:
    pretty = json.dumps(rb, indent=2, ensure_ascii=False)
    lines = pretty.splitlines()
    out: list[str] = []
    in_data = False
    depth = 0
    buf: list[str] = []

    for line in lines:
        if re.match(r'^\s+"data": \[\s*$', line):
            in_data = True
            depth = 0
            buf = []
            out.append(line)
            continue
        if in_data:
            stripped = line.strip()
            if stripped == "{":
                buf = [stripped]
                depth = 1
            elif buf:
                buf.append(stripped)
                depth += stripped.count("{") - stripped.count("}")
                if depth <= 0 and buf:
                    row = " ".join(buf).rstrip(",")
                    out.append("      " + row + ",")
                    buf = []
            elif stripped.startswith("{"):
                row = stripped.rstrip(",")
                out.append("      " + row + ",")
            elif re.match(r"^\s+\],?\s*$", line):
                in_data = False
                if out and out[-1].endswith(","):
                    out[-1] = out[-1][:-1]
                out.append(line)
            continue
        out.append(line)
    return "\n".join(out) + "\n"


def insert_after(schema: list, after_name: str, new_fields: list) -> None:
    idx = next(i for i, f in enumerate(schema) if f["name"] == after_name)
    schema[idx + 1 : idx + 1] = new_fields


def git_loop_provenance() -> dict[str, dict[str, str]]:
    repo_root = subprocess.check_output(
        ["git", "-C", str(ROOT), "rev-parse", "--show-toplevel"], text=True
    ).strip()
    log = subprocess.check_output(
        ["git", "-C", repo_root, "log", "--format=%H", "--follow", "--", RULEBOOK_GIT_PATH],
        text=True,
    ).strip().split("\n")
    commits = [c for c in log if c]

    def load_loop_ids(commit: str) -> set[str]:
        content = subprocess.check_output(
            ["git", "-C", repo_root, "show", f"{commit}:{RULEBOOK_GIT_PATH}"], text=True
        )
        rb = json.loads(content)
        return {r["LoopId"] for r in rb.get("Loops", {}).get("data", [])}

    loop_first: dict[str, str] = {}
    prev: set[str] = set()
    for commit in reversed(commits):
        for loop_id in load_loop_ids(commit) - prev:
            loop_first[loop_id] = commit
        prev = load_loop_ids(commit)

    meta: dict[str, dict[str, str]] = {}
    for commit in commits:
        line = subprocess.check_output(
            ["git", "-C", repo_root, "show", "-s", "--format=%H|%h|%ci|%s", commit], text=True
        ).strip()
        full, short, date, subject = line.split("|", 3)
        meta[full] = {
            "CommitHash": full,
            "CommitDate": date[:10],
            "CommitMessage": subject,
            "GitTag": MILESTONE_TAGS.get(short, ""),
        }

    return {loop_id: meta[commit] for loop_id, commit in loop_first.items()}


def main() -> None:
    provenance = git_loop_provenance()
    rb = json.loads(RB_PATH.read_text())

    loop_commit_fields = [
        {
            "name": "CommitHash",
            "datatype": "string",
            "type": "raw",
            "nullable": True,
            "Description": "Full git SHA where this loop row first landed in effortless-rulebook.json — the replay anchor for this turn of the Effortless loop.",
        },
        {
            "name": "CommitShort",
            "datatype": "string",
            "type": "calculated",
            "nullable": True,
            "Description": "First 7 characters of CommitHash for display and git checkout.",
            "formula": "=LEFT({{CommitHash}}, 7)",
        },
        {
            "name": "CommitDate",
            "datatype": "string",
            "type": "raw",
            "nullable": True,
            "Description": "ISO date (YYYY-MM-DD) of the commit where this loop landed.",
        },
        {
            "name": "CommitMessage",
            "datatype": "string",
            "type": "raw",
            "nullable": True,
            "Description": "Git commit subject line for this loop's landing commit.",
        },
        {
            "name": "GitTag",
            "datatype": "string",
            "type": "raw",
            "nullable": True,
            "Description": "Optional milestone tag pointing at this loop's landing commit (sp-loop-milestone-*). Used for discovery replay without memorizing SHAs.",
        },
    ]
    loops_schema = rb["Loops"]["schema"]
    if not any(f["name"] == "CommitHash" for f in loops_schema):
        insert_after(loops_schema, "TraditionCoreConern", loop_commit_fields)

    for row in rb["Loops"]["data"]:
        loop_id = row["LoopId"]
        if loop_id in provenance:
            row.update(provenance[loop_id])

    conclusion_fields = [
        {
            "name": "WitnessedInLoopCommitHash",
            "datatype": "string",
            "type": "lookup",
            "nullable": True,
            "Description": "Lookup: Loops.CommitHash via WitnessedInLoop — git checkout this SHA to replay the instrument state when this conclusion was first witnessed.",
            "formula": "=LOOKUP({{WitnessedInLoop}}, Loops[LoopId], Loops[CommitHash])",
        },
        {
            "name": "WitnessedInLoopCommitShort",
            "datatype": "string",
            "type": "lookup",
            "nullable": True,
            "Description": "Lookup: Loops.CommitShort via WitnessedInLoop.",
            "formula": "=LOOKUP({{WitnessedInLoop}}, Loops[LoopId], Loops[CommitShort])",
        },
        {
            "name": "WitnessedInLoopCommitDate",
            "datatype": "string",
            "type": "lookup",
            "nullable": True,
            "Description": "Lookup: Loops.CommitDate via WitnessedInLoop.",
            "formula": "=LOOKUP({{WitnessedInLoop}}, Loops[LoopId], Loops[CommitDate])",
        },
        {
            "name": "WitnessedInLoopGitTag",
            "datatype": "string",
            "type": "lookup",
            "nullable": True,
            "Description": "Lookup: Loops.GitTag via WitnessedInLoop — preferred replay entry point when a milestone tag exists.",
            "formula": "=LOOKUP({{WitnessedInLoop}}, Loops[LoopId], Loops[GitTag])",
        },
    ]
    conc_schema = rb["Conclusions"]["schema"]
    if not any(f["name"] == "WitnessedInLoopCommitHash" for f in conc_schema):
        insert_after(conc_schema, "WitnessedInLoopTitle", conclusion_fields)

    RB_PATH.write_text(compact_data_rows(rb))
    print(f"Updated {RB_PATH.name}: {len(provenance)} loops with commit provenance")


if __name__ == "__main__":
    main()

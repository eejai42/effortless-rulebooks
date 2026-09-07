#!/usr/bin/env python3
"""
Cross-Domain Build Report Generator
===================================
Reads orchestration/build-status/logs/<domain>.log (one per demo, written by
build-all-domains.sh) and emits:

  - orchestration/build-status/summary.json — machine-readable row per domain
  - orchestration/build-status/REPORT.md    — human/agent-readable triage

This file is the "categorize a raw build log into a root cause" logic for the
orchestration layer. It is intentionally separate from the bash driver so an
agent can re-render the report from existing logs without re-building (and so
the categorization heuristics can be unit-tested if/when we add tests).

Categories:
  PASS    — log has no failure markers
  PARSER  — `Formula recomputation FAILED` in log; we extract the missing
            ops + functions cited in the failure listing
  CONFIG  — substrate referenced but not registered in ProjectTranspilers,
            or other config-level mismatch
  OTHER   — a Traceback / Error: appears but doesn't match the above shapes
"""

from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
EXAMPLES_DIR = PROJECT_ROOT / "rulebook-examples"
STATUS_DIR = SCRIPT_DIR / "build-status"
LOGS_DIR = STATUS_DIR / "logs"
SUMMARY_JSON = STATUS_DIR / "summary.json"
REPORT_MD = STATUS_DIR / "REPORT.md"

ANSI_RE = re.compile(r"\x1b\[[0-9;]*m")


@dataclass
class DomainRow:
    domain: str
    status: str          # PASS | PARSER | CONFIG | OTHER | NO_LOG
    root_cause: str      # short human-readable summary
    first_error: str     # first stripped error-ish line from the log
    missing_ops: list    # for PARSER: list of operator characters
    missing_funcs: list  # for PARSER: list of function names
    log_path: str        # repo-relative path to the log (or "")


# -----------------------------------------------------------------------------
# Categorization
# -----------------------------------------------------------------------------
def list_domains() -> list[str]:
    return sorted(p.name for p in EXAMPLES_DIR.iterdir() if p.is_dir())


def classify(log_path: Path) -> DomainRow:
    domain = log_path.stem
    if not log_path.exists():
        return DomainRow(
            domain=domain, status="NO_LOG",
            root_cause="No log on disk — run build-all-domains.sh --domain " + domain,
            first_error="", missing_ops=[], missing_funcs=[], log_path="",
        )

    text = log_path.read_text(errors="replace")
    text_clean = ANSI_RE.sub("", text)

    has_traceback = "Traceback (most recent call last)" in text_clean
    has_failed = bool(re.search(r"✗ .* FAILED", text_clean))
    has_error  = "Error:" in text_clean
    has_recompute_fail = "Formula recomputation FAILED" in text_clean
    has_config = "not found in ProjectTranspilers" in text_clean

    rel_log = log_path.relative_to(PROJECT_ROOT).as_posix()

    if not (has_traceback or has_failed or has_error or has_recompute_fail or has_config):
        return DomainRow(
            domain=domain, status="PASS", root_cause="",
            first_error="", missing_ops=[], missing_funcs=[], log_path=rel_log,
        )

    first_error = ""
    for line in text_clean.splitlines():
        if re.search(r"(Traceback|FATAL|RuntimeError|✗ .* FAILED|Error:|^raise )", line):
            first_error = line.strip()[:240]
            break

    if has_recompute_fail:
        ops = sorted({m for m in re.findall(r"Unexpected character '([^']+)'", text_clean)})
        funcs = sorted({m for m in re.findall(r"Unknown function: ([A-Z_]+)", text_clean)})
        bits = []
        if ops:
            bits.append("ops: " + ",".join(ops))
        if funcs:
            bits.append("fns: " + ",".join(funcs))
        return DomainRow(
            domain=domain, status="PARSER",
            root_cause=" | ".join(bits) if bits else "Formula recomputation failed",
            first_error=first_error, missing_ops=ops, missing_funcs=funcs,
            log_path=rel_log,
        )

    if has_config:
        m = re.search(r"Transpiler '([^']+)' not found in ProjectTranspilers", text_clean)
        which = m.group(1) if m else "(unknown)"
        return DomainRow(
            domain=domain, status="CONFIG",
            root_cause=f"transpiler '{which}' missing from ProjectTranspilers in effortless.json",
            first_error=first_error, missing_ops=[], missing_funcs=[],
            log_path=rel_log,
        )

    return DomainRow(
        domain=domain, status="OTHER",
        root_cause=first_error or "Traceback or error in log; no specific pattern matched",
        first_error=first_error, missing_ops=[], missing_funcs=[],
        log_path=rel_log,
    )


# -----------------------------------------------------------------------------
# Rendering
# -----------------------------------------------------------------------------
def render_markdown(rows: list[DomainRow], generated_at: str) -> str:
    counts = {"PASS": 0, "PARSER": 0, "CONFIG": 0, "OTHER": 0, "NO_LOG": 0}
    for r in rows:
        counts[r.status] = counts.get(r.status, 0) + 1

    lines = []
    a = lines.append
    a("# Cross-Domain Build Status")
    a("")
    a(f"_Generated {generated_at} by `orchestration/build-status-report.py`._")
    a("")
    a("This file is auto-generated. To refresh:")
    a("")
    a("```")
    a("bash orchestration/build-all-domains.sh                 # rebuild everything")
    a("bash orchestration/build-all-domains.sh --missing       # only new demos")
    a("bash orchestration/build-all-domains.sh --failing       # only what's broken")
    a("bash orchestration/build-all-domains.sh --domain NAME   # one demo")
    a("bash orchestration/build-all-domains.sh --report-only   # re-render from existing logs")
    a("```")
    a("")
    a(f"**Totals:** {counts['PASS']} PASS · {counts['PARSER']} PARSER · "
      f"{counts['CONFIG']} CONFIG · {counts['OTHER']} OTHER · {counts['NO_LOG']} NO_LOG  "
      f"_(of {len(rows)} demos in rulebook-examples/)_")
    a("")
    a("## Status by domain")
    a("")
    a("| Status  | Domain | Root cause | Log |")
    a("| ------- | ------ | ---------- | --- |")
    for r in rows:
        log_cell = f"[log]({r.log_path})" if r.log_path else "—"
        cause = (r.root_cause or "").replace("|", "\\|")
        a(f"| {r.status:<7} | `{r.domain}` | {cause} | {log_cell} |")
    a("")

    # PARSER aggregate so agents see the union of missing ops/fns across all
    # demos at a glance — useful for "fix once, unblock many" planning.
    parser_rows = [r for r in rows if r.status == "PARSER"]
    if parser_rows:
        all_ops = sorted({op for r in parser_rows for op in r.missing_ops})
        all_funcs = sorted({fn for r in parser_rows for fn in r.missing_funcs})
        a("## Aggregate gaps (PARSER demos)")
        a("")
        a(f"- Operators referenced but not handled by `orchestration/formula_parser.py`: "
          + (", ".join(f"`{op}`" for op in all_ops) if all_ops else "—"))
        a(f"- Functions referenced but not handled: "
          + (", ".join(f"`{fn}`" for fn in all_funcs) if all_funcs else "—"))
        a("")
        a("Fixing these in `formula_parser.py` (canonical evaluator) unblocks "
          "answer-key generation. Substrate-side `compile_to_*` functions may "
          "also need matching updates depending on which substrates each demo "
          "actually exercises.")
        a("")

    a("## Conventions")
    a("")
    a("- `PASS` — orchestrator ran end-to-end with no Traceback / FATAL / "
      "RuntimeError / `✗ FAILED` / `Error:` / explicit `raise` in the log. "
      "Conformance score may still be < 100% — that's a substrate gap, not a "
      "build error.")
    a("- `PARSER` — STEP 1 (answer-key generation) raised "
      "`Formula recomputation FAILED`. The `Root cause` column shows which "
      "operator characters and function names the canonical evaluator did "
      "not recognize.")
    a("- `CONFIG` — a transpiler was invoked but isn't listed in that demo's "
      "`effortless.json` `ProjectTranspilers`.")
    a("- `OTHER` — failure pattern outside the categories above; check the log.")
    a("- `NO_LOG` — no log on disk yet for this demo.")
    return "\n".join(lines) + "\n"


def main() -> int:
    STATUS_DIR.mkdir(parents=True, exist_ok=True)
    LOGS_DIR.mkdir(parents=True, exist_ok=True)

    rows = [classify(LOGS_DIR / f"{d}.log") for d in list_domains()]
    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    summary = {
        "generated_at": generated_at,
        "totals": {
            "PASS":   sum(1 for r in rows if r.status == "PASS"),
            "PARSER": sum(1 for r in rows if r.status == "PARSER"),
            "CONFIG": sum(1 for r in rows if r.status == "CONFIG"),
            "OTHER":  sum(1 for r in rows if r.status == "OTHER"),
            "NO_LOG": sum(1 for r in rows if r.status == "NO_LOG"),
        },
        "domains": [asdict(r) for r in rows],
    }
    SUMMARY_JSON.write_text(json.dumps(summary, indent=2) + "\n")
    REPORT_MD.write_text(render_markdown(rows, generated_at))

    print(f"  wrote {SUMMARY_JSON.relative_to(PROJECT_ROOT)}")
    print(f"  wrote {REPORT_MD.relative_to(PROJECT_ROOT)}")
    print(f"  {summary['totals']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""Run the cumulative TSP validation and replay surface.

Historical validators remain useful witnesses for the semantic layers they were
written to protect. They are all replayed against the current cumulative
rulebook rather than bypassed when a newer campaign is present.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

from validate_rulebook_v3_temporal import main as validate_v3
from validate_rulebook_v5_temporal import main as validate_v5
from validate_rulebook_v6 import validate_repository_state as validate_v6
from validate_summary_alignment_v6 import validate_summary_alignment as validate_summary_v6
from validate_rulebook_v7 import validate_repository_state as validate_v7
from validate_summary_alignment_v7 import validate_summary_alignment as validate_summary_v7

HERE = Path(__file__).resolve().parent
DOMAIN = HERE.parent
RULEBOOK = DOMAIN / "effortless-rulebook" / "traveling-salesman-rulebook.json"
CALIBRATION_STATUS = DOMAIN / "testing" / "calibration-647-710-status.json"
CALIBRATION_VERIFIED = DOMAIN / "testing" / "calibration-647-710-verified.json"
CALIBRATION_VERIFIER = HERE / "verify_calibration_647_710.py"
CAMPAIGN_DRIVER = HERE / "campaign_713_812.py"
HISTORY_AUDITOR = HERE / "audit_loop_history.py"
HISTORY_AUDIT = DOMAIN / "testing" / "consolidation" / "loop-history-audit.json"
CONSOLIDATION_VALIDATOR = HERE / "validate_consolidation.py"
DOCUMENTATION_VALIDATOR = HERE / "validate_documentation_alignment.py"
BRIDGE_711 = HERE / "benchmark_gr17_loop_711.py"
BRIDGE_712 = HERE / "verify_loop_712_gr21.py"


def load_json(path: Path) -> dict:
    if not path.is_file():
        raise FileNotFoundError(f"missing required validation artifact: {path}")
    return json.loads(path.read_text())


def run(*command: str) -> None:
    subprocess.run(command, check=True)


def validate_calibration_certificate_read_only() -> None:
    status = load_json(CALIBRATION_STATUS)
    if status.get("status") != "SUCCEEDED" or int(status.get("last_loop", 0)) != 710:
        raise AssertionError(f"calibration 647-710 is not closed: {status!r}")
    before = CALIBRATION_VERIFIED.read_bytes() if CALIBRATION_VERIFIED.is_file() else None
    try:
        run(sys.executable, str(CALIBRATION_VERIFIER))
        after = CALIBRATION_VERIFIED.read_bytes()
        if before is None:
            raise AssertionError(
                "calibration verifier produced an uncommitted certificate; commit the replay result"
            )
        if after != before:
            raise AssertionError(
                "calibration certificate is stale; regenerate and commit it before validation"
            )
    finally:
        if before is None:
            CALIBRATION_VERIFIED.unlink(missing_ok=True)
        else:
            CALIBRATION_VERIFIED.write_bytes(before)


def validate_history_audit_read_only() -> None:
    expected = load_json(HISTORY_AUDIT)
    with tempfile.TemporaryDirectory(prefix="tsp-history-audit-") as directory:
        output = Path(directory) / "loop-history-audit.json"
        run(sys.executable, str(HISTORY_AUDITOR), "--output", str(output))
        actual = load_json(output)
    if actual != expected:
        raise AssertionError(
            "the committed loop-history audit is stale relative to Git and the canonical rulebook"
        )


def validate_legacy_layers() -> None:
    validate_v3()
    validate_v5()
    validate_v6()
    validate_summary_v6()
    validate_v7()
    validate_summary_v7()
    validate_calibration_certificate_read_only()


def validate_current_campaigns() -> None:
    run(sys.executable, str(CAMPAIGN_DRIVER), "--validate")
    run(sys.executable, str(BRIDGE_711))
    run(sys.executable, str(BRIDGE_712))


def validate_current_state(
    *, require_build_certificate: bool, include_readmes: bool
) -> None:
    command = [sys.executable, str(CONSOLIDATION_VALIDATOR), "--require-history-audit"]
    if require_build_certificate:
        command.append("--require-build-certificate")
    run(*command)

    documentation = [sys.executable, str(DOCUMENTATION_VALIDATOR)]
    if include_readmes:
        documentation.append("--include-readmes")
    run(*documentation)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--require-build-certificate", action="store_true")
    parser.add_argument("--include-readmes", action="store_true")
    args = parser.parse_args()

    # Parsed JSON validity is a precondition, not a separate trust surface.
    load_json(RULEBOOK)
    validate_legacy_layers()
    validate_current_campaigns()
    validate_history_audit_read_only()
    validate_current_state(
        require_build_certificate=args.require_build_certificate,
        include_readmes=args.include_readmes,
    )
    print(
        "traveling-salesman cumulative validation: PASS "
        f"(build_certificate={'required' if args.require_build_certificate else 'deferred'}, "
        f"readmes={'included' if args.include_readmes else 'deferred'})"
    )


if __name__ == "__main__":
    main()

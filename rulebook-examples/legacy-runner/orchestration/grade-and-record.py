#!/usr/bin/env python3
"""
grade-and-record.py
==============================================================================
Grade a single substrate's test-answers against the shared answer keys, then
update _run_metadata.json and regenerate test-results.md + substrate-report.html.

Lets each substrate's take-test.sh produce a complete, up-to-date result on its
own — without requiring a full orchestrator run. Mirrors the per-substrate
grading block in orchestrate.sh.

Usage:
    grade-and-record.py <substrate_name> [--elapsed <seconds>] [--success|--failed]
                                         [--error <msg>] [--log <log_file>]
==============================================================================
"""

import argparse
import glob
import json
import os
import subprocess
import sys
from importlib.machinery import SourceFileLoader
from importlib.util import module_from_spec, spec_from_loader
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = SCRIPT_DIR.parent


def load_test_orchestrator():
    spec = spec_from_loader(
        'test_orchestrator',
        SourceFileLoader('test_orchestrator', str(SCRIPT_DIR / 'test-orchestrator.py')),
    )
    mod = module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('substrate')
    parser.add_argument('--elapsed', type=float, default=-1.0,
                        help='Seconds the substrate took to run. Omit (or pass a '
                             'negative value) to preserve the previously-recorded '
                             'timing — useful for re-grading without re-running.')
    parser.add_argument('--success', dest='success', action='store_true', default=True)
    parser.add_argument('--failed', dest='success', action='store_false')
    parser.add_argument('--error', default=None)
    parser.add_argument('--log', default=None,
                        help='Optional path to captured log for substrate-report.html')
    args = parser.parse_args()

    test_orch = load_test_orchestrator()

    substrate_dir = Path(test_orch.SUBSTRATES_DIR) / args.substrate
    if not substrate_dir.is_dir():
        print(f"Error: substrate '{args.substrate}' not found at {substrate_dir}")
        sys.exit(1)

    # Load answer keys (must already exist — produced by full orchestrator run)
    all_answer_keys = {}
    for entity_file in glob.glob(os.path.join(test_orch.ANSWER_KEYS_DIR, '*.json')):
        entity = os.path.basename(entity_file).replace('.json', '')
        with open(entity_file, 'r') as f:
            all_answer_keys[entity] = json.load(f)

    if not all_answer_keys:
        print(f"Error: no answer keys in {test_orch.ANSWER_KEYS_DIR}.")
        print("Run the full orchestrator once to generate them.")
        sys.exit(1)

    rulebook = test_orch.load_rulebook()

    grades = test_orch.grade_substrate(args.substrate, all_answer_keys, rulebook)

    # If the caller didn't supply a real elapsed time, preserve whatever timing
    # was already on record so a regrade-without-rerun doesn't wipe the dashboard.
    if args.elapsed < 0:
        prev = test_orch.load_run_metadata(args.substrate)
        prev_last = prev.get('last_run') or {}
        prev_success = prev.get('last_successful_run') or {}
        grades['elapsed_seconds'] = (
            prev_last.get('duration_seconds')
            or prev_success.get('duration_seconds')
            or 0.0
        )
    else:
        grades['elapsed_seconds'] = args.elapsed

    if not args.success and args.error:
        grades['error'] = args.error
        grades['execution_failed'] = True

    test_orch.update_run_metadata(
        args.substrate, grades, args.success, args.error, preserve_timing=False,
    )
    test_orch.generate_substrate_report(args.substrate, grades, rulebook)
    test_orch.print_substrate_test_summary(args.substrate, grades, rulebook)

    # Regenerate substrate-report.html — prefer the substrate's own script
    # if present, otherwise the generic one.
    custom = substrate_dir / 'create-substrate-report.sh'
    generic = SCRIPT_DIR / 'create-substrate-report.py'
    if custom.exists():
        subprocess.run(['bash', str(custom)], cwd=substrate_dir)
    elif generic.exists():
        cmd = ['python3', str(generic), args.substrate]
        if args.log:
            cmd += ['--log', args.log]
        subprocess.run(cmd)

    # Pop the fresh report unless suppressed (ERB_NO_OPEN=1 used by orchestrate.sh
    # when iterating many substrates — it opens the aggregate report at the end).
    if not os.environ.get('ERB_NO_OPEN'):
        report = substrate_dir / 'substrate-report.html'
        if report.exists():
            if sys.platform == 'darwin':
                subprocess.run(['open', str(report)], check=False)
            elif sys.platform.startswith('linux'):
                subprocess.run(['xdg-open', str(report)], check=False)
            elif sys.platform == 'win32':
                os.startfile(str(report))  # type: ignore[attr-defined]


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
Central orchestrator for ERB substrate generation.

This script can invoke all generators or specific ones by name.
Individual generators are typically invoked directly via ssotme -build,
but this orchestrator can be used for batch operations or testing.

Usage:
    python substrate-orchestrator.py                  # Run all generators
    python substrate-orchestrator.py python owl       # Run specific generators
    python substrate-orchestrator.py --list           # List available generators
"""

import subprocess
import sys
from pathlib import Path

# Substrates that have inject-into-{name}.py scripts
GENERATORS = [
    "python",
    "english",
    "golang",
    "binary",
    "csv",
    "uml",
    "owl",
    "xlsx",
    "explain-dag",
]


def get_orchestration_dir():
    """Get the orchestration directory path."""
    return Path(__file__).parent


def get_project_root():
    """Get the project root directory."""
    return get_orchestration_dir().parent


def run_generator(name):
    """Run a single generator by name."""
    project_root = get_project_root()

    # Injection scripts are located in execution-substrates/{name}/inject-into-{name}.py
    substrate_dir = project_root / "execution-substrates" / name
    script_path = substrate_dir / f"inject-into-{name}.py"

    if not script_path.exists():
        print(f"Error: Generator script not found: {script_path}")
        return False

    # Run the generator from the substrate directory
    print(f"\n{'='*60}")
    print(f"Running: inject-into-{name}.py")
    print(f"Working dir: {substrate_dir}")
    print(f"{'='*60}")

    result = subprocess.run(
        [sys.executable, str(script_path)],
        cwd=str(substrate_dir),
        capture_output=False,
    )

    return result.returncode == 0


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--list":
        print("Available generators:")
        for name in GENERATORS:
            print(f"  - {name}")
        return

    # Determine which generators to run
    if len(sys.argv) > 1:
        targets = sys.argv[1:]
        for target in targets:
            if target not in GENERATORS:
                print(f"Unknown generator: {target}")
                print(f"Available: {', '.join(GENERATORS)}")
                sys.exit(1)
    else:
        targets = GENERATORS

    # Run the generators
    results = {}
    for name in targets:
        success = run_generator(name)
        results[name] = success

    # Summary
    print(f"\n{'='*60}")
    print("Summary:")
    print(f"{'='*60}")
    for name, success in results.items():
        status = "OK" if success else "FAILED"
        print(f"  {name}: {status}")

    failed = [name for name, success in results.items() if not success]
    if failed:
        print(f"\nFailed: {', '.join(failed)}")
        sys.exit(1)
    else:
        print("\nAll generators completed successfully.")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Central orchestrator for ERB substrate generation.

This script auto-discovers substrates by scanning execution-substrates/.
Any folder with an inject-into-{name}.py script is automatically included.

Usage:
    python substrate-orchestrator.py                  # Run all generators
    python substrate-orchestrator.py python owl       # Run specific generators
    python substrate-orchestrator.py --list           # List available generators
"""

import subprocess
import sys
from pathlib import Path


def get_orchestration_dir():
    """Get the orchestration directory path."""
    return Path(__file__).parent


def get_project_root():
    """Get the project root directory."""
    return get_orchestration_dir().parent


def discover_generators():
    """Auto-discover substrates that have inject-into-{name}.py scripts."""
    substrates_dir = get_project_root() / "execution-substrates"
    generators = []

    for substrate_dir in sorted(substrates_dir.iterdir()):
        if not substrate_dir.is_dir():
            continue
        name = substrate_dir.name
        inject_script = substrate_dir / f"inject-into-{name}.py"
        if inject_script.exists():
            generators.append(name)

    return generators


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
    available = discover_generators()

    if len(sys.argv) > 1 and sys.argv[1] == "--list":
        print("Available generators (auto-discovered):")
        for name in available:
            print(f"  - {name}")
        return

    # Determine which generators to run
    if len(sys.argv) > 1:
        targets = sys.argv[1:]
        for target in targets:
            if target not in available:
                print(f"Unknown generator: {target}")
                print(f"Available: {', '.join(available)}")
                sys.exit(1)
    else:
        targets = available

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

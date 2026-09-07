#!/usr/bin/env python3
"""
YAML Substrate Clean Script

The YAML substrate doesn't have its own injector (it uses the shared Python
erb_calc.py), but it does produce generated test output files.

Usage:
    python3 clean.py --clean
"""

import sys
from pathlib import Path

# Add project root to path for shared imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from orchestration.shared import handle_clean_arg

# Define generated files for this substrate
GENERATED_FILES = [
    'test-answers.json',
    'test-results.md',
]


def main():
    if '--clean' in sys.argv:
        if handle_clean_arg(GENERATED_FILES, "YAML substrate: Removes test outputs (no code generation - uses shared erb_calc.py)"):
            return
    else:
        print("YAML substrate clean script")
        print("Usage: python3 clean.py --clean")
        print()
        print("Files that will be removed:")
        for f in GENERATED_FILES:
            print(f"  - {f}")


if __name__ == "__main__":
    main()

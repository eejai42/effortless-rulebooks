#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Regenerate erb_calc.py from rulebook (used by Python and YAML substrates)
echo "=== Regenerating erb_calc.py from rulebook ==="
python3 inject-into-python.py

# Run the test for this substrate
"$SCRIPT_DIR/take-test.sh"

#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Regenerate python_only_erb_simulator.py from rulebook (Python substrate only).
echo "=== Regenerating python_only_erb_simulator.py from rulebook ==="
python3 inject-into-python.py

# Run the test for this substrate
"$SCRIPT_DIR/take-test.sh"

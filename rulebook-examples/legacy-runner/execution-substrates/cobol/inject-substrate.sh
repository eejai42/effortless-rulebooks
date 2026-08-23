#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Regenerate COBOL from rulebook (this substrate is fully self-contained;
# it does NOT depend on the Python simulator at runtime).
echo "=== Regenerating COBOL from rulebook ==="
python3 inject-into-cobol.py

# Run the test for this substrate (executes the compiled COBOL).
"$SCRIPT_DIR/take-test.sh"

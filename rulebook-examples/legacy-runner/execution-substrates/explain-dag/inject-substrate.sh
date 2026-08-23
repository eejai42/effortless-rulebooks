#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Generate explain_spec.json from rulebook
echo "=== Generating ExplainDAG specification from rulebook ==="
python3 inject-into-explain-dag.py

# Run the test for this substrate
"$SCRIPT_DIR/take-test.sh"

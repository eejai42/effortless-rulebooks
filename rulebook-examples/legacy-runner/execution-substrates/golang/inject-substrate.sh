#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Regenerate erb_sdk.go from rulebook
echo "=== Regenerating erb_sdk.go from rulebook ==="
python3 inject-into-golang.py

# Run the test for this substrate
"$SCRIPT_DIR/take-test.sh"

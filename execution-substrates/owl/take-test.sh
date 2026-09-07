#!/bin/bash

# take-test.sh for owl execution substrate
# Executes the SHACL reasoner to compute derived values
#
# Reads from shared testing/blank-tests/ and writes to local test-answers/

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_FILE="$SCRIPT_DIR/.last-run.log"

# Ensure test-answers directory exists
mkdir -p "$SCRIPT_DIR/test-answers"

# Run OWL substrate (reads from shared testing/blank-tests/)
# Capture output for the substrate report
{
    echo "=== OWL/SHACL Substrate Test Run ==="
    echo ""
    python3 "$SCRIPT_DIR/take-test.py"
    echo ""
} 2>&1 | tee "$LOG_FILE"

echo "owl: test completed"

# Generate substrate report
python3 "$PROJECT_ROOT/orchestration/grade-and-record.py" owl --elapsed "$SECONDS" --log "$LOG_FILE"

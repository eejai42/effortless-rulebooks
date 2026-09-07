#!/bin/bash

# take-test.sh for yaml execution substrate
# Executes the YAML schema deterministically using Python
#
# Reads from shared testing/blank-tests/ and writes to local test-answers/

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_FILE="$SCRIPT_DIR/.last-run.log"

# Ensure test-answers directory exists
mkdir -p "$SCRIPT_DIR/test-answers"

# Run YAML substrate (reads from shared testing/blank-tests/)
# Capture output for the substrate report
{
    echo "=== YAML Substrate Test Run ==="
    echo ""
    python3 "$SCRIPT_DIR/take-test.py"
    echo ""
} 2>&1 | tee "$LOG_FILE"

echo "yaml: test completed"

# Generate substrate report
python3 "$PROJECT_ROOT/orchestration/grade-and-record.py" yaml --elapsed "$SECONDS" --log "$LOG_FILE"

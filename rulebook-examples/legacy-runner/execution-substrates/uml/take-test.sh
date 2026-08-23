#!/bin/bash

# take-test.sh for UML execution substrate
# Executes OCL-based computation to produce test answers
#
# Reads from shared testing/blank-tests/ and writes to local test-answers/

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_FILE="$SCRIPT_DIR/.last-run.log"

# Ensure test-answers directory exists
mkdir -p "$SCRIPT_DIR/test-answers"

# Run UML substrate (reads from shared testing/blank-tests/)
# Capture output for the substrate report
{
    echo "=== UML/OCL Substrate Test Run ==="
    echo ""
    python3 "$SCRIPT_DIR/take-test.py"
    echo ""
} 2>&1 | tee "$LOG_FILE"

echo "uml: test completed"

# Generate substrate report
python3 "$PROJECT_ROOT/orchestration/grade-and-record.py" uml --elapsed "$SECONDS" --log "$LOG_FILE"

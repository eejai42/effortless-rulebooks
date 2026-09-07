#!/bin/bash

# take-test.sh for xlsx execution substrate
# This script reads the xlsx file and produces test answers
#
# Reads from shared testing/blank-tests/ and writes to local test-answers/

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_FILE="$SCRIPT_DIR/.last-run.log"
cd "$SCRIPT_DIR"

# Ensure test-answers directory exists
mkdir -p "$SCRIPT_DIR/test-answers"

# Run Python script (reads from shared testing/blank-tests/)
# Capture output for the substrate report
{
    echo "=== XLSX (Excel) Substrate Test Run ==="
    echo ""
    python3 take-test.py
    echo ""
} 2>&1 | tee "$LOG_FILE"

echo "xlsx: test completed"

# Generate substrate report
python3 "$PROJECT_ROOT/orchestration/grade-and-record.py" xlsx --elapsed "$SECONDS" --log "$LOG_FILE"

#!/bin/bash
set -e
set -o pipefail

# take-test.sh for COBOL execution substrate
# Runs the compiled COBOL programs (via take-test.py) against the shared
# blank-test inputs and writes test-answers/. Only the entity COBOL was
# generated for is processed; the others are intentionally skipped, and the
# grader counts those skips as failures. (Audit fix 2026-05-12: removed the
# stale claim that this script "uses the shared Python erb_calc".)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_FILE="$SCRIPT_DIR/.last-run.log"
cd "$SCRIPT_DIR"

{
    echo "=== COBOL Substrate Test Run ==="
    echo ""

    mkdir -p "$SCRIPT_DIR/test-answers"
    echo "cobol: running compiled COBOL via take-test.py..."
    python3 "$SCRIPT_DIR/take-test.py"
    echo ""
} 2>&1 | tee "$LOG_FILE"

echo "cobol: test completed successfully"

# Generate substrate report
python3 "$PROJECT_ROOT/orchestration/grade-and-record.py" cobol --elapsed "$SECONDS" --log "$LOG_FILE"

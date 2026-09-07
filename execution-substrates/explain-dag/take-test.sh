#!/bin/bash

# take-test.sh for explain-dag execution substrate
# Evaluates formulas and produces derivation explanations
#
# Reads from shared testing/blank-tests/ and writes to:
#   - test-answers/ (for grading)
#   - test-explanations/ (derivation DAGs)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_FILE="$SCRIPT_DIR/.last-run.log"

# Ensure output directories exist
mkdir -p "$SCRIPT_DIR/test-answers"
mkdir -p "$SCRIPT_DIR/test-explanations"

# Run ExplainDAG substrate
# Capture output for the substrate report
{
    echo "=== ExplainDAG Substrate Test Run ==="
    echo ""
    python3 "$SCRIPT_DIR/take-test.py"
    echo ""
} 2>&1 | tee "$LOG_FILE"

echo "explain-dag: test completed"

# Generate substrate report
python3 "$PROJECT_ROOT/orchestration/grade-and-record.py" explain-dag --elapsed "$SECONDS" --log "$LOG_FILE"

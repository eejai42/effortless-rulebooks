#!/bin/bash

# take-test.sh for english execution substrate
# Executes the English substrate using LLM to produce test answers
# NO PROMPTS - just runs. Prompting happens in orchestrate.sh for "Run ALL".

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_FILE="$SCRIPT_DIR/.last-run.log"
LAST_RUN_ANSWERS="$SCRIPT_DIR/.last-run-answers"

# Ensure test-answers directory exists
mkdir -p "$SCRIPT_DIR/test-answers"

# Run the test
{
    echo "=== English (LLM) Substrate Test Run ==="
    echo ""
    python3 "$SCRIPT_DIR/take-test.py" --no-confirm
    echo ""
} 2>&1 | tee "$LOG_FILE"

# Save successful answers for future skip/restore
if [[ $? -eq 0 ]]; then
    rm -rf "$LAST_RUN_ANSWERS"
    mkdir -p "$LAST_RUN_ANSWERS"
    cp -r "$SCRIPT_DIR/test-answers/"* "$LAST_RUN_ANSWERS/" 2>/dev/null || true
fi

echo "english: test completed"

# Generate substrate report
python3 "$PROJECT_ROOT/orchestration/grade-and-record.py" english --elapsed "$SECONDS" --log "$LOG_FILE"

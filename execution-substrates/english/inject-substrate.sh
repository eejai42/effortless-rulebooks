#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if orchestrator told us to skip (set when user chose not to run English during "Run ALL")
if [[ "${ENGLISH_SKIP_LLM:-}" == "true" ]]; then
    echo "english: Skipping LLM (user chose to skip during 'Run ALL')"

    # Restore previous answers if available
    if [[ -d "$SCRIPT_DIR/.last-run-answers" ]]; then
        rm -rf "$SCRIPT_DIR/test-answers"
        mkdir -p "$SCRIPT_DIR/test-answers"
        cp -r "$SCRIPT_DIR/.last-run-answers/"* "$SCRIPT_DIR/test-answers/" 2>/dev/null || true
        echo "english: Previous answers restored"
    fi

    echo "SUBSTRATE_SKIPPED_BUT_GRADE"
    exit 0
fi

# Otherwise, just run everything - no prompts!
# If the user selected English specifically, or said "yes" during Run ALL, we run.

echo "english: Generating specification via LLM..."
python3 "$SCRIPT_DIR/inject-into-english.py" --regenerate --no-prompt || {
    INJECT_EXIT_CODE=$?
    if [ "$INJECT_EXIT_CODE" != "2" ]; then
        echo "Error during injection (exit code $INJECT_EXIT_CODE)"
        exit $INJECT_EXIT_CODE
    fi
}

echo "english: Taking test via LLM..."
"$SCRIPT_DIR/take-test.sh"

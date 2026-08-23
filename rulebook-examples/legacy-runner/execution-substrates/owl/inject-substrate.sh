#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
cd "$SCRIPT_DIR"

# ERB_TESTING_DIR is required — defaulting to the repo's own testing dir
# silently uses the wrong domain.
if [ -z "$ERB_TESTING_DIR" ]; then
    echo "FATAL: ERB_TESTING_DIR is not set. inject-substrate.sh must be invoked" >&2
    echo "  by the orchestrator with ERB_TESTING_DIR pointing at the active" >&2
    echo "  domain's testing/ directory." >&2
    exit 1
fi
TESTING_BLANK_TESTS="$ERB_TESTING_DIR/blank-tests"
LOCAL_BLANK_TESTS="$SCRIPT_DIR/blank-tests"

if [ -d "$TESTING_BLANK_TESTS" ] && [ -n "$(ls -A "$TESTING_BLANK_TESTS" 2>/dev/null)" ]; then
    echo "owl: Copying blank-tests from testing directory..."
    rm -rf "$LOCAL_BLANK_TESTS"
    mkdir -p "$LOCAL_BLANK_TESTS"
    cp "$TESTING_BLANK_TESTS"/*.json "$LOCAL_BLANK_TESTS/" 2>/dev/null || true
fi

# Inject data into the owl substrate
python3 "$SCRIPT_DIR/inject-into-owl.py"

# Run the test for this substrate
"$SCRIPT_DIR/take-test.sh"

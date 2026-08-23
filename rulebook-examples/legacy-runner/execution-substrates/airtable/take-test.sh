#!/bin/bash
# take-test.sh for airtable substrate.
#
# Airtable IS the oracle — the rulebook it pulls becomes the answer key that
# every other substrate is graded against. So its own "test answers" are
# simply the canonical answer keys; grading is tautological and must score
# 100%.
#
# This script runs in STEP 2 of the orchestrator, AFTER
# generate_all_answer_keys() has produced testing/answer-keys/*.json from the
# freshly-synced rulebook. We copy those files into the substrate's
# test-answers/ directory so the grader compares like-for-like.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SUBSTRATE_NAME="$(basename "$SCRIPT_DIR")"
if [ -z "$ERB_TESTING_DIR" ]; then
    echo "FATAL: ERB_TESTING_DIR is not set. take-test.sh must be invoked by" >&2
    echo "  the orchestrator with ERB_TESTING_DIR pointing at the active" >&2
    echo "  domain's testing/ directory." >&2
    exit 1
fi
ANSWER_KEYS_DIR="$ERB_TESTING_DIR/answer-keys"
TEST_ANSWERS_DIR="$ERB_TESTING_DIR/$SUBSTRATE_NAME/test-answers"

echo "=== Airtable substrate: copying answer keys (oracle is its own reference) ==="

if [ ! -d "$ANSWER_KEYS_DIR" ]; then
    echo "FATAL: answer-keys not found at $ANSWER_KEYS_DIR" >&2
    echo "  Run orchestrate.sh so STEP 1 generates answer keys before this substrate." >&2
    exit 1
fi

mkdir -p "$TEST_ANSWERS_DIR"
# Wipe and repopulate so deleted entities don't linger as stale answer files.
rm -f "$TEST_ANSWERS_DIR"/*.json
cp "$ANSWER_KEYS_DIR"/*.json "$TEST_ANSWERS_DIR"/

count=$(ls "$TEST_ANSWERS_DIR"/*.json 2>/dev/null | wc -l | tr -d ' ')
echo "  ✓ airtable: copied $count answer-key files"

python3 "$PROJECT_ROOT/orchestration/grade-and-record.py" airtable --elapsed "$SECONDS"

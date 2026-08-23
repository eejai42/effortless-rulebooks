#!/bin/bash
set -e  # Exit immediately on ANY error - FAIL LOUDLY!
set -o pipefail  # Catch errors in pipes

# take-test.sh for PostgreSQL execution substrate
# Queries vw_* views to compute test answers from the database
#
# Reads from PostgreSQL views and writes to local test-answers/
#
# IMPORTANT: This script WILL fail loudly if:
#   - Database connection fails
#   - Views don't exist (run init-db.sh first)
#   - psycopg2 is not installed

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_FILE="$SCRIPT_DIR/.last-run.log"
cd "$SCRIPT_DIR"

# Capture output for the substrate report
{
    echo "=== PostgreSQL Substrate Test Run ==="
    echo ""

    echo "effortless-postgres: Starting test..."

    # Verify take-test.py exists
    if [[ ! -f "take-test.py" ]]; then
        echo "FATAL: take-test.py not found!" >&2
        exit 1
    fi

    # Ensure test-answers directory exists
    mkdir -p "$SCRIPT_DIR/test-answers"

    # Run the Python test runner
    echo "effortless-postgres: Connecting to database and querying views..."
    python3 take-test.py

    echo ""
} 2>&1 | tee "$LOG_FILE"

echo "effortless-postgres: test completed successfully"

# Generate substrate report
python3 "$PROJECT_ROOT/orchestration/grade-and-record.py" effortless-postgres --elapsed "$SECONDS" --log "$LOG_FILE"

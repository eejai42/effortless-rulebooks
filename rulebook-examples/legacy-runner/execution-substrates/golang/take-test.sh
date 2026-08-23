#!/bin/bash
set -e  # Exit immediately on ANY error - FAIL LOUDLY!
set -o pipefail  # Catch errors in pipes

# take-test.sh for golang execution substrate
# Runs the Go SDK to compute test answers
#
# GUARD: This substrate computes calculated, lookup, and aggregation fields
# using its own native engine: real Go code (`go run erb_sdk.go main.go`).
# It must NOT import python_only_erb_simulator or call any orchestration
# helper at runtime. As the only currently-honest non-Effortless substrate
# with full 14/14 coverage, it doubles as the canary: this script must keep
# passing even if `orchestration/shared.py` is removed entirely.
#
# Reads from shared testing/blank-tests/ and writes to local test-answers/
#
# IMPORTANT: This script WILL fail loudly if:
#   - Go compilation fails (type mismatches, syntax errors)
#   - Input files are missing
#   - Output cannot be written

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_FILE="$SCRIPT_DIR/.last-run.log"
cd "$SCRIPT_DIR"

# Capture output for the substrate report
{
    echo "=== Go Substrate Test Run ==="
    echo ""

    echo "golang: Starting test..."

    # Verify required source files exist
    if [[ ! -f "erb_sdk.go" ]]; then
        echo "FATAL: erb_sdk.go not found! Run inject-into-golang.py first." >&2
        exit 1
    fi

    if [[ ! -f "main.go" ]]; then
        echo "FATAL: main.go not found! Run inject-into-golang.py first." >&2
        exit 1
    fi

    # Ensure test-answers directory exists
    mkdir -p "$SCRIPT_DIR/test-answers"

    # Run Go test runner - compilation errors will cause immediate exit due to set -e
    echo "golang: Compiling and running..."
    go run erb_sdk.go main.go

    echo ""
} 2>&1 | tee "$LOG_FILE"

echo "golang: test completed successfully"

# Generate substrate report
python3 "$PROJECT_ROOT/orchestration/grade-and-record.py" golang --elapsed "$SECONDS" --log "$LOG_FILE"

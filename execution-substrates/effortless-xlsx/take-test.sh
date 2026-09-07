#!/bin/bash
set -e
set -o pipefail

# take-test.sh for effortless-xlsx execution substrate
# Reads the Effortless-generated workbook from
# licensed-effortless-tools/xlsx/ and emits test-answers/.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_FILE="$SCRIPT_DIR/.last-run.log"
cd "$SCRIPT_DIR"

mkdir -p "$SCRIPT_DIR/test-answers"

{
    echo "=== Effortless-XLSX Substrate Test Run ==="
    echo ""
    python3 take-test.py
    echo ""
} 2>&1 | tee "$LOG_FILE"

echo "effortless-xlsx: test completed"

python3 "$PROJECT_ROOT/orchestration/grade-and-record.py" effortless-xlsx --elapsed "$SECONDS" --log "$LOG_FILE"

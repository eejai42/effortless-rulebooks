#!/bin/bash
# Pull from Airtable, build all, and run orchestration
#
# Usage: ./pull.sh [--skip-orchestrate]
#
# This script:
#   1. Pulls the latest rulebook from Airtable (airtabletorulebook transpiler)
#   2. Runs buildall to regenerate all artifacts (effortless -buildall)
#   3. Runs orchestration to test all substrates (unless --skip-orchestrate)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

set -e

# Parse arguments
SKIP_ORCHESTRATE=false
for arg in "$@"; do
    case $arg in
        --skip-orchestrate)
            SKIP_ORCHESTRATE=true
            shift
            ;;
    esac
done

echo "=== Pulling from Airtable ==="
cd "$REPO_ROOT"
effortless airtabletorulebook

echo ""
echo "=== Running buildall ==="
"$SCRIPT_DIR/buildall.sh"

echo ""
if [ "$SKIP_ORCHESTRATE" = true ]; then
    echo "=== Skipping orchestration (--skip-orchestrate) ==="
else
    echo "=== Running orchestration ==="
    "$REPO_ROOT/orchestration/orchestrate.sh"
fi

echo ""
echo "=== Pull complete ==="

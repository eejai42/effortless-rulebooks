#!/usr/bin/env bash
# GENERATED compatibility entry point.
# reset-rulebook-db.sh is the canonical, explicitly destructive dev reset.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESET_SCRIPT="$SCRIPT_DIR/reset-rulebook-db.sh"

if [ ! -f "$RESET_SCRIPT" ]; then
  echo "init-db.sh compatibility error: reset-rulebook-db.sh was not generated" >&2
  exit 127
fi

exec bash "$RESET_SCRIPT" "$@"
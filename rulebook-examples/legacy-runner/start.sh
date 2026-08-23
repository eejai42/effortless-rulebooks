#!/bin/bash
# =============================================================================
# START.SH — ERB entry point
# =============================================================================
# Default behaviour: launches the CLI orchestrator menu (the original
# experience). The Web Admin Portal is a downstream tool reachable from
# inside the menu via [W], or directly via run-web-portal.sh / --portal.
#
# Flags:
#   --portal    Launch the Web Admin Portal instead of the CLI menu.
#   --ci        Pass through to orchestrator (non-interactive mode).
#   --no-open   Don't auto-open the browser (portal mode only).
#   --port=N    Override portal port (portal mode only).
# =============================================================================

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

MODE="cli"
PASSTHROUGH=()
for arg in "$@"; do
  case $arg in
    --portal) MODE="portal" ;;
    --cli)    MODE="cli" ;;
    --ci)     MODE="cli"; PASSTHROUGH+=("--ci") ;;
    *)        PASSTHROUGH+=("$arg") ;;
  esac
done

if [ "$MODE" = "portal" ]; then
  exec bash "$SCRIPT_DIR/run-web-portal.sh" "${PASSTHROUGH[@]}"
fi

exec bash "$SCRIPT_DIR/orchestration/orchestrate.sh" "${PASSTHROUGH[@]}"

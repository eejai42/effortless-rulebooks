#!/bin/bash
# =============================================================================
# ENSURE-ORCHESTRATOR.SH
# =============================================================================
# Guarantees the ssotme-proxy (the local "orchestrator" transpiler bus on
# localhost:4242) is running, so the repo-local http://localhost:4242/* tools
# this project depends on (rulebook-to-owl, postgres-calculated-to-rulebook,
# etc.) can be reached during `effortless build`.
#
# IDEMPOTENT: if the proxy already answers GET /ping it does nothing. Only when
# the port is silent does it boot the proxy in the background. It does NOT kill
# a healthy proxy (that would be the proxy's own start.sh restart behaviour,
# which we intentionally avoid here so a routine build is cheap when the bus is
# already up).
# =============================================================================
set -e

PORT=4242
# This script lives in <repo>/rulebook-examples/talismans-special-solutions/postgres-bootstrap,
# so the repo root is three levels up.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
PROXY_DIR="$REPO_ROOT/rulebook-examples/legacy-runner/ssotme-proxy"

ping_proxy() {
  python3 - "$PORT" <<'PY' 2>/dev/null
import sys, urllib.request
port = sys.argv[1]
try:
    urllib.request.urlopen(f"http://localhost:{port}/ping", timeout=2)
    sys.exit(0)
except Exception:
    sys.exit(1)
PY
}

if ping_proxy; then
  echo "[ensure-orchestrator] ssotme-proxy already live on :$PORT"
  exit 0
fi

echo "[ensure-orchestrator] ssotme-proxy not responding on :$PORT — booting it"
if [ ! -f "$PROXY_DIR/server.py" ]; then
  echo "[ensure-orchestrator] ERROR: $PROXY_DIR/server.py not found" >&2
  exit 1
fi

# Boot detached so the build can proceed; log next to the proxy.
nohup python3 "$PROXY_DIR/server.py" >"$PROXY_DIR/.proxy.log" 2>&1 &

# Wait (up to ~10s) for it to come online; fail loudly if it never does.
for _ in $(seq 1 20); do
  if ping_proxy; then
    echo "[ensure-orchestrator] ssotme-proxy is up on :$PORT"
    exit 0
  fi
  sleep 0.5
done

echo "[ensure-orchestrator] ERROR: ssotme-proxy failed to come online on :$PORT (see $PROXY_DIR/.proxy.log)" >&2
exit 1

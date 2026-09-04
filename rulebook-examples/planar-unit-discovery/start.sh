#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

PROJECT_NAME='planar-unit-discovery'
EXPERIENCE_DESCRIPTION='Authoritative planar unit-distance discovery rulebook'
START_COMMAND='./start.sh'
PORT=43103
PRIMARY_URL="http://localhost:${PORT}/planar-unit-discovery-rulebook.json"
HEALTH_URL="$PRIMARY_URL"
SERVE_DIR="$PROJECT_ROOT/effortless-rulebook"
REQUIRED_FILE="$SERVE_DIR/planar-unit-discovery-rulebook.json"

die() { echo "[start] ERROR: $*" >&2; exit 1; }

command -v python3 >/dev/null 2>&1 || die "python3 is required"
command -v lsof >/dev/null 2>&1 || die "lsof is required for port-scoped restart"
[ -f "$REQUIRED_FILE" ] || die "missing authoritative rulebook: $REQUIRED_FILE"

pids="$(lsof -nP -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)"
if [ -n "$pids" ]; then
  echo "[start] freeing declared port $PORT (PIDs: $(echo "$pids" | tr '\n' ' '))"
  # shellcheck disable=SC2086
  kill $pids
  sleep 1
fi
pids="$(lsof -nP -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)"
if [ -n "$pids" ]; then
  # shellcheck disable=SC2086
  kill -KILL $pids
  sleep 1
fi
[ -z "$(lsof -nP -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)" ] \
  || die "port $PORT is still occupied"

echo "[start] project: $PROJECT_NAME"
echo "[start] starting: $EXPERIENCE_DESCRIPTION"
echo "[start] primary:  $PRIMARY_URL"
echo "[start] health:   $HEALTH_URL"
exec python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$SERVE_DIR"

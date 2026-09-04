#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

PROJECT_NAME='causal-autoimmune-architecture'
EXPERIENCE_DESCRIPTION='Witnessed autoimmune inference harness and patient diagnosis console'
START_COMMAND='./start.sh'
APP_DIR="$ROOT/admin-app"

# Fixed ports:  backend (Express API) 6347  <-  frontend (Vite/React) 6348
API_PORT=6347
CLIENT_PORT=6348
PRIMARY_URL="http://localhost:${CLIENT_PORT}"
HEALTH_URL="http://localhost:${API_PORT}/api/health"
DATABASE_URL="${DATABASE_URL:-postgresql://postgres@localhost:5432/causal_autoimmune}"
export DATABASE_URL

die() { echo "[start] ERROR: $*" >&2; exit 1; }

for command in npm psql lsof; do
  command -v "$command" >/dev/null 2>&1 || die "$command is required"
done
for file in admin-app/package.json admin-app/server/index.js \
  effortless-rulebook/effortless-rulebook.json; do
  [ -f "$file" ] || die "missing required file: $ROOT/$file"
done
view_ready="$(psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -tAc \
  "SELECT 1 FROM information_schema.views WHERE table_schema='public' AND table_name='vw_individual_predictions' LIMIT 1" \
  2>/dev/null || true)"
[ "$view_ready" = "1" ] \
  || die "$DATABASE_URL is unavailable or missing vw_individual_predictions; load the committed postgres artifacts first"

# Kill whatever holds a TCP port, so a re-run is a clean restart, not a clash.
free_port() {
  local port="$1" pids
  pids="$(lsof -nP -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [ -n "$pids" ]; then
    echo "[start] freeing declared port $port (PIDs: $(echo "$pids" | tr '\n' ' '))" >&2
    # shellcheck disable=SC2086
    kill $pids
    sleep 1
    pids="$(lsof -nP -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    if [ -n "$pids" ]; then
      # shellcheck disable=SC2086
      kill -KILL $pids
      sleep 1
    fi
  fi
  [ -z "$(lsof -nP -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)" ] \
    || die "port $port is still occupied"
}

case "${1:-app}" in
  app)
    # Stop, then restart both servers. Nothing else.
    free_port "$API_PORT"
    free_port "$CLIENT_PORT"
    [ -d "$APP_DIR/node_modules" ] || (cd "$APP_DIR" && npm install --no-audit --no-fund)
    echo "[start] project: $PROJECT_NAME"
    echo "[start] starting: $EXPERIENCE_DESCRIPTION"
    echo "[start] primary:  $PRIMARY_URL"
    echo "[start] API:      http://localhost:$API_PORT"
    echo "[start] health:   $HEALTH_URL"
    exec env PORT="$API_PORT" CLIENT_PORT="$CLIENT_PORT" \
      npm --prefix "$APP_DIR" run dev
    ;;
  stop)
    free_port "$API_PORT"
    free_port "$CLIENT_PORT"
    ;;
  *)
    echo "Usage: ./start.sh [app|stop]" >&2
    echo "  app   stop, then restart backend (:6347) + frontend (:6348)" >&2
    echo "  stop  kill whatever is on :6347 and :6348" >&2
    exit 1
    ;;
esac

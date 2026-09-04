#!/usr/bin/env bash
# ============================================================================
# Tiling the Plane — control-panel launcher
# ============================================================================
# Subcommands:
#   ./start.sh all      (default) boot the API + web app together
#   ./start.sh server   API only
#   ./start.sh web      web app only
#   ./start.sh stop     kill anything on the ports (clean shutdown)
#   ./start.sh restart  stop then start all
#   ./start.sh db       re-init the Postgres DB from the generated SQL
#   ./start.sh build    effortless build (regenerate SQL) then re-init the DB
#
# Always kills whatever is on its ports first — restart is one command.
# ============================================================================
set -euo pipefail
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

PROJECT_NAME='tiling-the-plane'
EXPERIENCE_DESCRIPTION='View-backed tiling catalog and generative control panel'
START_COMMAND='./start.sh'
SERVER_PORT="${SERVER_PORT:-3032}"
WEB_PORT="${WEB_PORT:-5175}"
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres@localhost:5432/erb_tiling_the_plane}"
export PROJECT_NAME SERVER_PORT WEB_PORT
PRIMARY_URL="http://localhost:${WEB_PORT}"
HEALTH_URL="http://localhost:${SERVER_PORT}/healthz"

die() { echo "[start] ERROR: $*" >&2; exit 1; }
for command in npm psql lsof curl; do
  command -v "$command" >/dev/null 2>&1 || die "$command is required"
done
for file in server/package.json server/src/index.ts web/package.json \
  web/vite.config.ts effortless-rulebook/tiling-the-plane-rulebook.json; do
  [ -f "$file" ] || die "missing required file: $PROJECT_ROOT/$file"
done

preflight_db() {
  local ready
  ready="$(psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -tAc \
    "SELECT 1 FROM information_schema.views WHERE table_schema='public' AND table_name='vw_tilings' LIMIT 1" \
    2>/dev/null || true)"
  [ "$ready" = "1" ] \
    || die "$DATABASE_URL is unavailable or missing vw_tilings; load the committed postgres-bootstrap artifacts first"
}
# Ensure the effortless CLI is on PATH for the Excel-export endpoint (it shells out
# to `effortless rulebook-to-xlsx`). Prepend the dir of whatever `effortless` resolves to.
if command -v effortless >/dev/null 2>&1; then
  export PATH="$(dirname "$(command -v effortless)"):$PATH"
fi

kill_port() {
  local p="$1"
  local pids
  pids="$(lsof -nP -tiTCP:"$p" -sTCP:LISTEN 2>/dev/null || true)"
  if [ -n "$pids" ]; then
    echo "[start] freeing declared port $p (PIDs: $(echo "$pids" | tr '\n' ' '))"
    # shellcheck disable=SC2086
    kill $pids
    sleep 1
    pids="$(lsof -nP -tiTCP:"$p" -sTCP:LISTEN 2>/dev/null || true)"
    if [ -n "$pids" ]; then
      # shellcheck disable=SC2086
      kill -KILL $pids
      sleep 1
    fi
  fi
  [ -z "$(lsof -nP -tiTCP:"$p" -sTCP:LISTEN 2>/dev/null || true)" ] \
    || die "port $p is still occupied"
}

ensure_deps() {
  [ -d "$1/node_modules" ] || { echo "[start] installing deps in $1"; (cd "$1" && npm install --silent); }
}

cmd_db() {
  echo "[start] re-initializing $DATABASE_URL"
  ( cd postgres-bootstrap && chmod +x init-db.sh && ./init-db.sh )
}

cmd_build() {
  echo "[start] effortless build (regenerate SQL + re-init DB)"
  effortless build
}

cmd_server() {
  preflight_db
  kill_port "$SERVER_PORT"
  ensure_deps server
  echo "[start] API → http://localhost:$SERVER_PORT"
  ( cd server && PORT="$SERVER_PORT" npm run dev )
}

cmd_web() {
  kill_port "$WEB_PORT"
  ensure_deps web
  echo "[start] web → http://localhost:$WEB_PORT"
  ( cd web && npm run dev )
}

cmd_stop() {
  kill_port "$SERVER_PORT"
  kill_port "$WEB_PORT"
  echo "[start] stopped"
}

cmd_all() {
  preflight_db
  kill_port "$SERVER_PORT"
  kill_port "$WEB_PORT"
  ensure_deps server
  ensure_deps web
  echo "[start] project: $PROJECT_NAME"
  echo "[start] starting: $EXPERIENCE_DESCRIPTION"
  echo "[start] primary:  $PRIMARY_URL"
  echo "[start] API:      http://localhost:$SERVER_PORT"
  echo "[start] health:   $HEALTH_URL"
  ( cd server && PORT="$SERVER_PORT" npm run dev ) &
  SERVER_PID=$!
  trap 'kill $SERVER_PID 2>/dev/null || true' EXIT INT TERM
  for _ in $(seq 1 40); do
    curl -sf "$HEALTH_URL" >/dev/null 2>&1 && break
    sleep 0.25
  done
  curl -sf "$HEALTH_URL" >/dev/null 2>&1 \
    || die "API did not become healthy at $HEALTH_URL"
  ( cd web && npm run dev -- --port "$WEB_PORT" --strictPort )
}

case "${1:-all}" in
  all) cmd_all ;;
  server) cmd_server ;;
  web) cmd_web ;;
  stop) cmd_stop ;;
  restart) cmd_stop; cmd_all ;;
  db) cmd_db ;;
  build) cmd_build ;;
  *) echo "usage: ./start.sh [all|server|web|stop|restart|db|build]"; exit 1 ;;
esac

#!/usr/bin/env bash
# Gym Trainer Invoicing — interactive launcher.
# Usage:
#   ./start.sh           # boot server + web (default)
#   ./start.sh all       # same
#   ./start.sh server    # just the server
#   ./start.sh web       # just the web (assumes server is running)
#   ./start.sh db        # drop + re-init the local Postgres DB
#   ./start.sh build     # effortless build (rebuild SQL + reset DB)

set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HERE"

PROJECT_NAME='Gym Trainer Invoicing'
EXPERIENCE_DESCRIPTION='View-backed trainer invoicing React application'
START_COMMAND='./start.sh'
DB=erb_gym_trainer_invoicing
PG="postgresql://postgres@localhost:5432/${DB}"
SERVER_PORT=3032
WEB_PORT=5175
PRIMARY_URL="http://localhost:${WEB_PORT}/"
API_URL="http://localhost:${SERVER_PORT}"
HEALTH_URL="${API_URL}/healthz"

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

stop_port() {
  local port="$1"
  local pids
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    kill $pids
    sleep 1
    pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    [[ -z "$pids" ]] || kill -9 $pids
  fi
}

require_runtime() {
  for command_name in node npm psql lsof curl; do
    command -v "$command_name" >/dev/null 2>&1 || fail "Required command '$command_name' was not found."
  done
  [[ -f server/package.json ]] || fail "Required file is missing: $HERE/server/package.json"
  [[ -f web/package.json ]] || fail "Required file is missing: $HERE/web/package.json"
  psql "$PG" -c 'SELECT 1' >/dev/null 2>&1 || fail "Required database '$DB' is unavailable."
}

cmd_db() {
  echo "[start] drop+create $DB"
  psql -U postgres -h localhost -d postgres -c "DROP DATABASE IF EXISTS $DB" >/dev/null
  psql -U postgres -h localhost -d postgres -c "CREATE DATABASE $DB" >/dev/null
  ( cd postgres-bootstrap && DATABASE_URL="$PG" ./reset-rulebook-db.sh "$PG" )
}

cmd_build() {
  echo "[start] effortless build"
  effortless build
}

cmd_server() {
  require_runtime
  stop_port "$SERVER_PORT"
  ( cd server && [ -d node_modules ] || npm install --silent )
  ( cd server && DATABASE_URL="$PG" PORT="$SERVER_PORT" npm run dev )
}

cmd_web() {
  require_runtime
  stop_port "$WEB_PORT"
  ( cd web && [ -d node_modules ] || npm install --silent )
  ( cd web && npm run dev -- --port "$WEB_PORT" --strictPort )
}

cmd_all() {
  require_runtime
  stop_port "$SERVER_PORT"
  stop_port "$WEB_PORT"
  ( cd server && [ -d node_modules ] || npm install --silent )
  ( cd web && [ -d node_modules ] || npm install --silent )

  echo "[start] starting server on :$SERVER_PORT"
  ( cd server && DATABASE_URL="$PG" PORT="$SERVER_PORT" npm run dev ) &
  SERVER_PID=$!
  trap 'kill $SERVER_PID 2>/dev/null; exit' INT TERM
  sleep 1

  printf '%s\n' \
    "Project: $PROJECT_NAME" \
    "Experience: $EXPERIENCE_DESCRIPTION" \
    "Application: $PRIMARY_URL" \
    "API: $API_URL" \
    "Health: $HEALTH_URL"
  ( cd web && npm run dev -- --port "$WEB_PORT" --strictPort )
  kill $SERVER_PID 2>/dev/null || true
}

case "${1:-all}" in
  all|"") cmd_all ;;
  server) cmd_server ;;
  web)    cmd_web ;;
  db)     cmd_db ;;
  build)  cmd_build ;;
  *) echo "unknown command: $1"; exit 1 ;;
esac

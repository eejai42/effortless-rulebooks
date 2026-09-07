#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

export DATABASE_URL="${DATABASE_URL:-postgresql://postgres@localhost:5432/erb_therapist_helper_portal}"
export SERVER_PORT=3032
export WEB_PORT=5175

cmd="${1:-all}"
PROJECT_NAME='Therapist Helper Portal'
EXPERIENCE_DESCRIPTION='View-backed therapist workflow React application'
START_COMMAND='./start.sh'
PRIMARY_URL="http://localhost:${WEB_PORT}/"
API_URL="http://localhost:${SERVER_PORT}"
HEALTH_URL="${API_URL}/healthz"
PROJECT_ROOT="$PWD"

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
  [[ -f server/package.json ]] || fail "Required file is missing: $PROJECT_ROOT/server/package.json"
  [[ -f web/package.json ]] || fail "Required file is missing: $PROJECT_ROOT/web/package.json"
  psql "$DATABASE_URL" -c 'SELECT 1' >/dev/null 2>&1 ||
    fail "Required database from DATABASE_URL is unavailable: $DATABASE_URL"
}

build_rulebook() {
  echo "==> effortless build"
  effortless build
}

reset_db() {
  echo "==> drop+create erb_therapist_helper_portal"
  psql -U postgres -h localhost -d postgres -c "DROP DATABASE IF EXISTS erb_therapist_helper_portal" >/dev/null
  psql -U postgres -h localhost -d postgres -c "CREATE DATABASE erb_therapist_helper_portal" >/dev/null
  (cd postgres-bootstrap && DATABASE_URL="$DATABASE_URL" ./reset-rulebook-db.sh)
}

start_server() {
  (cd server && { [[ -d node_modules ]] || npm install; } && PORT="$SERVER_PORT" DATABASE_URL="$DATABASE_URL" npx tsx src/index.ts)
}

start_web() {
  (cd web && { [[ -d node_modules ]] || npm install; } && SERVER_PORT="$SERVER_PORT" ./node_modules/.bin/vite --port "$WEB_PORT" --strictPort)
}

case "$cmd" in
  build)  build_rulebook ;;
  db)     reset_db ;;
  server) require_runtime; stop_port "$SERVER_PORT"; start_server ;;
  web)    require_runtime; stop_port "$WEB_PORT"; start_web ;;
  all)
    require_runtime
    stop_port "$SERVER_PORT"
    stop_port "$WEB_PORT"
    printf '%s\n' \
      "Project: $PROJECT_NAME" \
      "Experience: $EXPERIENCE_DESCRIPTION" \
      "Application: $PRIMARY_URL" \
      "API: $API_URL" \
      "Health: $HEALTH_URL"
    start_server &
    SRV_PID=$!
    trap "kill $SRV_PID 2>/dev/null || true" EXIT
    for _ in $(seq 1 40); do
      curl -fsS "$HEALTH_URL" >/dev/null 2>&1 && break
      sleep 0.25
    done
    curl -fsS "$HEALTH_URL" >/dev/null 2>&1 || fail "API failed to start at $HEALTH_URL"
    start_web
    ;;
  *) echo "usage: ./start.sh [all|build|db|server|web]"; exit 1 ;;
esac

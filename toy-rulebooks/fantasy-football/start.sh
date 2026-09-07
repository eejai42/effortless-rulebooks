#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

COMMAND="${1:-all}"
DATABASE_URL="${DATABASE_URL:-postgresql://postgres@localhost:5432/erb_fantasy_football}"
PROJECT_NAME='Fantasy Football'
EXPERIENCE_DESCRIPTION='View-backed fantasy football React application'
START_COMMAND='./start.sh'
SERVER_PORT=3045
WEB_PORT=5188
PRIMARY_URL="http://localhost:${WEB_PORT}/"
API_URL="http://localhost:${SERVER_PORT}"
HEALTH_URL="${API_URL}/healthz"

cleanup() {
  for port in "$SERVER_PORT" "$WEB_PORT"; do
    pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    if [[ -n "$pids" ]]; then
      kill $pids
      sleep 1
      pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
      [[ -z "$pids" ]] || kill -9 $pids
    fi
  done
}

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
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

case "$COMMAND" in
  build)
    echo "Running effortless build..."
    effortless build
    ;;
  db)
    echo "Initializing database..."
    export DATABASE_URL
    bash postgres-bootstrap/reset-rulebook-db.sh
    ;;
  server)
    require_runtime
    cleanup
    echo "Starting server on port $SERVER_PORT..."
    cd server
    [[ -d node_modules ]] || npm install
    npx tsx watch src/index.ts
    ;;
  web)
    require_runtime
    cleanup
    echo "Starting web on port $WEB_PORT..."
    cd web
    [[ -d node_modules ]] || npm install
    npm run dev -- --port "$WEB_PORT" --strictPort
    ;;
  all)
    require_runtime
    cleanup
    printf '%s\n' \
      "Project: $PROJECT_NAME" \
      "Experience: $EXPERIENCE_DESCRIPTION" \
      "Application: $PRIMARY_URL" \
      "API: $API_URL" \
      "Health: $HEALTH_URL"
    ( cd server && { [[ -d node_modules ]] || npm install; } && npx tsx watch src/index.ts ) &
    SERVER_PID=$!
    sleep 2
    curl -fsS "$HEALTH_URL" >/dev/null 2>&1 || fail "API failed to start at $HEALTH_URL"
    ( cd web && { [[ -d node_modules ]] || npm install; } && npm run dev -- --port "$WEB_PORT" --strictPort ) &
    WEB_PID=$!
    trap "kill $SERVER_PID $WEB_PID 2>/dev/null; exit 0" SIGINT SIGTERM
    wait
    ;;
  *)
    echo "Usage: $0 {all|build|db|server|web}"
    exit 1
    ;;
esac

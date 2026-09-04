#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$PROJECT_ROOT/app"
cd "$PROJECT_ROOT"

PROJECT_NAME='Star Trek'
EXPERIENCE_DESCRIPTION='View-backed Star Trek catalog explorer'
START_COMMAND='./start.sh'
PORT=3140
PRIMARY_URL="http://localhost:${PORT}/"
HEALTH_URL="http://localhost:${PORT}/api/health"
DATABASE_URL="${DATABASE_URL:-postgresql://postgres@localhost:5432/erb_star_trek}"
export DATABASE_URL

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

for command_name in node npm psql lsof curl; do
  command -v "$command_name" >/dev/null 2>&1 || fail "Required command '$command_name' was not found."
done
[[ -f "$APP_DIR/package.json" ]] || fail "Required file is missing: $APP_DIR/package.json"
[[ -f "$APP_DIR/server.js" ]] || fail "Required file is missing: $APP_DIR/server.js"
psql "$DATABASE_URL" -c 'SELECT 1' >/dev/null 2>&1 ||
  fail "Required database from DATABASE_URL is unavailable: $DATABASE_URL"

existing_pids="$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)"
if [[ -n "$existing_pids" ]]; then
  kill $existing_pids
  sleep 1
  remaining_pids="$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)"
  [[ -z "$remaining_pids" ]] || kill -9 $remaining_pids
fi

# Ensure dependencies are installed
if [ ! -d "$APP_DIR/node_modules" ]; then
  echo "Installing dependencies..."
  cd "$APP_DIR"
  npm install
  echo
fi

# Start the server
cd "$APP_DIR"
APP_PORT="$PORT" DATABASE_URL="$DATABASE_URL" npm start &
APP_PID=$!
trap 'kill "$APP_PID" 2>/dev/null || true' EXIT INT TERM

for _ in $(seq 1 40); do
  curl -fsS "$HEALTH_URL" >/dev/null 2>&1 && break
  sleep 0.25
done
curl -fsS "$HEALTH_URL" >/dev/null 2>&1 || fail "Application failed to start at $HEALTH_URL"

printf '%s\n' \
  "Project: $PROJECT_NAME" \
  "Experience: $EXPERIENCE_DESCRIPTION" \
  "Application: $PRIMARY_URL" \
  "Health: $HEALTH_URL"
wait "$APP_PID"

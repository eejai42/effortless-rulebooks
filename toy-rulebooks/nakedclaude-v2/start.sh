#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME='NakedClaude v2'
EXPERIENCE_DESCRIPTION='Magic-link customer portal'
START_COMMAND='./start.sh'
PORT=3012
PRIMARY_URL="http://localhost:${PORT}/"
HEALTH_URL="$PRIMARY_URL"
PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-postgres}"
PGDATABASE='erb_nakedclaude_v2'
export PGHOST PGPORT PGUSER PGDATABASE

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$PROJECT_ROOT/app"
LOG_DIR="$PROJECT_ROOT/.run"
LOG_FILE="$LOG_DIR/app.log"

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

for command_name in node npm psql lsof curl; do
  command -v "$command_name" >/dev/null 2>&1 || fail "Required command '$command_name' was not found."
done
[[ -f "$APP_DIR/package.json" ]] || fail "Required file is missing: $APP_DIR/package.json"
[[ -f "$APP_DIR/server.js" ]] || fail "Required file is missing: $APP_DIR/server.js"
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c 'SELECT 1' >/dev/null 2>&1 ||
  fail "Required database '$PGDATABASE' is unavailable."

existing_pids="$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)"
if [[ -n "$existing_pids" ]]; then
  kill $existing_pids
  sleep 1
  remaining_pids="$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)"
  [[ -z "$remaining_pids" ]] || kill -9 $remaining_pids
fi

if [[ ! -d "$APP_DIR/node_modules" ]]; then
  (cd "$APP_DIR" && npm install)
fi

mkdir -p "$LOG_DIR"
(cd "$APP_DIR" && nohup env PORT="$PORT" node server.js >"$LOG_FILE" 2>&1 &)

for _ in $(seq 1 40); do
  curl -fsS "$HEALTH_URL" >/dev/null 2>&1 && break
  sleep 0.25
done
curl -fsS "$HEALTH_URL" >/dev/null 2>&1 || fail "Application failed to start. See $LOG_FILE"

printf '%s\n' \
  "Project: $PROJECT_NAME" \
  "Experience: $EXPERIENCE_DESCRIPTION" \
  "Application: $PRIMARY_URL" \
  "Health: $HEALTH_URL"

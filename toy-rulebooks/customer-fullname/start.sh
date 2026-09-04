#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME='Customer FullName'
EXPERIENCE_DESCRIPTION='Customer calculated-field React demo'
START_COMMAND='./start.sh'
API_PORT=7001
CLIENT_PORT=7002
PRIMARY_URL="http://localhost:${CLIENT_PORT}/"
API_URL="http://localhost:${API_PORT}"
HEALTH_URL="${API_URL}/api/customers"
DATABASE_URL="${DATABASE_URL:-postgresql://postgres@localhost:5432/erb_customer_fullname}"
export DATABASE_URL

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$PROJECT_ROOT/.run"
LOG_FILE="$LOG_DIR/app.log"

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

for command_name in node npm psql lsof curl; do
  command -v "$command_name" >/dev/null 2>&1 || fail "Required command '$command_name' was not found."
done
for required_file in package.json server.js web/package.json; do
  [[ -f "$PROJECT_ROOT/$required_file" ]] || fail "Required file is missing: $PROJECT_ROOT/$required_file"
done
psql "$DATABASE_URL" -c 'SELECT 1' >/dev/null 2>&1 ||
  fail "Required database from DATABASE_URL is unavailable: $DATABASE_URL"

for port in "$API_PORT" "$CLIENT_PORT"; do
  existing_pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "$existing_pids" ]]; then
    kill $existing_pids
    sleep 1
    remaining_pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    [[ -z "$remaining_pids" ]] || kill -9 $remaining_pids
  fi
done

[[ -d "$PROJECT_ROOT/node_modules" ]] || (cd "$PROJECT_ROOT" && npm install)
[[ -d "$PROJECT_ROOT/web/node_modules" ]] || (cd "$PROJECT_ROOT/web" && npm install)
(cd "$PROJECT_ROOT/web" && npm run build)
[[ -f "$PROJECT_ROOT/web/dist/index.html" ]] ||
  fail "Web build did not produce the required artifact: $PROJECT_ROOT/web/dist/index.html"

mkdir -p "$LOG_DIR"
(cd "$PROJECT_ROOT" && nohup env API_PORT="$API_PORT" CLIENT_PORT="$CLIENT_PORT" DATABASE_URL="$DATABASE_URL" node server.js >"$LOG_FILE" 2>&1 &)

for _ in $(seq 1 60); do
  if curl -fsS "$PRIMARY_URL" >/dev/null 2>&1 && curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done
curl -fsS "$PRIMARY_URL" >/dev/null 2>&1 || fail "Client failed to start. See $LOG_FILE"
curl -fsS "$HEALTH_URL" >/dev/null 2>&1 || fail "API failed its health request. See $LOG_FILE"

printf '%s\n' \
  "Project: $PROJECT_NAME" \
  "Experience: $EXPERIENCE_DESCRIPTION" \
  "Application: $PRIMARY_URL" \
  "API: $API_URL" \
  "Health: $HEALTH_URL"

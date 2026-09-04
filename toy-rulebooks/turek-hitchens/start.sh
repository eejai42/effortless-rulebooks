#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME='Turek–Hitchens Debate'
EXPERIENCE_DESCRIPTION='Authoritative Effortless rulebook'
START_COMMAND='./start.sh'
PORT=43206
PRIMARY_URL="http://localhost:${PORT}/effortless-rulebook.json"
HEALTH_URL="$PRIMARY_URL"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVE_PATH="$PROJECT_ROOT/effortless-rulebook"
ARTIFACT_PATH="$SERVE_PATH/effortless-rulebook.json"
LOG_DIR="$PROJECT_ROOT/.run"
LOG_FILE="$LOG_DIR/start.log"

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

for command_name in python3 lsof curl; do
  command -v "$command_name" >/dev/null 2>&1 || fail "Required command '$command_name' was not found."
done
[[ -d "$SERVE_PATH" ]] || fail "Required rulebook directory is missing: $SERVE_PATH"
[[ -f "$ARTIFACT_PATH" ]] || fail "Authoritative rulebook is missing: $ARTIFACT_PATH"

existing_pids="$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)"
if [[ -n "$existing_pids" ]]; then
  kill $existing_pids
  sleep 1
  remaining_pids="$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)"
  [[ -z "$remaining_pids" ]] || kill -9 $remaining_pids
fi

mkdir -p "$LOG_DIR"
nohup python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$SERVE_PATH" >"$LOG_FILE" 2>&1 &
server_pid=$!

for _ in $(seq 1 30); do
  curl -fsS "$HEALTH_URL" >/dev/null 2>&1 && break
  sleep 0.2
done
if ! curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
  kill "$server_pid" 2>/dev/null || true
  fail "Rulebook server failed to start. See $LOG_FILE"
fi

printf '%s\n' \
  "Project: $PROJECT_NAME" \
  "Experience: $EXPERIENCE_DESCRIPTION" \
  "Rulebook: $PRIMARY_URL" \
  "Health: $HEALTH_URL"

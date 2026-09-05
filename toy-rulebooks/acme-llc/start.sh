#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME='ACME, LLC'
PORT=43201
APP_URL="http://localhost:${PORT}"
EDITOR_URL='http://localhost:43212'
API_URL='http://localhost:43211'
POSTGRES_URL='postgresql://postgres:postgres@localhost:43213/effortless-rulebook'
API_GENERATOR_VERSION='v2026.08.30.1722'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVE_PATH="$PROJECT_ROOT/demo-app"
ARTIFACT_PATH="$SERVE_PATH/index.html"
EDITOR_SCRIPT="$PROJECT_ROOT/effortless-rulebook/edit-rulebook.sh"
RULEBOOK_PATH="$PROJECT_ROOT/effortless-rulebook/acme-llc-rulebook.json"
LOG_DIR="$PROJECT_ROOT/.run"
LOG_FILE="$LOG_DIR/start.log"
EDITOR_LOG_FILE="$LOG_DIR/editor.log"

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

for command_name in python3 lsof curl docker; do
  command -v "$command_name" >/dev/null 2>&1 || fail "Required command '$command_name' was not found."
done
[[ -d "$SERVE_PATH" ]] || fail "Required demo app directory is missing: $SERVE_PATH"
[[ -f "$ARTIFACT_PATH" ]] || fail "Required demo app is missing: $ARTIFACT_PATH"
[[ -f "$EDITOR_SCRIPT" ]] || fail "Required editor launcher is missing: $EDITOR_SCRIPT"
[[ -f "$RULEBOOK_PATH" ]] || fail "Required rulebook is missing: $RULEBOOK_PATH"

IFS=$'\t' read -r expected_formula expected_first_name < <(
  python3 -c '
import json, sys
d = json.load(open(sys.argv[1]))
print(next(field["formula"] for field in d["Customers"]["schema"] if field["name"] == "FullName"), d["Customers"]["data"][0]["FirstName"], sep="\t")
' "$RULEBOOK_PATH"
)

mkdir -p "$LOG_DIR"
bash "$EDITOR_SCRIPT" >"$EDITOR_LOG_FILE" 2>&1 &
editor_launcher_pid=$!

# The editor boot page comes up before its generated services. Wait for the
# initial build, then install the last verified API generator release. The
# current catalog head returns HTTP 421 before producing files, so startup uses
# one explicit version and fails if that version cannot build.
for _ in $(seq 1 360); do
  editor_state="$(
    curl -fsS "$EDITOR_URL/__boot/status" 2>/dev/null |
      python3 -c 'import json,sys; print(json.load(sys.stdin).get("state", ""))' 2>/dev/null || true
  )"
  [[ "$editor_state" == "ready" || "$editor_state" == "degraded" ]] && break
  kill -0 "$editor_launcher_pid" 2>/dev/null ||
    fail "Rulebook editor stopped during startup. See $EDITOR_LOG_FILE"
  sleep 1
done
if [[ "${editor_state:-}" != "ready" && "${editor_state:-}" != "degraded" ]]; then
  kill "$editor_launcher_pid" 2>/dev/null || true
  fail "Rulebook editor did not finish its initial build. See $EDITOR_LOG_FILE"
fi

container_names="$(docker ps --filter "publish=43211" --format '{{.Names}}')"
[[ -n "$container_names" && "$container_names" != *$'\n'* ]] ||
  fail "Expected exactly one ACME editor container on port 43211."
docker exec "$container_names" sh -lc \
  "cd /app/effortless-root/api &&
   effortless -install rulebook-to-node-postgres-api/$API_GENERATOR_VERSION -i ../effortless-rulebook/acme-llc-rulebook.json &&
   grep -q 'export const RULEBOOK = JSON.parse(\"{' db.js" \
  >>"$EDITOR_LOG_FILE" 2>&1 ||
  fail "Pinned API generation failed. See $EDITOR_LOG_FILE"
docker exec "$container_names" sh -lc '
  needle="node index.js"
  for process_dir in /proc/[0-9]*; do
    process_id="${process_dir##*/}"
    [ "$process_id" = "$$" ] && continue
    command_line="$(tr "\000" " " <"$process_dir/cmdline" 2>/dev/null || true)"
    case "$command_line" in
      *"$needle"*) kill "$process_id" 2>/dev/null || true ;;
    esac
  done
'
docker exec -d "$container_names" sh -lc \
  'cd /app/effortless-root/api && npm install --omit=dev --silent && PORT=5177 exec node index.js >/tmp/api.log 2>&1'

for _ in $(seq 1 90); do
  IFS=$'\t' read -r served_formula served_first_name < <(
    curl -fsS "$API_URL/api/tables/Customers" 2>/dev/null |
      python3 -c '
import json, sys
d = json.load(sys.stdin)
print(next(field["formula"] for field in d["fields"] if field["name"] == "FullName"), d["rows"][0]["first_name"], sep="\t")
' 2>/dev/null || true
  ) || true
  if [[ "${served_formula:-}" == "$expected_formula" &&
        "${served_first_name:-}" == "$expected_first_name" ]] &&
     curl -fsS "$API_URL/api/rulespeak" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
if [[ "${served_formula:-}" != "$expected_formula" ||
      "${served_first_name:-}" != "$expected_first_name" ]] ||
   ! curl -fsS "$API_URL/api/rulespeak" >/dev/null 2>&1; then
  kill "$editor_launcher_pid" 2>/dev/null || true
  fail "Required Customers and RuleSpeak endpoints did not become ready. See $EDITOR_LOG_FILE"
fi
kill "$editor_launcher_pid" 2>/dev/null || true
wait "$editor_launcher_pid" 2>/dev/null || true

existing_pids="$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)"
if [[ -n "$existing_pids" ]]; then
  kill $existing_pids
  sleep 1
  remaining_pids="$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)"
  [[ -z "$remaining_pids" ]] || kill -9 $remaining_pids
fi

nohup python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$SERVE_PATH" >"$LOG_FILE" 2>&1 &
server_pid=$!

for _ in $(seq 1 30); do
  curl -fsS "$APP_URL" >/dev/null 2>&1 && break
  sleep 0.2
done
if ! curl -fsS "$APP_URL" >/dev/null 2>&1; then
  kill "$server_pid" 2>/dev/null || true
  fail "Demo app failed to start. See $LOG_FILE"
fi

printf '%s\n' \
  "Project: $PROJECT_NAME" \
  "App: $APP_URL" \
  "Rulebook editor: $EDITOR_URL" \
  "Generated API: $API_URL" \
  "RuleSpeak: $API_URL/api/rulespeak?format=html" \
  "Postgres: $POSTGRES_URL"

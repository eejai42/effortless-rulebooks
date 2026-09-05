#!/usr/bin/env bash

set -euo pipefail

readonly PROJECT_NAME="effortless-rulebooks"
readonly EXPERIENCE_DESCRIPTION="Root React explorer with the generated rulebook editor and view-backed API"
readonly START_COMMAND="./start.sh"
readonly PRIMARY_URL="http://localhost:42440"
readonly HEALTH_URL="http://localhost:42440/"

readonly EXPLORER_PORT="42440"
readonly EDITOR_API_PORT="42441"
readonly EDITOR_UI_PORT="42442"
readonly EDITOR_POSTGRES_PORT="5442"

readonly PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly APP_DIR="${PROJECT_ROOT}/app"
readonly RULEBOOK_PATH="${PROJECT_ROOT}/effortless-rulebook/effortless-rulebook.json"
readonly EDITOR_SCRIPT="${PROJECT_ROOT}/effortless-rulebook/edit-rulebook.sh"
readonly RUNTIME_DIR="${PROJECT_ROOT}/.run/root-explorer"
readonly APP_LOG="${RUNTIME_DIR}/app.log"
readonly EDITOR_LOG="${RUNTIME_DIR}/editor.log"

EDITOR_CONTAINER=""  # resolved at runtime from the pinned API port
readonly EDITOR_API_URL="http://localhost:42441"
readonly EDITOR_UI_URL="http://localhost:42442"
readonly EDITOR_POSTGRES_URL="postgresql://postgres:postgres@localhost:5442/effortless-rulebook"

APP_PID=""
EDITOR_FOLLOW_PID=""
SHUTTING_DOWN="false"

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 ||
    fail "required command '$1' is unavailable"
}

require_file() {
  [[ -f "$1" ]] || fail "required file is unavailable: $1"
}

require_executable() {
  [[ -x "$1" ]] || fail "required executable is unavailable: $1"
}

stop_listeners_on_port() {
  local port="$1"
  local pids=""
  local pid=""
  local attempt=""

  pids="$(lsof -nP -tiTCP:"${port}" -sTCP:LISTEN 2>/dev/null || true)"
  [[ -n "$pids" ]] || return 0

  printf 'Stopping listener(s) on declared port %s...\n' "$port"
  while IFS= read -r pid; do
    [[ -n "$pid" ]] && kill "$pid" 2>/dev/null || true
  done <<<"$pids"

  for attempt in {1..20}; do
    if ! lsof -nP -tiTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.25
  done

  pids="$(lsof -nP -tiTCP:"${port}" -sTCP:LISTEN 2>/dev/null || true)"
  while IFS= read -r pid; do
    [[ -n "$pid" ]] && kill -KILL "$pid" 2>/dev/null || true
  done <<<"$pids"

  sleep 0.25
  if lsof -nP -tiTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1; then
    fail "declared port ${port} is still occupied after a scoped restart"
  fi
}

stop_editor_containers_on_declared_ports() {
  local port=""
  local container_id=""
  local container_ids=""

  for port in "$EDITOR_API_PORT" "$EDITOR_UI_PORT" "$EDITOR_POSTGRES_PORT"; do
    container_ids="$(docker ps -q --filter "publish=${port}")"
    while IFS= read -r container_id; do
      if [[ -n "$container_id" ]]; then
        printf 'Stopping editor container %s on declared port %s...\n' \
          "$container_id" "$port"
        docker rm -f "$container_id" >/dev/null
      fi
    done <<<"$container_ids"
  done

}

stop_services() {
  if [[ "$SHUTTING_DOWN" == "true" ]]; then
    return 0
  fi
  SHUTTING_DOWN="true"

  if [[ -n "$APP_PID" ]]; then
    kill "$APP_PID" 2>/dev/null || true
  fi
  if [[ -n "$EDITOR_FOLLOW_PID" ]]; then
    kill "$EDITOR_FOLLOW_PID" 2>/dev/null || true
  fi

  stop_editor_containers_on_declared_ports
  stop_listeners_on_port "$EXPLORER_PORT"
  for port in "$EDITOR_API_PORT" "$EDITOR_UI_PORT" "$EDITOR_POSTGRES_PORT"; do
    stop_listeners_on_port "$port"
  done

  printf '%s services stopped.\n' "$PROJECT_NAME"
}

cleanup() {
  local exit_code=$?
  trap - EXIT INT TERM
  stop_services || true
  exit "$exit_code"
}

wait_for_http() {
  local url="$1"
  local description="$2"
  local attempts="${3:-180}"
  local attempt=""

  for ((attempt = 1; attempt <= attempts; attempt += 1)); do
    if curl --fail --silent --show-error --max-time 2 "$url" >/dev/null 2>&1; then
      printf '%s is ready: %s\n' "$description" "$url"
      return 0
    fi
    sleep 1
  done

  fail "${description} did not become healthy at ${url}; logs: ${EDITOR_LOG} ${APP_LOG}"
}

resolve_editor_container() {
  # The generated launcher names its container per project; the only stable
  # handle the root owns is the pinned API port it published.
  local container_id=""
  container_id="$(docker ps -q --filter "publish=${EDITOR_API_PORT}")"
  [[ -n "$container_id" ]] ||
    fail "no editor container publishes declared port ${EDITOR_API_PORT}"
  [[ "$(printf '%s\n' "$container_id" | wc -l | tr -d ' ')" == "1" ]] ||
    fail "more than one container publishes declared port ${EDITOR_API_PORT}: ${container_id}"
  EDITOR_CONTAINER="$container_id"
}

check_editor_database_and_views() {
  local database_name=""
  local view_count=""
  local view_health=""
  local view_health_scope=""

  resolve_editor_container

  database_name="$(
    docker exec "$EDITOR_CONTAINER" \
      psql -U postgres -d effortless-rulebook -Atqc \
      'SELECT current_database();'
  )"
  [[ "$database_name" == "effortless-rulebook" ]] ||
    fail "editor database check returned '${database_name}', expected 'effortless-rulebook'"

  view_count="$(
    docker exec "$EDITOR_CONTAINER" \
      psql -U postgres -d effortless-rulebook -Atqc \
      "SELECT COUNT(*) FROM pg_views WHERE viewname LIKE 'vw\\_%' ESCAPE '\\';"
  )"
  [[ "$view_count" =~ ^[0-9]+$ ]] ||
    fail "editor view count is not numeric: ${view_count}"
  ((view_count > 0)) ||
    fail "editor database contains no generated vw_* views"

  view_health="$(curl --fail --silent --show-error "${EDITOR_API_URL}/api/view-health")"
  if ! view_health_scope="$(printf '%s' "$view_health" | node -e '
    let input = "";
    process.stdin.on("data", chunk => { input += chunk; });
    process.stdin.on("end", () => {
      const health = JSON.parse(input);
      const broken = Array.isArray(health.views)
        ? health.views.filter(view => view.ok !== true)
        : [];
      if (health.ok === true && health.brokenCount === 0 && broken.length === 0) {
        process.stdout.write("all-views");
        return;
      }
      const reservedMetaOnly =
        health.ok === false &&
        health.brokenCount === 1 &&
        broken.length === 1 &&
        broken[0].table === "__meta__" &&
        broken[0].view === "vw_meta" &&
        broken[0].error?.code === "42P01";
      if (reservedMetaOnly) {
        process.stdout.write("business-views");
        return;
      }
      process.exit(1);
    });
  ')"; then
    fail "generated API view health is not clean: ${view_health}"
  fi

  if [[ "$view_health_scope" == "business-views" ]]; then
    printf '%s\n' \
      "Business views are healthy; the editor's reserved __meta probe is explicitly excluded" \
      "because __meta__ is transpiler-ignored and therefore has no vw_meta projection."
  fi
  printf 'Database and %s generated views are healthy.\n' "$view_count"
}

print_services() {
  printf '\nProject: %s\n' "$PROJECT_NAME"
  printf 'Experience: %s\n' "$EXPERIENCE_DESCRIPTION"
  printf 'Services started:\n'
  printf '  Root explorer:       %s\n' "$PRIMARY_URL"
  printf '  Explorer health:     %s\n' "$HEALTH_URL"
  printf '  Editor UI:           %s\n' "$EDITOR_UI_URL"
  printf '  Editor API:          %s\n' "$EDITOR_API_URL"
  printf '  API documentation:   %s/api/docs\n' "$EDITOR_API_URL"
  printf '  API view health:     %s/api/view-health\n' "$EDITOR_API_URL"
  printf '  RuleSpeak API:       %s/api/rulespeak\n' "$EDITOR_API_URL"
  printf '  Editor Postgres:     %s\n' "$EDITOR_POSTGRES_URL"
  printf '\nPress Ctrl-C to stop every service listed above.\n'
}

check_prerequisites() {
  require_command curl
  require_command docker
  require_command lsof
  require_command node
  require_command npm

  require_file "$RULEBOOK_PATH"
  require_file "$EDITOR_SCRIPT"
  require_file "${APP_DIR}/package.json"
  require_file "${APP_DIR}/package-lock.json"
  require_file "${APP_DIR}/index.html"
  require_file "${APP_DIR}/src/main.jsx"

  docker info >/dev/null 2>&1 ||
    fail "Docker is installed but its daemon is unavailable"
}

start_services() {
  mkdir -p "$RUNTIME_DIR"

  if [[ ! -x "${APP_DIR}/node_modules/.bin/vite" ]]; then
    printf 'Installing the root explorer dependencies from package-lock.json...\n'
    npm --prefix "$APP_DIR" ci --no-audit --no-fund
  fi
  require_executable "${APP_DIR}/node_modules/.bin/vite"

  stop_editor_containers_on_declared_ports
  stop_listeners_on_port "$EXPLORER_PORT"
  for port in "$EDITOR_API_PORT" "$EDITOR_UI_PORT" "$EDITOR_POSTGRES_PORT"; do
    stop_listeners_on_port "$port"
  done

  printf 'Starting generated editor from %s...\n' "$EDITOR_SCRIPT"
  # The generated launcher lets Docker pick host ports unless they are pinned.
  # The root declares fixed ports (modeled in ProjectLocalServices), so pin them.
  RULEBOOK_EDITOR_API_PORT="$EDITOR_API_PORT" \
    RULEBOOK_EDITOR_UI_PORT="$EDITOR_UI_PORT" \
    RULEBOOK_EDITOR_PG_PORT="$EDITOR_POSTGRES_PORT" \
    bash "$EDITOR_SCRIPT" >"$EDITOR_LOG" 2>&1 &
  EDITOR_FOLLOW_PID=$!

  # First boot runs npm install plus a full internal build of the root rulebook,
  # which takes several minutes; allow ten.
  wait_for_http "${EDITOR_API_URL}/api/docs" "Generated editor API" 600
  check_editor_database_and_views
  wait_for_http "$EDITOR_UI_URL" "Generated editor UI"

  printf 'Starting root explorer on fixed port %s...\n' "$EXPLORER_PORT"
  (
    cd "$APP_DIR"
    exec npm run dev -- --host 127.0.0.1 --port "$EXPLORER_PORT" --strictPort
  ) >"$APP_LOG" 2>&1 &
  APP_PID=$!

  wait_for_http "$HEALTH_URL" "Root explorer" 60
  print_services
  wait "$APP_PID"
}

case "${1:-start}" in
  start)
    check_prerequisites
    trap cleanup EXIT
    trap 'exit 130' INT
    trap 'exit 143' TERM
    start_services
    ;;
  stop)
    require_command docker
    require_command lsof
    docker info >/dev/null 2>&1 ||
      fail "Docker is installed but its daemon is unavailable"
    stop_services
    ;;
  *)
    fail "unsupported command '$1'; use './start.sh' or './start.sh stop'"
    ;;
esac

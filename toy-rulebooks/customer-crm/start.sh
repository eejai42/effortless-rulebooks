#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

export DATABASE_URL="${DATABASE_URL:-postgresql://postgres@localhost:5432/erb_customer_crm}"

cmd="${1:-all}"

PROJECT_NAME='Customer CRM'
EXPERIENCE_DESCRIPTION='View-backed customer relationship React application'
START_COMMAND='./start.sh'
SERVER_PORT=3032
WEB_PORT=5175
PRIMARY_URL="http://localhost:${WEB_PORT}/"
API_URL="http://localhost:${SERVER_PORT}"
HEALTH_URL="${API_URL}/healthz"

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

require_runtime() {
  for command_name in node npm psql lsof curl; do
    command -v "$command_name" >/dev/null 2>&1 || fail "Required command '$command_name' was not found."
  done
  [[ -f server/package.json ]] || fail "Required file is missing: $PWD/server/package.json"
  [[ -f web/package.json ]] || fail "Required file is missing: $PWD/web/package.json"
  psql "$DATABASE_URL" -c 'SELECT 1' >/dev/null 2>&1 ||
    fail "Required database from DATABASE_URL is unavailable: $DATABASE_URL"
}

# Free any lingering server/web processes from a previous run so reruns of
# ./start.sh don't fail with EADDRINUSE.
stop() {
  for port in "$SERVER_PORT" "$WEB_PORT"; do
    pids=$(lsof -ti tcp:"$port" 2>/dev/null || true)
    if [ -n "$pids" ]; then
      echo "[stop] killing pid(s) on port $port: $pids"
      kill $pids 2>/dev/null || true
      sleep 0.3
      pids=$(lsof -ti tcp:"$port" 2>/dev/null || true)
      [ -n "$pids" ] && kill -9 $pids 2>/dev/null || true
    fi
  done
}

build() {
  echo "[build] effortless build"
  effortless build
}

db() {
  echo "[db] re-initializing $DATABASE_URL"
  psql -U postgres -h localhost -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='erb_customer_crm'" >/dev/null || true
  psql -U postgres -h localhost -d postgres -c "DROP DATABASE IF EXISTS erb_customer_crm"
  psql -U postgres -h localhost -d postgres -c "CREATE DATABASE erb_customer_crm"
  chmod +x postgres-bootstrap/init-db.sh
  bash postgres-bootstrap/init-db.sh
}

server() {
  cd server
  [ -d node_modules ] || npm install
  npm run dev
}

web() {
  cd web
  [ -d node_modules ] || npm install
  npm run dev
}

all() {
  require_runtime
  stop
  printf '%s\n' \
    "Project: $PROJECT_NAME" \
    "Experience: $EXPERIENCE_DESCRIPTION" \
    "Application: $PRIMARY_URL" \
    "API: $API_URL" \
    "Health: $HEALTH_URL"
  ( server ) &
  spid=$!
  ( web ) &
  wpid=$!
  trap "kill $spid $wpid 2>/dev/null || true; stop" EXIT
  wait
}

refresh_xlsx() {
  node scripts/refresh-rulebook.mjs
}

case "$cmd" in
  build)        build ;;
  db)           db ;;
  server)       require_runtime; stop; server ;;
  web)          require_runtime; stop; web ;;
  all)          all ;;
  stop)         stop ;;
  refresh-xlsx) refresh_xlsx ;;
  *)            echo "usage: $0 {all|server|web|db|build|stop|refresh-xlsx}"; exit 1 ;;
esac

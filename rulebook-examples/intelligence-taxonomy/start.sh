#!/usr/bin/env bash
# Taxonomy of Intelligence — project launcher.
# Usage: ./start.sh [all|server|web|db|db-reset|build|stop]

set -euo pipefail

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$ROOT"
PROJECT_NAME='intelligence-taxonomy'
EXPERIENCE_DESCRIPTION='Interactive intelligence taxonomy and calculated-field explorer'
START_COMMAND='./start.sh'
DB_NAME="${DB_NAME:-erb_intelligence_taxonomy}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DATABASE_URL="${DATABASE_URL:-postgresql://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}}"
SERVER_PORT="${SERVER_PORT:-3032}"
WEB_PORT="${WEB_PORT:-5175}"
PRIMARY_URL="http://localhost:${WEB_PORT}"
HEALTH_URL="http://localhost:${SERVER_PORT}/healthz"
export DATABASE_URL SERVER_PORT WEB_PORT

cmd="${1:-all}"

die() { echo "[start] ERROR: $*" >&2; exit 1; }

build() {
  cd "$ROOT"
  command -v effortless >/dev/null 2>&1 || die "effortless is required for the explicit build command"
  echo "[build] effortless build"
  effortless build
}

port_pids() {
  lsof -nP -tiTCP:"$1" -sTCP:LISTEN 2>/dev/null || true
}

kill_port() {
  local port="$1"
  local pids attempt
  for attempt in 1 2 3 4 5 6; do
    pids="$(port_pids "$port")"
    [[ -z "$pids" ]] && return 0
    local sig="-TERM"
    (( attempt >= 4 )) && sig="-KILL"
    echo "[stop] $sig pid(s) on :${port} -> $(echo "$pids" | tr '\n' ' ')"
    # shellcheck disable=SC2086
    kill $sig $pids 2>/dev/null || true
    sleep 0.5
  done
  # Final check; report if still occupied so the caller can see.
  pids="$(port_pids "$port")"
  if [[ -n "$pids" ]]; then
    echo "[stop] WARNING: :${port} still held by $(echo "$pids" | tr '\n' ' ')" >&2
    return 1
  fi
  return 0
}

stop_server() {
  kill_port "$SERVER_PORT"
}

stop_web() {
  kill_port "$WEB_PORT"
}

stop_services() {
  stop_server
  stop_web
}

ensure_db_exists() {
  if [ "$(psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d postgres -tAc \
        "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" 2>/dev/null || true)" != "1" ]; then
    echo "[db] database ${DB_NAME} does not exist — creating"
    psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d postgres \
      -c "CREATE DATABASE ${DB_NAME};"
  fi
}

preflight() {
  for command in npm psql lsof curl; do
    command -v "$command" >/dev/null 2>&1 || die "$command is required"
  done
  for file in server/package.json server/src/index.ts web/package.json \
    web/vite.config.ts effortless-rulebook/intelligence-taxonomy-rulebook.json; do
    [ -f "$ROOT/$file" ] || die "missing required file: $ROOT/$file"
  done
}

preflight_db() {
  local ready
  ready="$(psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -tAc \
    "SELECT 1 FROM information_schema.views WHERE table_schema='public' AND table_name='vw_intelligences' LIMIT 1" \
    2>/dev/null || true)"
  [ "$ready" = "1" ] \
    || die "$DATABASE_URL is unavailable or missing vw_intelligences; run ./start.sh db after loading generated artifacts"
}

db() {
  cd "$ROOT"
  [ -f postgres-bootstrap/init-db.sh ] \
    || die "missing generated artifact: $ROOT/postgres-bootstrap/init-db.sh"
  ensure_db_exists
  echo "[db] applying schema + data in place (idempotent)"
  chmod +x postgres-bootstrap/init-db.sh
  DATABASE_URL="$DATABASE_URL" ./postgres-bootstrap/init-db.sh
}

db_reset() {
  cd "$ROOT"
  [ -f postgres-bootstrap/init-db.sh ] \
    || die "missing generated artifact: $ROOT/postgres-bootstrap/init-db.sh"
  ensure_db_exists
  echo "[db-reset] TRUNCATE assessments, intelligences, capabilities CASCADE"
  psql "$DATABASE_URL" -c "TRUNCATE assessments, intelligences, capabilities CASCADE;"
  chmod +x postgres-bootstrap/init-db.sh
  echo "[db-reset] re-seeding from rulebook"
  DATABASE_URL="$DATABASE_URL" ./postgres-bootstrap/init-db.sh
}

server() {
  stop_server
  preflight_db
  cd "$ROOT/server"
  if [[ ! -d node_modules ]]; then
    echo "[server] npm install"
    npm install
  fi
  echo "[server] starting on :${SERVER_PORT}"
  DATABASE_URL="$DATABASE_URL" PORT="$SERVER_PORT" npm run dev
}

web() {
  stop_web
  cd "$ROOT/web"
  if [[ ! -d node_modules ]]; then
    echo "[web] npm install"
    npm install
  fi
  echo "[web] starting on :${WEB_PORT}"
  VITE_API_PORT="$SERVER_PORT" PORT="$WEB_PORT" npm run dev -- --port "$WEB_PORT" --strictPort
}

all() {
  preflight
  preflight_db
  stop_services
  echo "[start] project: $PROJECT_NAME"
  echo "[start] starting: $EXPERIENCE_DESCRIPTION"
  echo "[start] primary:  $PRIMARY_URL"
  echo "[start] API:      http://localhost:$SERVER_PORT"
  echo "[start] health:   $HEALTH_URL"
  (server) &
  PID_SERVER=$!
  trap 'kill $PID_SERVER 2>/dev/null || true; stop_services' EXIT INT TERM
  for _ in $(seq 1 40); do
    curl -sf "$HEALTH_URL" >/dev/null 2>&1 && break
    sleep 0.25
  done
  curl -sf "$HEALTH_URL" >/dev/null 2>&1 \
    || die "API did not become healthy at $HEALTH_URL"
  web
}

preflight

case "$cmd" in
  build)    build ;;
  db)       db ;;
  db-reset) db_reset ;;
  server)   server ;;
  web)      web ;;
  all)      all ;;
  stop)     stop_services ;;
  *) echo "unknown command: $cmd" >&2; exit 1 ;;
esac

#!/usr/bin/env bash
set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

DEFAULT_DB="erb_community_event_planner"
DEFAULT_SERVER_PORT="3045"
DEFAULT_WEB_PORT="5188"

PROJECT_NAME='Community Event Planner'
EXPERIENCE_DESCRIPTION='View-backed community event planning React application'
START_COMMAND='./start.sh'

# Exported for child processes
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres@localhost:5432/$DEFAULT_DB}"
export SERVER_PORT="$DEFAULT_SERVER_PORT"
export WEB_PORT="$DEFAULT_WEB_PORT"
PRIMARY_URL="http://localhost:${WEB_PORT}/"
API_URL="http://localhost:${SERVER_PORT}"
HEALTH_URL="${API_URL}/api/venues"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

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

show_help() {
  cat <<EOF
Community Event Planner — Interactive launcher

Usage: ./start.sh [all|server|web|db|build]

Commands:
  all     — Start server & web in parallel (recommended first time)
  server  — Start Express server only (port $DEFAULT_SERVER_PORT)
  web     — Start Vite dev server only (port $DEFAULT_WEB_PORT)
  db      — Drop, create, and initialize database
  build   — Run effortless build (regenerates postgres-bootstrap/)
  help    — Show this message

Environment variables:
  DATABASE_URL   (default: $DATABASE_URL)
  SERVER_PORT    (default: $DEFAULT_SERVER_PORT)
  WEB_PORT       (default: $DEFAULT_WEB_PORT)

Examples:
  ./start.sh all          # First time setup (assumes db exists)
  ./start.sh db           # Reinitialize database
  ./start.sh build        # Rebuild postgres-bootstrap/ from rulebook
  ./start.sh server       # Server only
  ./start.sh web          # Web app only

EOF
}

run_build() {
  echo -e "${BLUE}Building postgres-bootstrap schema from rulebook...${NC}"
  npx effortless build
}

run_db() {
  echo -e "${BLUE}Setting up database: $DEFAULT_DB${NC}"

  # Drop if exists
  psql -U postgres -h localhost -d postgres -c "DROP DATABASE IF EXISTS $DEFAULT_DB;"
  psql -U postgres -h localhost -d postgres -c "CREATE DATABASE $DEFAULT_DB;"

  # Run init script
  if [ -f postgres-bootstrap/init-db.sh ]; then
    chmod +x postgres-bootstrap/init-db.sh
    DATABASE_URL="$DATABASE_URL" ./postgres-bootstrap/init-db.sh
    echo -e "${GREEN}✓ Database initialized${NC}"
  else
    echo "postgres-bootstrap/init-db.sh not found. Run './start.sh build' first."
    exit 1
  fi
}

run_server() {
  require_runtime
  echo -e "${BLUE}Starting Express server on port $SERVER_PORT...${NC}"
  stop_port "$SERVER_PORT"
  cd server
  [[ -d node_modules ]] || npm install
  DATABASE_URL="$DATABASE_URL" npm run dev
}

run_web() {
  require_runtime
  echo -e "${BLUE}Starting Vite dev server on port $WEB_PORT...${NC}"
  stop_port "$WEB_PORT"
  cd web
  [[ -d node_modules ]] || npm install
  npm run dev -- --port "$WEB_PORT" --strictPort
}

check_db() {
  psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1
  return $?
}

check_postgres() {
  psql -U postgres -h localhost -d postgres -c "SELECT 1" > /dev/null 2>&1
  return $?
}

run_all() {
  require_runtime
  stop_port "$SERVER_PORT"
  stop_port "$WEB_PORT"
  echo -e "${GREEN}Starting $PROJECT_NAME${NC}"
  echo ""

  printf '%s\n' \
    "Project: $PROJECT_NAME" \
    "Experience: $EXPERIENCE_DESCRIPTION" \
    "Application: $PRIMARY_URL" \
    "API: $API_URL" \
    "Health: $HEALTH_URL"

  # Start server with visible output
  (
    cd server
    [[ -d node_modules ]] || npm install
    echo -e "${GREEN}Express server starting...${NC}"
    DATABASE_URL="$DATABASE_URL" npm run dev 2>&1 | sed 's/^/[SERVER] /'
  ) &
  SERVER_PID=$!

  sleep 3

  # Start web with visible output
  (
    cd web
    [[ -d node_modules ]] || npm install
    echo -e "${GREEN}Vite dev server starting...${NC}"
    npm run dev -- --port "$WEB_PORT" --strictPort 2>&1 | sed 's/^/[WEB] /'
  ) &
  WEB_PID=$!

  trap "kill $SERVER_PID $WEB_PID 2>/dev/null; echo -e '${GREEN}Stopped.${NC}'" EXIT

  wait
}

case "${1:-all}" in
  all)
    run_all
    ;;
  server)
    run_server
    ;;
  web)
    run_web
    ;;
  db)
    run_db
    ;;
  build)
    run_build
    ;;
  help)
    show_help
    ;;
  *)
    echo "Unknown command: $1"
    show_help
    exit 1
    ;;
esac

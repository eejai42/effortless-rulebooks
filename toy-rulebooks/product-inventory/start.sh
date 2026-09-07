#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME='Product Inventory'
EXPERIENCE_DESCRIPTION='View-backed product inventory React application'
START_COMMAND='./start.sh'
PORT_SERVER=3032
PORT_WEB=5175
PRIMARY_URL="http://localhost:${PORT_WEB}/"
API_URL="http://localhost:${PORT_SERVER}"
HEALTH_URL="${API_URL}/api/dev-users"
DATABASE_URL="${DATABASE_URL:-postgresql://postgres@localhost:5432/erb_product_inventory}"
export DATABASE_URL
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

require_runtime() {
  for command_name in node npm psql lsof curl; do
    command -v "$command_name" >/dev/null 2>&1 || fail "Required command '$command_name' was not found."
  done
  [[ -f server/package.json ]] || fail "Required file is missing: $SCRIPT_DIR/server/package.json"
  [[ -f web/package.json ]] || fail "Required file is missing: $SCRIPT_DIR/web/package.json"
  psql "$DATABASE_URL" -c 'SELECT 1' >/dev/null 2>&1 ||
    fail "Required database from DATABASE_URL is unavailable: $DATABASE_URL"
}

stop_port() {
  local port="$1"
  local pids
  pids="$(lsof -ti tcp:"$port" 2>/dev/null || true)"
  if [ -n "$pids" ]; then
    echo "  stopping process(es) on port $port: $pids"
    kill $pids 2>/dev/null || true
    sleep 1
    pids="$(lsof -ti tcp:"$port" 2>/dev/null || true)"
    if [ -n "$pids" ]; then
      kill -9 $pids 2>/dev/null || true
    fi
  fi
}

stop_all() {
  echo "Stopping any running services..."
  stop_port "$PORT_SERVER"
  stop_port "$PORT_WEB"
}

case "${1:-all}" in
  all)
    require_runtime
    stop_all
    (cd "$SCRIPT_DIR/server" && [[ -d node_modules ]] || npm install)
    (cd "$SCRIPT_DIR/web" && [[ -d node_modules ]] || npm install)
    printf '%s\n' \
      "Project: $PROJECT_NAME" \
      "Experience: $EXPERIENCE_DESCRIPTION" \
      "Application: $PRIMARY_URL" \
      "API: $API_URL" \
      "Health: $HEALTH_URL"
    (cd "$SCRIPT_DIR/server" && PORT=$PORT_SERVER npm run dev) &
    (cd "$SCRIPT_DIR/web" && npm run dev -- --port "$PORT_WEB" --strictPort) &
    sleep 2
    curl -fsS "$HEALTH_URL" >/dev/null 2>&1 || fail "API failed to start at $HEALTH_URL"
    wait
    ;;
  server)
    require_runtime
    stop_port "$PORT_SERVER"
    echo "Starting server on port $PORT_SERVER..."
    cd "$SCRIPT_DIR/server"
    [[ -d node_modules ]] || npm install
    PORT=$PORT_SERVER npm run dev
    ;;
  web)
    require_runtime
    stop_port "$PORT_WEB"
    echo "Starting web on port $PORT_WEB..."
    cd "$SCRIPT_DIR/web"
    [[ -d node_modules ]] || npm install
    npm run dev -- --port "$PORT_WEB" --strictPort
    ;;
  stop)
    stop_all
    echo "✓ All services stopped"
    ;;
  *)
    echo "Usage: $0 {all|server|web|stop}"
    echo ""
    echo "  all    - stop and restart server + web (parallel)"
    echo "  server - stop and restart Express server on port $PORT_SERVER"
    echo "  web    - stop and restart Vite dev server on port $PORT_WEB"
    echo "  stop   - stop server + web"
    echo ""
    echo "Build and DB init are separate (run them yourself):"
    echo "  effortless build           - regenerate postgres-bootstrap/"
    echo "  ./postgres-bootstrap/reset-rulebook-db.sh      - drop/recreate DB and apply schema"
    echo ""
    echo "Environment variables:"
    echo "  PORT_SERVER=$PORT_SERVER"
    echo "  PORT_WEB=$PORT_WEB"
    echo "  DATABASE_URL=$DATABASE_URL"
    exit 1
    ;;
esac

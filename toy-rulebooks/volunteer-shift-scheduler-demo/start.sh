#!/usr/bin/env bash
# Volunteer Shift Scheduler — one-command launcher.
# Stops any running instance, ensures the DB exists, (re)installs deps if
# missing, then starts the API + web dev servers and opens a browser.

set -euo pipefail

cd "$(dirname "$0")"

PROJECT_NAME='Volunteer Shift Scheduler Demo'
EXPERIENCE_DESCRIPTION='Hand-built volunteer scheduling comparison application'
START_COMMAND='./start.sh'
PROJECT_DIR="$(pwd)"
DB_NAME="volunteer_shift_scheduler"
API_PORT="${API_PORT:-4017}"
WEB_PORT="${WEB_PORT:-5179}"
PRIMARY_URL="http://localhost:${WEB_PORT}/"
API_URL="http://localhost:${API_PORT}"
HEALTH_URL="${API_URL}/api/events"
LOG_DIR="$PROJECT_DIR/.run"
mkdir -p "$LOG_DIR"
API_LOG="$LOG_DIR/api.log"
WEB_LOG="$LOG_DIR/web.log"
API_PIDFILE="$LOG_DIR/api.pid"
WEB_PIDFILE="$LOG_DIR/web.pid"

c_green() { printf "\033[32m%s\033[0m\n" "$1"; }
c_blue()  { printf "\033[34m%s\033[0m\n" "$1"; }
c_red()   { printf "\033[31m%s\033[0m\n" "$1"; }
c_dim()   { printf "\033[2m%s\033[0m\n" "$1"; }

for command_name in node npm psql pg_isready createdb lsof curl grep; do
  command -v "$command_name" >/dev/null 2>&1 || {
    c_red "Required command '$command_name' was not found."
    exit 1
  }
done
for required_file in schema/generate.mjs server/package.json web/package.json db/schema.sql db/seed.sql; do
  [[ -f "$PROJECT_DIR/$required_file" ]] || {
    c_red "Required file is missing: $PROJECT_DIR/$required_file"
    exit 1
  }
done

stop_pid() {
  local pidfile="$1"
  local label="$2"
  if [[ -f "$pidfile" ]]; then
    local pid
    pid="$(cat "$pidfile" 2>/dev/null || true)"
    if [[ -n "${pid:-}" ]] && kill -0 "$pid" 2>/dev/null; then
      c_dim "Stopping previous $label (pid $pid)..."
      kill "$pid" 2>/dev/null || true
      for _ in 1 2 3 4 5 6 7 8 9 10; do
        kill -0 "$pid" 2>/dev/null || break
        sleep 0.2
      done
      kill -9 "$pid" 2>/dev/null || true
    fi
    rm -f "$pidfile"
  fi
}

stop_port() {
  local port="$1"
  local label="$2"
  local pids
  pids="$(lsof -t -i tcp:"$port" 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    c_dim "Stopping any stray $label on :$port (pids $(echo $pids | tr '\n' ' '))..."
    echo "$pids" | xargs kill 2>/dev/null || true
    sleep 0.4
    pids="$(lsof -t -i tcp:"$port" 2>/dev/null || true)"
    [[ -n "$pids" ]] && echo "$pids" | xargs kill -9 2>/dev/null || true
  fi
}

stop_all() {
  stop_pid "$API_PIDFILE" "API"
  stop_pid "$WEB_PIDFILE" "web"
  stop_port "$API_PORT" "API"
  stop_port "$WEB_PORT" "web"
}

case "${1:-}" in
  stop)
    stop_all
    c_green "Stopped."
    exit 0
    ;;
  build)
    c_blue "Regenerating schema artifacts..."
    node "$PROJECT_DIR/schema/generate.mjs"
    if ! pg_isready -q; then
      c_red "Postgres is not running. Start it and try again."
      exit 1
    fi
    if ! psql -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
      c_blue "Creating database '$DB_NAME'..."
      createdb "$DB_NAME"
    fi
    c_blue "Dropping + recreating schema from generated SQL..."
    psql -q -d "$DB_NAME" -f "$PROJECT_DIR/db/schema.sql" >/dev/null
    psql -q -d "$DB_NAME" -f "$PROJECT_DIR/db/seed.sql"   >/dev/null
    c_green "Build complete. (DDL + types + DAG regenerated, DB rebuilt from seed.)"
    exit 0
    ;;
  typecheck)
    c_blue "Running tsc --noEmit..."
    (cd "$PROJECT_DIR/server" && npx --yes -p typescript@5.5.4 tsc --noEmit -p ./tsconfig.json)
    c_green "Typecheck passed."
    exit 0
    ;;
  restart|"")
    : # default action: restart
    ;;
  *)
    cat <<EOF
Usage: ./start.sh [restart|stop|build|typecheck]
  (no arg)  — restart everything and open the app
  restart   — same as no arg
  stop      — stop the API + web dev server only
  build     — regenerate schema artifacts + drop/recreate the DB
  typecheck — run tsc --noEmit on the server against generated types
EOF
    exit 0
    ;;
esac

# Default flow: always regenerate from the declarative schema before booting,
# so a rule change followed by ./start.sh is always self-consistent.
c_blue "Regenerating schema artifacts from schema/scheduler.schema.mjs..."
node "$PROJECT_DIR/schema/generate.mjs"

# -------- 1. stop existing --------
stop_all

# -------- 2. database --------
if ! command -v psql >/dev/null 2>&1; then
  c_red "psql not found in PATH. Install Postgres first."
  exit 1
fi

if ! pg_isready -q; then
  c_red "Postgres is not running. Start it (e.g., 'brew services start postgresql@16') and try again."
  exit 1
fi

if ! psql -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
  c_blue "Creating database '$DB_NAME'..."
  createdb "$DB_NAME"
fi

# Reset schema + reseed every start so the demo is stable. The DB only holds demo data.
c_blue "Applying schema + seed..."
psql -q -d "$DB_NAME" -f "$PROJECT_DIR/db/schema.sql" >/dev/null
psql -q -d "$DB_NAME" -f "$PROJECT_DIR/db/seed.sql"   >/dev/null

# -------- 3. deps --------
if [[ ! -d "$PROJECT_DIR/server/node_modules" ]]; then
  c_blue "Installing server deps..."
  (cd "$PROJECT_DIR/server" && npm install --silent)
fi
if [[ ! -d "$PROJECT_DIR/web/node_modules" ]]; then
  c_blue "Installing web deps..."
  (cd "$PROJECT_DIR/web" && npm install --silent)
fi

# -------- 4. boot --------
c_blue "Starting API on :$API_PORT..."
(
  cd "$PROJECT_DIR/server"
  PORT="$API_PORT" PGDATABASE="$DB_NAME" nohup node index.js > "$API_LOG" 2>&1 &
  echo $! > "$API_PIDFILE"
)

# wait for API up
for _ in $(seq 1 40); do
  if curl -fsS "http://localhost:$API_PORT/api/events" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done
if ! curl -fsS "http://localhost:$API_PORT/api/events" >/dev/null 2>&1; then
  c_red "API failed to start. See $API_LOG"
  tail -n 30 "$API_LOG" || true
  exit 1
fi
c_green "  API ready at http://localhost:$API_PORT"

c_blue "Starting web on :$WEB_PORT..."
(
  cd "$PROJECT_DIR/web"
  nohup npm run dev -- --port "$WEB_PORT" --strictPort > "$WEB_LOG" 2>&1 &
  echo $! > "$WEB_PIDFILE"
)

# wait for web up
WEB_URL="http://localhost:$WEB_PORT"
for _ in $(seq 1 80); do
  if curl -fsS "$WEB_URL" >/dev/null 2>&1; then break; fi
  sleep 0.25
done
if ! curl -fsS "$WEB_URL" >/dev/null 2>&1; then
  c_red "Web dev server failed to start. See $WEB_LOG"
  tail -n 30 "$WEB_LOG" || true
  exit 1
fi
c_green "  Web ready at $WEB_URL"

# -------- 5. open browser --------
if command -v open >/dev/null 2>&1; then
  open "$WEB_URL"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$WEB_URL"
fi

c_green ""
c_green "Project: $PROJECT_NAME"
c_green "Experience: $EXPERIENCE_DESCRIPTION"
c_green "Application: $PRIMARY_URL"
c_dim   "  health: $HEALTH_URL"
c_dim   "  api : http://localhost:$API_PORT   (logs: $API_LOG)"
c_dim   "  web : $WEB_URL                     (logs: $WEB_LOG)"
c_dim   "Stop with: ./start.sh stop"

#!/bin/bash
# ============================================================================
# start.sh — Launch the Job Search RAG admin stack
# ============================================================================
# Starts three services:
#   1. PostgreSQL database init (if needed)
#   2. Express API server   (port 3001)
#   3. React/Vite dev server (port 5173)
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
PROJECT_NAME='Job Search RAG'
EXPERIENCE_DESCRIPTION='Job-search administration React application'
START_COMMAND='./start.sh'
SERVER_PORT=3001
WEB_PORT=5173
PRIMARY_URL="http://localhost:${WEB_PORT}/"
API_URL="http://localhost:${SERVER_PORT}"
HEALTH_URL="${API_URL}/api/meta"
DATABASE_URL="${DATABASE_URL:-postgresql://postgres@localhost:5432/erb_job_search_rag}"
export DATABASE_URL

# ---------- colors ----------
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

info()  { echo -e "${GREEN}[start]${NC} $*"; }
warn()  { echo -e "${YELLOW}[start]${NC} $*"; }

# ---------- dependency checks ----------
for cmd in node npm psql lsof curl; do
  if ! command -v "$cmd" &>/dev/null; then
    warn "Required command '$cmd' not found. Please install it first."
    exit 1
  fi
done
[[ -f "$SCRIPT_DIR/admin/package.json" ]] || {
  warn "Required file is missing: $SCRIPT_DIR/admin/package.json"
  exit 1
}
[[ -f "$SCRIPT_DIR/admin/client/package.json" ]] || {
  warn "Required file is missing: $SCRIPT_DIR/admin/client/package.json"
  exit 1
}
psql "$DATABASE_URL" -c 'SELECT 1' >/dev/null 2>&1 || {
  warn "Required database from DATABASE_URL is unavailable: $DATABASE_URL"
  exit 1
}

# ---------- install node deps if needed ----------
if [ ! -d "$SCRIPT_DIR/admin/node_modules" ]; then
  info "Installing admin server dependencies..."
  (cd "$SCRIPT_DIR/admin" && npm install)
fi

if [ ! -d "$SCRIPT_DIR/admin/client/node_modules" ]; then
  info "Installing admin client dependencies..."
  (cd "$SCRIPT_DIR/admin/client" && npm install)
fi

# ---------- clean restart on declared ports ----------
for port in "$SERVER_PORT" "$WEB_PORT"; do
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    kill $pids
    sleep 1
    pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    [[ -z "$pids" ]] || kill -9 $pids
  fi
done

# ---------- cleanup on exit ----------
cleanup() {
  info "Shutting down..."
  kill $SERVER_PID $CLIENT_PID 2>/dev/null
  wait $SERVER_PID $CLIENT_PID 2>/dev/null
  info "Done."
}
trap cleanup EXIT INT TERM

# ---------- start Express API server ----------
info "Starting Express API server on :$SERVER_PORT..."
(cd "$SCRIPT_DIR/admin" && PORT="$SERVER_PORT" DATABASE_URL="$DATABASE_URL" npm run server) &
SERVER_PID=$!

# ---------- start Vite dev server ----------
info "Starting React dev server on :$WEB_PORT..."
(cd "$SCRIPT_DIR/admin/client" && npm run dev -- --port "$WEB_PORT" --strictPort) &
CLIENT_PID=$!

for _ in $(seq 1 60); do
  if curl -fsS "$HEALTH_URL" >/dev/null 2>&1 && curl -fsS "$PRIMARY_URL" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done
curl -fsS "$HEALTH_URL" >/dev/null 2>&1 || {
  warn "API failed to start at $HEALTH_URL"
  exit 1
}
curl -fsS "$PRIMARY_URL" >/dev/null 2>&1 || {
  warn "Web app failed to start at $PRIMARY_URL"
  exit 1
}

echo ""
info "Project: $PROJECT_NAME"
info "Experience: $EXPERIENCE_DESCRIPTION"
info "Application: $PRIMARY_URL"
info "API: $API_URL"
info "Health: $HEALTH_URL"
info "Press Ctrl+C to stop all services."
echo ""

# Wait for either process to exit
wait $SERVER_PID $CLIENT_PID

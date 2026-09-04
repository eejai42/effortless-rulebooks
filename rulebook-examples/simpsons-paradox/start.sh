#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

PROJECT_NAME='simpsons-paradox'
EXPERIENCE_DESCRIPTION='Witnessed Simpson’s paradox discovery explorer'
START_COMMAND='./start.sh'
API_PORT=3001
WEB_PORT=5173
PRIMARY_URL="http://localhost:${WEB_PORT}/discovery"
HEALTH_URL="http://localhost:${API_PORT}/api/studies"

die() { echo "[start] ERROR: $*" >&2; exit 1; }
for command in npm psql lsof curl; do
  command -v "$command" >/dev/null 2>&1 || die "$command is required"
done
for file in app/backend/package.json app/backend/server.ts \
  app/frontend/package.json app/frontend/vite.config.ts \
  effortless-rulebook/simpsons-paradox-rulebook.json; do
  [ -f "$file" ] || die "missing required file: $SCRIPT_DIR/$file"
done

# Preflight: fail loudly with the right fix, not with an obscure DB error
# once the servers are already up.
DATABASE_URL="${DATABASE_URL:-postgresql://postgres@localhost:5432/simpsons_paradox}"
export DATABASE_URL
if ! psql "$DATABASE_URL" -c '\q' 2>/dev/null; then
  echo "[start] ERROR: cannot connect to $DATABASE_URL" >&2
  echo "[start] Is Postgres running, and has 'effortless build && cd effortless-postgres && ./init-db.sh' been run yet?" >&2
  exit 1
fi
if ! psql "$DATABASE_URL" -tAc "SELECT to_regclass('public.vw_studies')" 2>/dev/null | grep -q vw_studies; then
  echo "[start] ERROR: $DATABASE_URL has no vw_studies view." >&2
  echo "[start] Run 'effortless build' then 'cd effortless-postgres && ./init-db.sh' before starting the app." >&2
  exit 1
fi

# Kill only listeners on the declared app ports.
for PORT in "$API_PORT" "$WEB_PORT"; do
  pids="$(lsof -nP -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)"
  if [ -n "$pids" ]; then
    echo "[start] freeing declared port $PORT (PIDs: $(echo "$pids" | tr '\n' ' '))"
    # shellcheck disable=SC2086
    kill $pids
    sleep 1
  fi
  pids="$(lsof -nP -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)"
  if [ -n "$pids" ]; then
    # shellcheck disable=SC2086
    kill -KILL $pids
    sleep 1
  fi
  [ -z "$(lsof -nP -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)" ] \
    || die "port $PORT is still occupied"
done

cd "$SCRIPT_DIR/app/backend"
[ -d node_modules ] || npm install --no-audit --no-fund
echo "[start] booting backend on :$API_PORT…"
PROJECT_NAME="$PROJECT_NAME" PORT="$API_PORT" npx tsx server.ts &
BACKEND_PID=$!

# Frontend
cd "$SCRIPT_DIR/app/frontend"
[ -d node_modules ] || npm install --no-audit --no-fund

for _ in $(seq 1 40); do
  curl -sf "$HEALTH_URL" >/dev/null 2>&1 && break
  sleep 0.25
done
curl -sf "$HEALTH_URL" >/dev/null 2>&1 \
  || die "backend did not become healthy at $HEALTH_URL"

echo "[start] booting Vite on :$WEB_PORT…"
npm run dev -- --port "$WEB_PORT" --strictPort &
FRONTEND_PID=$!

echo ""
echo "[start] project: $PROJECT_NAME"
echo "[start] starting: $EXPERIENCE_DESCRIPTION"
echo "[start] primary:  $PRIMARY_URL"
echo "[start] API:      http://localhost:$API_PORT"
echo "[start] health:   $HEALTH_URL"
echo ""

# Keep script alive; Ctrl-C kills both
cleanup() {
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM
wait "$BACKEND_PID" "$FRONTEND_PID"

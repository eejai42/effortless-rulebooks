#!/usr/bin/env bash
# Start the First Valley Bank portal: Express backend + Vite frontend.
# Installs deps on first run, then runs both in parallel. Ctrl-C stops both.
# Always frees its ports first, so this is a clean stop-then-restart.

set -euo pipefail
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

PROJECT_NAME='effortless-banking'
EXPERIENCE_DESCRIPTION='First Valley Bank relationship-management portal'
START_COMMAND='./start.sh'
BACKEND_PORT=8375
FRONTEND_PORT=8376
PRIMARY_URL="http://localhost:${FRONTEND_PORT}"
HEALTH_URL="http://localhost:${BACKEND_PORT}/api/health"
export PORT="$BACKEND_PORT"
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres@localhost:5432/erb_effortless_banking}"

die() { echo "[start] ERROR: $*" >&2; exit 1; }

for command in npm psql lsof curl; do
  command -v "$command" >/dev/null 2>&1 || die "$command is required"
done
for file in webapp/backend/package.json webapp/backend/server.js \
  webapp/frontend/package.json webapp/frontend/vite.config.js \
  effortless-rulebook/effortless-banking-rulebook.json; do
  [ -f "$file" ] || die "missing required file: $PROJECT_ROOT/$file"
done
view_ready="$(psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -tAc \
  "SELECT 1 FROM information_schema.views WHERE table_schema='public' AND table_name='vw_users' LIMIT 1" \
  2>/dev/null || true)"
[ "$view_ready" = "1" ] \
  || die "$DATABASE_URL is unavailable or missing vw_users; load the committed postgres artifacts first"

# Kill anything already on the ports (clean restart).
for port in "$BACKEND_PORT" "$FRONTEND_PORT"; do
  pids_on_port="$(lsof -nP -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [ -n "$pids_on_port" ]; then
    echo "[start] freeing declared port $port (PIDs: $(echo "$pids_on_port" | tr '\n' ' '))"
    # shellcheck disable=SC2086
    kill $pids_on_port
    sleep 1
    pids_on_port="$(lsof -nP -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    if [ -n "$pids_on_port" ]; then
      # shellcheck disable=SC2086
      kill -KILL $pids_on_port
      sleep 1
    fi
  fi
  [ -z "$(lsof -nP -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)" ] \
    || die "port $port is still occupied"
done

[ -d webapp/backend/node_modules ]  || ( echo "[start] installing backend deps…"  && cd webapp/backend  && npm install --no-audit --no-fund )
[ -d webapp/frontend/node_modules ] || ( echo "[start] installing frontend deps…" && cd webapp/frontend && npm install --no-audit --no-fund )

pids=()
cleanup() { echo; echo "[start] shutting down…"; for p in "${pids[@]}"; do kill "$p" 2>/dev/null || true; done; wait 2>/dev/null || true; }
trap cleanup INT TERM EXIT

echo "[start] project: $PROJECT_NAME"
echo "[start] starting: $EXPERIENCE_DESCRIPTION"
echo "[start] primary:  $PRIMARY_URL"
echo "[start] backend:  http://localhost:$BACKEND_PORT"
echo "[start] health:   $HEALTH_URL"
( cd webapp/backend  && npm run dev ) & pids+=($!)

for _ in $(seq 1 40); do
  curl -sf "$HEALTH_URL" >/dev/null 2>&1 && break
  sleep 0.25
done
curl -sf "$HEALTH_URL" >/dev/null 2>&1 \
  || die "backend did not become healthy at $HEALTH_URL"

( cd webapp/frontend && npm run dev ) & pids+=($!)

wait

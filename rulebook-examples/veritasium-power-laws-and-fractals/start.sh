#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

PROJECT_NAME='veritasium-power-laws-and-fractals'
EXPERIENCE_DESCRIPTION='Power-law systems gallery with log-log plots from the views'
START_COMMAND='./start.sh'
API_PORT=43305
WEB_PORT=43105
PRIMARY_URL="http://localhost:${WEB_PORT}"
HEALTH_URL="http://localhost:${API_PORT}/api/views"
export PGHOST="${PGHOST:-localhost}"
export PGUSER="${PGUSER:-postgres}"
export PGPORT="${PGPORT:-5432}"
export PGDATABASE="${PGDATABASE:-erb_veritasium_power_laws_and_fractals}"
export PGPASSWORD="${PGPASSWORD:-postgres}"

die() { echo "[start] ERROR: $*" >&2; exit 1; }

for command in npm psql lsof; do
  command -v "$command" >/dev/null 2>&1 || die "$command is required"
done
for file in app/package.json app/server.js app/vite.config.js \
  effortless-rulebook/effortless-rulebook.json; do
  [ -f "$file" ] || die "missing required file: $PROJECT_ROOT/$file"
done

view_ready="$(psql -d "$PGDATABASE" -v ON_ERROR_STOP=1 -tAc \
  "SELECT 1 FROM information_schema.views WHERE table_schema='public' AND table_name LIKE 'vw\\_%' LIMIT 1" \
  2>/dev/null || true)"
[ "$view_ready" = "1" ] \
  || die "database $PGDATABASE at $PGHOST:$PGPORT is unavailable or has no vw_* views; run ./reset-rulebook-db.sh (or effortless build) first"

for port in "$API_PORT" "$WEB_PORT"; do
  pids="$(lsof -nP -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [ -n "$pids" ]; then
    echo "[start] freeing declared port $port (PIDs: $(echo "$pids" | tr '\n' ' '))"
    # shellcheck disable=SC2086
    kill $pids
    sleep 1
  fi
  pids="$(lsof -nP -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [ -n "$pids" ]; then
    # shellcheck disable=SC2086
    kill -KILL $pids
    sleep 1
  fi
  [ -z "$(lsof -nP -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)" ] \
    || die "port $port is still occupied"
done

[ -d app/node_modules ] || (cd app && npm install --no-audit --no-fund)

echo "[start] project: $PROJECT_NAME"
echo "[start] starting: $EXPERIENCE_DESCRIPTION"
echo "[start] primary:  $PRIMARY_URL"
echo "[start] API:      http://localhost:${API_PORT}"
echo "[start] health:   $HEALTH_URL"
exec npm --prefix app run dev

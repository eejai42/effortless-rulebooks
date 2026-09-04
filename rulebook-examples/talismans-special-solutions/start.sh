#!/usr/bin/env bash
# ============================================================================
# Talisman's Special Solutions workflow app — one-command run.
#
# Per repo doctrine, start.sh is the restart story: it kills whatever is on its
# ports first, then boots clean. Two modes:
#
#   ./start.sh          dev:  Express API (:8088) + Vite dev server (:5173)
#                             open http://localhost:5173
#   ./start.sh prod     prod: build the frontend, then Express serves API +
#                             static UI together on :8088
#                             open http://localhost:8088
#
# The reasoner (Python: rdflib/owlrl/pyshacl) is invoked by the backend per
# request — there is no separate reasoner process to manage. It reads the
# GENERATED owl/src/*.ttl, so `effortless build` must have run at least once.
# ============================================================================
set -euo pipefail

# This script lives at the talismans-special-solutions project root; the web app lives in app/.
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$HERE"
cd "$PROJECT_ROOT"
PROJECT_NAME='talismans-special-solutions'
EXPERIENCE_DESCRIPTION='Workflow ontology release console with Postgres and OWL/SHACL engines'
START_COMMAND='./start.sh'
BACKEND="$HERE/app/backend"
FRONTEND="$HERE/app/frontend"
MODE="${1:-dev}"
API_PORT="${PORT:-8088}"
WEB_PORT="${WEB_PORT:-5173}"
if [ "$MODE" = "prod" ]; then
  PRIMARY_URL="http://localhost:${API_PORT}"
else
  PRIMARY_URL="http://localhost:${WEB_PORT}"
fi
HEALTH_URL="http://localhost:${API_PORT}/api/health"

die() { echo "[start] ERROR: $*" >&2; exit 1; }
for command in npm python3 lsof curl; do
  command -v "$command" >/dev/null 2>&1 || die "$command is required"
done
for file in app/backend/package.json app/backend/server.ts app/backend/db.json \
  app/backend/reasoner/requirements.txt app/frontend/package.json \
  app/frontend/vite.config.js \
  effortless-rulebook/talismans-special-solutions-rulebook.json; do
  [ -f "$PROJECT_ROOT/$file" ] || die "missing required file: $PROJECT_ROOT/$file"
done

# --- preflight: the reasoner needs the generated ontology -------------------
# These artifacts are COMMITTED, so a fresh clone already has them and this block
# never fires. It only triggers if someone deleted the generated owl/src/*.ttl —
# in which case the fix is a rebuild, and we make that recovery one copy/paste,
# not a dead end.
for f in ontology.owl rules.shacl.ttl; do
  if [ ! -f "$PROJECT_ROOT/owl/src/$f" ]; then
    echo "ERROR: missing $PROJECT_ROOT/owl/src/$f" >&2
    echo "These files are normally committed; a clean clone has them. To regenerate:" >&2
    echo "" >&2
    if command -v effortless >/dev/null 2>&1; then
      echo "    cd \"$PROJECT_ROOT\" && effortless build" >&2
    else
      echo "  The 'effortless' CLI is not installed. Install it, then rebuild:" >&2
      echo "    npm install -g ssotme        # ships 'effortless'/'ssotme'/'aic' bins" >&2
      echo "    cd \"$PROJECT_ROOT\" && effortless build" >&2
      echo "" >&2
      echo "  (Or just restore the committed artifacts — no CLI needed:" >&2
      echo "    git checkout -- owl/src/ )" >&2
    fi
    exit 1
  fi
done

# --- preflight: python reasoner deps ---------------------------------------
if ! python3 -c "import rdflib, owlrl, pyshacl" 2>/dev/null; then
  echo "Installing reasoner deps (rdflib/owlrl/pyshacl)…" >&2
  python3 -m pip install -q -r "$BACKEND/reasoner/requirements.txt"
fi

# --- kill anything already on the ports (clean restart) --------------------
kill_port() {
  local port="$1"
  local pids
  pids="$(lsof -nP -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [ -n "$pids" ]; then
    echo "Freeing declared port $port (PIDs: $(echo "$pids" | tr '\n' ' '))" >&2
    # shellcheck disable=SC2086
    kill $pids
    sleep 1
    pids="$(lsof -nP -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    if [ -n "$pids" ]; then
      # shellcheck disable=SC2086
      kill -KILL $pids
      sleep 1
    fi
  fi
  [ -z "$(lsof -nP -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)" ] \
    || die "port $port is still occupied"
}

# --- deps ------------------------------------------------------------------
# Always run npm install (idempotent when satisfied) so newly-added TypeScript /
# router deps are present after a conversion — not just on first boot.
(cd "$BACKEND"  && npm install)
(cd "$FRONTEND" && npm install)

if [ "$MODE" = "prod" ]; then
  kill_port "$API_PORT"
  echo "Building frontend…"
  (cd "$FRONTEND" && npm run build)
  echo "[start] project: $PROJECT_NAME"
  echo "[start] starting: $EXPERIENCE_DESCRIPTION"
  echo "[start] primary:  $PRIMARY_URL"
  echo "[start] health:   $HEALTH_URL"
  cd "$BACKEND" && PORT="$API_PORT" exec npx tsx server.ts
elif [ "$MODE" = "dev" ]; then
  kill_port "$API_PORT"
  kill_port "$WEB_PORT"
  echo "[start] project: $PROJECT_NAME"
  echo "[start] starting: $EXPERIENCE_DESCRIPTION"
  echo "[start] primary:  $PRIMARY_URL"
  echo "[start] API:      http://localhost:$API_PORT"
  echo "[start] health:   $HEALTH_URL"
  ( cd "$BACKEND" && PROJECT_NAME="$PROJECT_NAME" PORT="$API_PORT" npx tsx server.ts ) &
  API_PID=$!
  trap 'kill $API_PID 2>/dev/null || true' EXIT INT TERM
  for _ in $(seq 1 80); do
    curl -sf "$HEALTH_URL" >/dev/null 2>&1 && break
    sleep 0.25
  done
  curl -sf "$HEALTH_URL" >/dev/null 2>&1 \
    || die "backend did not become healthy at $HEALTH_URL"
  cd "$FRONTEND" && BACKEND_URL="http://localhost:$API_PORT" exec npx vite --port "$WEB_PORT" --strictPort
else
  die "usage: ./start.sh [dev|prod]"
fi

#!/usr/bin/env bash
# start.sh -- stop/restart the traffic-ticket-contest rulebook editor app.
#
# Delegates to effortless-rulebook/edit-rulebook.local.sh, a project-local fork
# of the generated edit-rulebook.sh that uses a project-pinned container name
# and ports (42451/42452/5452) instead of the shared defaults (42441/42442/5442),
# so this project doesn't fight other rulebook-editor instances for the same
# container name/ports. It already force-removes its own container before
# booting fresh -- restart is always this one command.
#
# UI:   http://localhost:42452
# API:  http://localhost:42451/api/docs
# PG:   postgresql://postgres:postgres@localhost:5452/effortless-rulebook

set -euo pipefail
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

PROJECT_NAME='traffic-ticket-contest'
EXPERIENCE_DESCRIPTION='Generated browser rulebook editor for the traffic-ticket state machines'
START_COMMAND='./start.sh'
API_PORT=42451
UI_PORT=42452
PG_PORT=5452
PRIMARY_URL="http://localhost:${UI_PORT}"
HEALTH_URL="http://localhost:${API_PORT}/api/state"

die() { echo "[start] ERROR: $*" >&2; exit 1; }
for command in docker lsof; do
  command -v "$command" >/dev/null 2>&1 || die "$command is required"
done
docker info >/dev/null 2>&1 || die "Docker daemon is unavailable"
for file in effortless-rulebook/edit-rulebook.local.sh \
  effortless-rulebook/docker/Dockerfile \
  effortless-rulebook/traffic-ticket-contest-rulebook.json; do
  [ -f "$file" ] || die "missing required file: $PROJECT_ROOT/$file"
done

# This project owns these three declared ports. Remove only containers
# publishing one of them, then terminate only remaining listeners on them.
for port in "$API_PORT" "$UI_PORT" "$PG_PORT"; do
  container_ids="$(docker ps -q --filter "publish=$port")"
  if [ -n "$container_ids" ]; then
    echo "[start] removing container(s) publishing declared port $port"
    # shellcheck disable=SC2086
    docker rm -f $container_ids >/dev/null
  fi
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

echo "[start] project: $PROJECT_NAME"
echo "[start] starting: $EXPERIENCE_DESCRIPTION"
echo "[start] primary:  $PRIMARY_URL"
echo "[start] API docs: http://localhost:${API_PORT}/api/docs"
echo "[start] health:   $HEALTH_URL"
echo "[start] Postgres: postgresql://postgres:postgres@localhost:${PG_PORT}/effortless-rulebook"

cd "$PROJECT_ROOT/effortless-rulebook"
exec bash edit-rulebook.local.sh

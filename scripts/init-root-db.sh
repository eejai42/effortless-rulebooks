#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
INIT_SCRIPT="$REPO_ROOT/postgres/init-db.sh"
DATABASE_NAME="erb_effortless_rulebooks"
DATABASE_URL="postgresql://postgres@localhost:5432/$DATABASE_NAME"

command -v psql >/dev/null 2>&1 || {
  echo "ERROR: psql is required to initialize $DATABASE_NAME." >&2
  exit 1
}

[[ -f "$INIT_SCRIPT" ]] || {
  echo "ERROR: Expected generated initializer is missing: $INIT_SCRIPT" >&2
  exit 1
}

# The generated 01-*.sql runs in check-add mode (CREATE TABLE IF NOT EXISTS, no
# DROP, even with drop_all=true), so rows whose primary keys were removed from the
# rulebook would otherwise survive every rebuild and silently pollute rollups.
# The local database is a derived artifact: recreate it from scratch each time.
echo "Recreating root database: $DATABASE_NAME"
psql -v ON_ERROR_STOP=1 -Atqc "DROP DATABASE IF EXISTS $DATABASE_NAME WITH (FORCE);" postgres
psql -v ON_ERROR_STOP=1 -Atqc "CREATE DATABASE $DATABASE_NAME;" postgres

echo "Initializing root database: $DATABASE_URL"
env DATABASE_URL="$DATABASE_URL" bash "$INIT_SCRIPT"

# The generated editor container watches the rulebook, but Docker Desktop does not
# always propagate host file events through the bind mount, so a host-side build
# can leave the editor API serving stale rows. If the root's editor is running on
# its pinned API port, request an explicit rebuild through the container's trigger.
EDITOR_API_PORT="42441"
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  editor_container="$(docker ps -q --filter "publish=$EDITOR_API_PORT")"
  if [[ -n "$editor_container" ]]; then
    echo "Requesting rebuild of the editor container publishing :$EDITOR_API_PORT"
    docker exec "$editor_container" touch /tmp/rebuild-trigger
  fi
fi

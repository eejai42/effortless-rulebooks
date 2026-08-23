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

database_exists="$(psql -Atqc "SELECT 1 FROM pg_database WHERE datname = '$DATABASE_NAME';" postgres)"
[[ "$database_exists" == "1" ]] || {
  echo "ERROR: Expected local database does not exist: $DATABASE_NAME" >&2
  echo "Create it explicitly with: createdb $DATABASE_NAME" >&2
  exit 1
}

echo "Initializing root database: $DATABASE_URL"
exec env DATABASE_URL="$DATABASE_URL" bash "$INIT_SCRIPT"

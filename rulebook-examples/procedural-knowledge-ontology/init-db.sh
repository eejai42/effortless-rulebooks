#!/usr/bin/env bash
# Load this project's local database from the generated postgres-bootstrap/ output.
# The generated init-db.sh derives its default URL from ERB_DOMAIN, so the URL is fixed here.
# This project's init validates access-control predicates against the live schema before
# loading, so the database is created when missing but never dropped (same as ./start.sh db).
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INIT_SCRIPT="$SCRIPT_DIR/postgres-bootstrap/init-db.sh"
DATABASE_NAME="erb_procedural_knowledge_ontology"
DATABASE_URL="postgresql://postgres@localhost:5432/$DATABASE_NAME"
command -v psql >/dev/null 2>&1 || { echo "ERROR: psql is required to initialize $DATABASE_NAME." >&2; exit 1; }
[[ -f "$INIT_SCRIPT" ]] || { echo "ERROR: expected generated initializer is missing: $INIT_SCRIPT" >&2; exit 1; }
if [[ "$(psql -Atqc "SELECT 1 FROM pg_database WHERE datname = '$DATABASE_NAME';" postgres)" != "1" ]]; then
  echo "Creating database: $DATABASE_NAME"
  psql -v ON_ERROR_STOP=1 -Atqc "CREATE DATABASE $DATABASE_NAME;" postgres
fi
exec env DATABASE_URL="$DATABASE_URL" bash "$INIT_SCRIPT"

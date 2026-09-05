#!/usr/bin/env bash
# Recreate and load this project's local database from the generated postgres/ output.
# The generated 01-*.sql is check-add (no DROP), so the database is recreated every time.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INIT_SCRIPT="$SCRIPT_DIR/postgres/init-db.sh"
DATABASE_NAME="erb_naive_set_theory"
DATABASE_URL="postgresql://postgres@localhost:5432/$DATABASE_NAME"
command -v psql >/dev/null 2>&1 || { echo "ERROR: psql is required to initialize $DATABASE_NAME." >&2; exit 1; }
[[ -f "$INIT_SCRIPT" ]] || { echo "ERROR: expected generated initializer is missing: $INIT_SCRIPT" >&2; exit 1; }
echo "Recreating database: $DATABASE_NAME"
psql -v ON_ERROR_STOP=1 -Atqc "DROP DATABASE IF EXISTS $DATABASE_NAME WITH (FORCE);" postgres
psql -v ON_ERROR_STOP=1 -Atqc "CREATE DATABASE $DATABASE_NAME;" postgres
exec env DATABASE_URL="$DATABASE_URL" bash "$INIT_SCRIPT"

#!/bin/bash
set -e
set -o pipefail

# inject-substrate.sh for effortless-postgres execution substrate
#
# For Effortless-licensed substrates, we run effortless -buildLocal to regenerate
# from the rulebook. This allows postgres to be rebuilt independently
# without rebuilding all other substrates.
#
# Structure:
#   /licensed-effortless-tools/postgres/     - Effortless transpiler output (SQL files)
#   /execution-substrates/effortless-postgres/  - Test runner (this folder)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# ERB_DOMAIN_DIR is required. The legacy global location at
# licensed-effortless-tools/postgres is dead — different domains have different
# SQL and silently picking the wrong one masks real schema bugs as 100%.
if [ -z "$ERB_DOMAIN_DIR" ] || [ ! -d "$ERB_DOMAIN_DIR/postgres-bootstrap" ]; then
    echo "FATAL: ERB_DOMAIN_DIR is not set or its postgres-bootstrap/ subdir is missing." >&2
    echo "  ERB_DOMAIN_DIR=${ERB_DOMAIN_DIR:-<unset>}" >&2
    echo "  Expected postgres dir at: \$ERB_DOMAIN_DIR/postgres-bootstrap" >&2
    echo "  Invoke this script via the orchestrator, which sets ERB_DOMAIN_DIR" >&2
    echo "  to rulebook-examples/<active-domain>." >&2
    exit 1
fi
POSTGRES_SSOTME_DIR="$ERB_DOMAIN_DIR/postgres-bootstrap"

echo "=== Effortless-PostgreSQL Substrate: Regenerating from rulebook ==="
echo "  Postgres dir: $POSTGRES_SSOTME_DIR"

if command -v effortless &> /dev/null; then
    cd "$POSTGRES_SSOTME_DIR"
    effortless -buildLocal
else
    echo "Warning: effortless CLI not installed, skipping regeneration"
    echo "Install effortless or run 'effortless build' from project root"
fi

# Initialise the local Postgres DB from the freshly-generated SQL so the
# vw_* views reflect the current rulebook before take-test queries them.
# init-db.sh targets a per-domain database; create it on demand so each
# domain owns its own pristine schema.
if [ -f "$POSTGRES_SSOTME_DIR/init-db.sh" ]; then
    DB_NAME=$(grep -oE 'localhost:[0-9]+/[a-zA-Z0-9_-]+' "$POSTGRES_SSOTME_DIR/init-db.sh" | head -1 | sed 's/.*\///')
    if [ -n "$DB_NAME" ]; then
        if ! psql -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null | grep -q 1; then
            echo "  Creating database '$DB_NAME'..."
            createdb -U postgres "$DB_NAME" || psql -U postgres -d postgres -c "CREATE DATABASE \"$DB_NAME\";"
        fi
    fi
    echo "  Re-initializing database from $POSTGRES_SSOTME_DIR/init-db.sh"
    bash "$POSTGRES_SSOTME_DIR/init-db.sh" 2>&1 | tail -10
fi

cd "$SCRIPT_DIR"

# Run the test for this substrate
"$SCRIPT_DIR/take-test.sh"

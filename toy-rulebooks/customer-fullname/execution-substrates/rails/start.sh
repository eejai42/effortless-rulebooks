#!/bin/bash
set -e

cd "$(dirname "$0")"

# Port is the first argument (default 8002). Rails for this demo lives in the
# 8000s (Vite is in the 7000s); port 3000 is NOT part of this demo. Override by
# passing a port — it reads the same canonical DB regardless:
#   ./start.sh 8003
PORT="${1:-8002}"

# Use the Ruby pinned in .ruby-version (3.2.x) via rbenv. Without this, a plain
# shell falls through to system Ruby (2.6) and dies with
# "Could not find 'bundler' (2.4.1)". We initialise rbenv here so the app boots
# regardless of whether the interactive shell has rbenv on PATH.
if command -v rbenv >/dev/null 2>&1; then
  eval "$(rbenv init - bash)"
elif [ -x "$HOME/.rbenv/bin/rbenv" ]; then
  export PATH="$HOME/.rbenv/bin:$PATH"
  eval "$("$HOME/.rbenv/bin/rbenv" init - bash)"
fi

# Rails' app loader byte-matches files under the project path; a C/POSIX locale
# trips "invalid byte sequence in US-ASCII" on any non-ASCII byte. Force UTF-8.
export LANG=${LANG:-en_US.UTF-8}
export LC_ALL=${LC_ALL:-en_US.UTF-8}

# Create .env if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
fi

# Set defaults (no need to parse .env, just use these)
export RAILS_ENV=${RAILS_ENV:-development}
export DB_HOST=${DB_HOST:-localhost}
export DB_PORT=${DB_PORT:-5432}
export DB_USER=${DB_USER:-postgres}
export DB_PASSWORD=${DB_PASSWORD:-}
# Point Rails at THE canonical domain database — the same erb_customer_fullname
# that postgres-bootstrap/reset-rulebook-db.sh builds (matches postgres-bootstrap/effortless.env
# and server.js). Rails is a read substrate here: it consumes the vw_<entity> views
# the bootstrap already materialised. It does NOT own schema/views/seed data — the
# rulebook -> postgres-bootstrap pipeline is the single source of truth for those.
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/erb_customer_fullname"

# The view is the contract: fail loudly if the canonical DB hasn't been bootstrapped
# yet, rather than silently booting against an empty/missing database.
echo "Verifying canonical database (erb_customer_fullname) is bootstrapped..."
if ! psql "$DATABASE_URL" -tc "SELECT 1 FROM pg_views WHERE viewname = 'vw_customers'" 2>/dev/null | grep -q 1; then
  echo "ERROR: vw_customers not found in erb_customer_fullname." >&2
  echo "Run the postgres bootstrap first:  (cd ../../postgres-bootstrap && ./reset-rulebook-db.sh)" >&2
  exit 1
fi

# Clean restart: kill whatever is already on this port (start.sh is the restart
# story — no kill-then-start ritual for the user). Per-port PID file so multiple
# instances on different ports don't clobber each other's pidfile.
lsof -nP -iTCP:"$PORT" -sTCP:LISTEN -t 2>/dev/null | xargs -r kill 2>/dev/null || true

# Start Rails server
echo "Starting Rails server on http://localhost:$PORT"
exec bundle exec rails server -b 0.0.0.0 -p "$PORT" -P "tmp/pids/server-$PORT.pid"

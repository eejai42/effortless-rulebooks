#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "======================================"
echo " Customer Tracker — Starting up"
echo "======================================"

# ── 0. Stop any existing services on our ports ─────────────────────────────
echo ""
echo "[ 0/5 ] Stopping existing services on ports 3001 and 5173..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
echo "Ports are now available."

# ── 1. Rebuild the Effortless pipeline ──────────────────────────────────────
echo ""
echo "[ 1/5 ] Building Effortless rulebook..."
(cd "$SCRIPT_DIR/effortless-rulebook" && effortless build)

echo ""
echo "[ 2/5 ] Generating SQL from rulebook..."
(cd "$SCRIPT_DIR/postgres" && effortless build)

# ── 2. Ensure the database exists ───────────────────────────────────────────
echo ""
echo "[ 3/5 ] Ensuring database exists and loading schema/data..."
createdb effortless-rulebook-demo 2>/dev/null || true
chmod +x "$SCRIPT_DIR/postgres/reset-rulebook-db.sh"
(cd "$SCRIPT_DIR/postgres" && ./reset-rulebook-db.sh)

# ── 3. Install dependencies ──────────────────────────────────────────────────
echo ""
echo "[ 4/5 ] Installing dependencies..."
(cd "$SCRIPT_DIR/backend"  && npm install --silent)
(cd "$SCRIPT_DIR/frontend" && npm install --silent)

# ── 4. Start backend + frontend ──────────────────────────────────────────────
echo ""
echo "[ 5/5 ] Starting backend (port 3001) and frontend (port 5173)..."

# Start backend
node "$SCRIPT_DIR/backend/server.js" &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Give backend a moment to start
sleep 1

# Start frontend (vite preview uses built output; use dev for hot-reload)
(cd "$SCRIPT_DIR/frontend" && npx vite --port 5173 --host) &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "======================================"
echo " App is running!"
echo "  Backend:  http://localhost:3001"
echo "  Frontend: http://localhost:5173"
echo "  Press Ctrl-C to stop."
echo "======================================"

# Wait for either process to exit; on Ctrl-C kill both
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM

wait $BACKEND_PID $FRONTEND_PID

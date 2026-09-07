#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "=================================================="
echo "  Client & Invoice Tracker — Start Script"
echo "=================================================="

# ── 1. Effortless build (regenerate SQL from rulebook) ──
echo ""
echo "[1/4] Running effortless build pipeline..."
cd "$PROJECT_DIR/effortless-rulebook"
effortless build
cd "$PROJECT_DIR/postgres"
effortless build

# ── 2. Init database ──
echo ""
echo "[2/4] Initializing database..."
chmod +x "$PROJECT_DIR/postgres/reset-rulebook-db.sh"
"$PROJECT_DIR/postgres/reset-rulebook-db.sh"

# ── 3. Install dependencies ──
echo ""
echo "[3/4] Installing dependencies..."
cd "$PROJECT_DIR/backend"
npm install --silent

cd "$PROJECT_DIR/frontend"
npm install --silent

# ── 4. Start backend + frontend ──
echo ""
echo "[4/4] Starting backend and frontend..."

# Kill any old instances on our ports
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start backend
cd "$PROJECT_DIR/backend"
node server.js &
BACKEND_PID=$!
echo "Backend started (PID $BACKEND_PID) on http://localhost:3001"

# Wait for backend to be ready
sleep 1

# Start frontend (vite dev server)
cd "$PROJECT_DIR/frontend"
npx vite --port 3000 &
FRONTEND_PID=$!
echo "Frontend started (PID $FRONTEND_PID) on http://localhost:3000"

echo ""
echo "=================================================="
echo "  App is running!"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo ""
echo "  Press Ctrl+C to stop."
echo "=================================================="

# Trap Ctrl+C and kill both processes
cleanup() {
  echo ""
  echo "Shutting down..."
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

wait $BACKEND_PID $FRONTEND_PID

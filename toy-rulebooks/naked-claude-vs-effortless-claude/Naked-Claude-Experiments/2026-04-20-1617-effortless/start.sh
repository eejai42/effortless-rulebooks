#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================"
echo " Order Tracker v3 - Start Script"
echo "============================================"

# 1. Run effortless build to regenerate rulebook + SQL from Airtable
echo ""
echo "[1/5] Running effortless build (rulebook + postgres SQL)..."
effortless build

# 2. Initialize database
echo ""
echo "[2/5] Initializing database..."
chmod +x postgres/reset-rulebook-db.sh
postgres/reset-rulebook-db.sh

# 3. Install backend deps
echo ""
echo "[3/5] Installing backend dependencies..."
cd "$SCRIPT_DIR/backend"
npm install

# 4. Install frontend deps
echo ""
echo "[4/5] Installing frontend dependencies..."
cd "$SCRIPT_DIR/frontend"
npm install

# 5. Start backend + frontend
echo ""
echo "[5/5] Starting backend (port 3001) and frontend (port 3000)..."
cd "$SCRIPT_DIR"

# Kill any existing processes on those ports
lsof -ti :3001 | xargs kill -9 2>/dev/null || true
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
sleep 1

# Start backend in background
node backend/server.js &
BACKEND_PID=$!

# Start frontend dev server in background
cd frontend
npm run dev &
FRONTEND_PID=$!
cd "$SCRIPT_DIR"

echo ""
echo "============================================"
echo " App is running!"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo ""
echo " Press Ctrl+C to stop."
echo "============================================"

cleanup() {
  echo ""
  echo "Stopping servers..."
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  wait $BACKEND_PID 2>/dev/null || true
  wait $FRONTEND_PID 2>/dev/null || true
  echo "Done."
  exit 0
}
trap cleanup SIGINT SIGTERM

wait $BACKEND_PID $FRONTEND_PID

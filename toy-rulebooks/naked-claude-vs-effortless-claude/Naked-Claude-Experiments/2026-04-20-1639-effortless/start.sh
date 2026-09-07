#!/bin/bash
set -e

# Get absolute path to the project root
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Customer Tracker — Start Script ==="
echo "Project: $PROJECT_DIR"
echo ""

# 1. Run the Effortless build pipeline
echo "--- Step 1: Running effortless build (rulebook + postgres SQL) ---"
cd "$PROJECT_DIR"
effortless build

# 2. Re-initialize the database
echo ""
echo "--- Step 2: Initializing PostgreSQL database ---"
chmod +x "$PROJECT_DIR/postgres/reset-rulebook-db.sh"
cd "$PROJECT_DIR/postgres"
./reset-rulebook-db.sh

# 3. Install backend dependencies
echo ""
echo "--- Step 3: Installing backend dependencies ---"
cd "$PROJECT_DIR/backend"
npm install

# 4. Install frontend dependencies
echo ""
echo "--- Step 4: Installing frontend dependencies ---"
cd "$PROJECT_DIR/frontend"
npm install

# 5. Start backend in background
echo ""
echo "--- Step 5: Starting backend (port 3001) ---"
cd "$PROJECT_DIR/backend"
node index.js &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"

# 6. Start frontend (Vite dev server)
echo ""
echo "--- Step 6: Starting frontend (port 5173) ---"
cd "$PROJECT_DIR/frontend"
npm run dev -- --host 0.0.0.0

# On exit, kill the backend
kill $BACKEND_PID 2>/dev/null || true
echo "Done."

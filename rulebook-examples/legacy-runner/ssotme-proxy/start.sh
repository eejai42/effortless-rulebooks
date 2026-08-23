#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=4242

existing=$(lsof -ti :$PORT 2>/dev/null)
if [ -n "$existing" ]; then
    kill $existing
    sleep 0.5
fi

exec python3 "$SCRIPT_DIR/server.py"

#!/bin/sh
exec 2>&1

echo "=== ENTRYPOINT START ==="
echo "Node version: $(node --version)"
echo "Files in /app/dist:"
ls /app/dist/ 2>&1 || echo "dist NOT FOUND"

echo "=== STARTING NODE ==="
node --max-old-space-size=400 /app/dist/main.js
EXIT_CODE=$?
echo "=== NODE EXITED WITH CODE: $EXIT_CODE ==="

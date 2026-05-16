#!/bin/sh

echo "=== Running migrations ==="
npx prisma migrate deploy
echo "=== Migration exit code: $? ==="

echo "=== Checking dist ==="
ls -la /app/dist/

echo "=== Starting NestJS ==="
node /app/dist/main.js
echo "=== Node exit code: $? ==="


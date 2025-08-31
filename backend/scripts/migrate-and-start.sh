#!/usr/bin/env bash
set -euo pipefail

echo "Running migrations..."
npx prisma migrate deploy

echo "Seeding (idempotent)..."
node dist/prisma/seed.js || true

echo "Starting app..."
node dist/index.js
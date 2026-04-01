#!/bin/sh
set -e
cd /app/backend
node dist/db/postgres/migrate.js
exec node dist/index.js

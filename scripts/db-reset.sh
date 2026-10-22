#!/usr/bin/env bash
# Reset the SLA database schema completely and re-apply all migrations.
# WARNING: This drops and recreates the 'slaa' schema, clearing all existing data!
# Usage:
#   scripts/db-reset.sh "postgres://user:password@ep-...neon.tech/neondb?sslmode=require"
# Or if DATABASE_URL is set in environment:
#   scripts/db-reset.sh

set -euo pipefail

DB_URL="${1:-${DATABASE_URL:?database URL required as \$1 argument or set in DATABASE_URL env var}}"

echo "==> Resetting 'slaa' schema on database..."
psql "$DB_URL" -v ON_ERROR_STOP=1 -q -c "DROP SCHEMA IF EXISTS slaa CASCADE; CREATE SCHEMA slaa;"

echo "==> Applying all migrations in order..."
DIR="$(cd "$(dirname "$0")" && pwd)"
"$DIR/db-apply.sh" "$DB_URL"

echo "==> Done! Database reset and all tables re-created successfully."

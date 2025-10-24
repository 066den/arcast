#!/bin/sh
set -e

echo "Entrypoint: starting container"

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set" >&2
  exit 1
fi

# Derive DB name and admin connection URL (connect to default 'postgres' database)
DB_NAME=$(echo "$DATABASE_URL" | sed -E 's|.*/([^/?]+)(\?.*)?$|\1|')
ADMIN_URL="${DATABASE_URL%/*}/postgres"

echo "Waiting for PostgreSQL to be ready..."
ATTEMPTS=0
MAX_ATTEMPTS=30
until psql "$ADMIN_URL" -tAc "SELECT 1" >/dev/null 2>&1; do
  ATTEMPTS=$((ATTEMPTS+1))
  if [ "$ATTEMPTS" -ge "$MAX_ATTEMPTS" ]; then
    echo "PostgreSQL is not reachable after $ATTEMPTS attempts" >&2
    exit 1
  fi
  echo "Postgres not ready yet. Retry $ATTEMPTS/$MAX_ATTEMPTS in 2s..."
  sleep 2
done

echo "Ensuring database '$DB_NAME' exists..."
DB_EXISTS=$(psql "$ADMIN_URL" -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" || true)
if [ "$DB_EXISTS" != "1" ]; then
  echo "Creating database '$DB_NAME'..."
  psql "$ADMIN_URL" -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"${DB_NAME}\""
else
  echo "Database '$DB_NAME' already exists."
fi

echo "Prisma: generating client..."
npx prisma generate --schema=prisma/schema.prisma || true

# Decide which strategy to use based on presence of migrations in the image.
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  echo "Prisma: migrations detected, running migrate deploy..."

  # Try migrate deploy once; if it fails (e.g. P3009), decide how to proceed
  if npx prisma migrate deploy --schema=prisma/schema.prisma; then
    echo "Prisma: migrate deploy successful."
  else
    echo "Prisma: migrate deploy failed."
    # Auto reset policy:
    # - If PRISMA_RESET_ON_FAILURE=true => reset
    # - Else if NODE_ENV!=production and PRISMA_RESET_ON_FAILURE is unset => reset (dev default)
    # - Else => do not reset, just db push to align schema (may ignore migration history)
    if [ "${PRISMA_RESET_ON_FAILURE:-}" = "true" ] || { [ "${NODE_ENV}" != "production" ] && [ -z "${PRISMA_RESET_ON_FAILURE:-}" ]; }; then
      echo "Prisma: auto reset enabled. Dropping database and reapplying schema..."
      npx prisma migrate reset --force --skip-generate --skip-seed --schema=prisma/schema.prisma || true
      npx prisma db push --schema=prisma/schema.prisma --skip-generate
    else
      echo "Prisma: auto reset disabled. Falling back to db push..."
      npx prisma db push --schema=prisma/schema.prisma
    fi
  fi
else
  echo "Prisma: no migrations directory found, using db push..."
  npx prisma db push --schema=prisma/schema.prisma
fi

# Final ensure schema alignment (idempotent)
echo "Prisma: final ensure schema with db push..."
npx prisma db push --schema=prisma/schema.prisma --skip-generate || true

# Optional one-time reset and reseed
if [ "${RESET_AND_RESEED:-false}" = "true" ]; then
  echo "RESET_AND_RESEED=true: dropping database and reapplying schema..."
  npx prisma migrate reset --force --skip-generate --skip-seed --schema=prisma/schema.prisma || true
  npx prisma db push --schema=prisma/schema.prisma --skip-generate
fi

# Seeding strategy:
# - If FORCE_SEED=true -> run seed
# - Else if duplicates detected -> run seed (will upsert and dedupe)
# - Else if DB empty -> run seed
# - Else skip
if [ "${SEED_ON_STARTUP:-true}" = "true" ]; then
  DUPLICATES=$(psql "$DATABASE_URL" -tAc "
    SELECT CASE WHEN
      EXISTS (SELECT 1 FROM (SELECT name, location FROM studios GROUP BY name, location HAVING COUNT(*)>1) d) OR
      EXISTS (SELECT 1 FROM (SELECT name FROM packages GROUP BY name HAVING COUNT(*)>1) d) OR
      EXISTS (SELECT 1 FROM (SELECT name FROM additional_services GROUP BY name HAVING COUNT(*)>1) d) OR
      EXISTS (SELECT 1 FROM (SELECT title FROM case_studies GROUP BY title HAVING COUNT(*)>1) d) OR
      EXISTS (SELECT 1 FROM (SELECT name FROM samples GROUP BY name HAVING COUNT(*)>1) d) OR
      EXISTS (SELECT 1 FROM (SELECT \"caseStudyId\", title, \"order\" FROM case_study_content GROUP BY \"caseStudyId\", title, \"order\" HAVING COUNT(*)>1) d)
    THEN 1 ELSE 0 END;
  " 2>/dev/null || echo 0)

  DB_EMPTY=$(psql "$DATABASE_URL" -tAc "
    SELECT CASE WHEN
      NOT EXISTS (SELECT 1 FROM studios) AND
      NOT EXISTS (SELECT 1 FROM packages) AND
      NOT EXISTS (SELECT 1 FROM additional_services) AND
      NOT EXISTS (SELECT 1 FROM clients) AND
      NOT EXISTS (SELECT 1 FROM case_studies)
    THEN 1 ELSE 0 END;
  " 2>/dev/null || echo 0)

  if [ "${FORCE_SEED:-false}" = "true" ] || [ "$DUPLICATES" = "1" ] || [ "$DB_EMPTY" = "1" ]; then
    if [ "${FORCE_SEED:-false}" = "true" ]; then echo "FORCE_SEED=true: running seed..."; fi
    if [ "$DUPLICATES" = "1" ]; then echo "Duplicates detected: running idempotent seed (with dedupe)..."; fi
    if [ "$DB_EMPTY" = "1" ]; then echo "Database empty: running seed..."; fi
    if npm run db:seed; then
      echo "Seeding finished."
    else
      echo "Seeding failed (non-fatal). Continuing without seed."
    fi
  else
    echo "Seeding skipped: no duplicates detected and DB not empty."
  fi
else
  echo "SEED_ON_STARTUP is not true. Skipping seeding."
fi

# Import dynamic content from staging if configured
if [ "${STAGE_IMPORT_ON_STARTUP:-false}" = "true" ] && [ -n "${STAGE_SEED_SOURCE_URL:-}" ]; then
  echo "Stage import enabled. Importing from ${STAGE_SEED_SOURCE_URL} ..."
  npm run stage:import || true
fi

# Import dynamic content from staging if configured
if [ "${STAGE_IMPORT_ON_STARTUP:-false}" = "true" ] && [ -n "${STAGE_SEED_SOURCE_URL:-}" ]; then
  echo "Stage import enabled. Importing from ${STAGE_SEED_SOURCE_URL} ..."
  npm run stage:import || true
fi

# Admin provisioning from env (idempotent)
# Triggers if ADMIN_USERNAME is set and at least one of ADMIN_PASSWORD, ADMIN_PASSWORD_HASH, SEED_ADMIN_PASSWORD provided.
if [ -n "${ADMIN_USERNAME:-}" ] && { [ -n "${ADMIN_PASSWORD:-}" ] || [ -n "${ADMIN_PASSWORD_HASH:-}" ] || [ -n "${SEED_ADMIN_PASSWORD:-}" ]; }; then
  echo "Ensuring admin user exists (ADMIN_USERNAME=${ADMIN_USERNAME})..."
  npm run admin:seed || true
else
  echo "Admin credentials not provided via env. Skipping admin seeding."
fi

echo "Starting Next.js server..."
exec node server.js


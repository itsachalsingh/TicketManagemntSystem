#!/usr/bin/env sh
set -e

echo "Booting container..."

if [ -z "$APP_KEY" ]; then
  echo "WARNING: APP_KEY not set. Set it in Render > Environment."
fi

# Clear & warm caches (best-effort)
php artisan optimize:clear || true

# Always safe to run; uses --force for prod
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running migrations..."
  php artisan migrate --force
fi

# Seed once unless you remove the lock
if [ "${RUN_SEEDERS:-false}" = "true" ]; then
  if [ ! -f storage/seed.lock ]; then
    echo "Seeding classes: ${SEED_CLASSES}"
    for CLASS in ${SEED_CLASSES}; do
      php artisan db:seed --class="$CLASS" --force || exit 1
    done
    touch storage/seed.lock
  else
    echo "Seed lock found (storage/seed.lock). Skipping seeding."
  fi
fi

# Storage symlink (no-op if exists)
php artisan storage:link || true

# Cache for perf (don’t fail the boot if any step errors)
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache  || true

echo "Starting Laravel on port ${PORT:-8080}..."
exec php artisan serve --host 0.0.0.0 --port "${PORT:-8080}"

#!/usr/bin/env sh
set -e

# Fail early if APP_KEY is missing (Laravel needs it for encrypted cookies, etc.)
if [ -z "$APP_KEY" ]; then
  echo "ERROR: APP_KEY is not set. Generate one locally with:"
  echo "  php artisan key:generate --show"
  echo "and add it to Render as an environment variable."
  exit 1
fi

# Cache config/routes/views each boot (safe once env is present)
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

php artisan config:cache
php artisan route:cache
php artisan view:cache

# Serve the app
exec php artisan serve --host 0.0.0.0 --port "${PORT:-8080}"

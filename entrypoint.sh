#!/usr/bin/env sh
set -e

if [ -z "$APP_KEY" ]; then
  echo "WARNING: APP_KEY is not set. Set it in Render > Environment."
fi

# Clear caches but don't die if they fail
php artisan optimize:clear || true

# (Optional) cache only after env is present
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

echo "Starting Laravel on port ${PORT:-8080}..."
exec php artisan serve --host 0.0.0.0 --port "${PORT:-8080}"

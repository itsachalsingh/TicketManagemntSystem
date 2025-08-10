# ---------- Stage 1: Build frontend (Vite) ----------
FROM node:20-alpine AS frontend
WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --frozen-lockfile; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    else npm i --no-audit --no-fund; fi

# config files Vite/Tailwind may need
COPY vite.config.* postcss.config.* tailwind.config.* tsconfig*.json jsconfig*.json ./
COPY resources ./resources
COPY public ./public

ENV VITE_APP_URL=http://localhost
RUN npm run build  # outputs to public/build

# ---------- Stage 2: PHP + Composer runtime ----------
FROM php:8.2-cli-alpine AS app
WORKDIR /var/www/html

RUN apk add --no-cache git unzip libpq postgresql-dev icu-dev oniguruma-dev libzip-dev \
    && docker-php-ext-configure intl \
    && docker-php-ext-install intl bcmath pdo pdo_pgsql

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1

# Copy app first so artisan exists for composer scripts
COPY . .

# Install PHP deps
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-ansi --no-progress

# Copy built frontend assets
COPY --from=frontend /app/public/build ./public/build

# Make sure Laravel can write caches
RUN mkdir -p storage/framework/{cache,sessions,views} bootstrap/cache \
 && chmod -R ug+rwX storage bootstrap/cache

# Entrypoint
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Defaults (Render can override these in Environment)
ENV PORT=8080 \
    RUN_MIGRATIONS=true \
    RUN_SEEDERS=false \
    SEED_CLASSES="RoleSeeder AdminSeeder"

EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]

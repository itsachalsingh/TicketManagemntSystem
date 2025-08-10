# ---------- Stage 1: Build frontend (Vite) ----------
FROM node:20-alpine AS frontend
WORKDIR /app

# Install deps first (better caching)
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --frozen-lockfile; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    else npm i; fi

# Copy only what's needed for Vite to build
COPY vite.config.* ./
COPY resources ./resources
COPY public ./public

# Build to /app/dist (we’ll copy only the built /public/build)
RUN npm run build

# ---------- Stage 2: PHP + Composer + Runtime ----------
FROM php:8.2-cli-alpine AS app
WORKDIR /var/www/html

# System packages & PHP extensions
RUN apk add --no-cache git unzip libpq postgresql-dev icu-dev oniguruma-dev libzip-dev \
    && docker-php-ext-configure intl \
    && docker-php-ext-install intl bcmath pdo pdo_pgsql

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# App dependencies (composer first for layer caching)
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-ansi --no-progress

# Copy the full application
COPY . .

# Copy built frontend assets from Stage 1 into Laravel's public/build
# (Vite outputs to public/build by default; if you changed it, adjust here)
COPY --from=frontend /app/public/build ./public/build

# Make the startup script executable
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Render provides $PORT. Fallback to 8080 locally.
ENV PORT=8080

EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]

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

# System packages & PHP extensions (Postgres)
RUN apk add --no-cache git unzip libpq postgresql-dev icu-dev oniguruma-dev libzip-dev \
    && docker-php-ext-configure intl \
    && docker-php-ext-install intl bcmath pdo pdo_pgsql

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Install PHP deps first for caching
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-ansi --no-progress

# Copy the app
COPY . .

# Copy built assets from the frontend stage
COPY --from=frontend /app/public/build ./public/build

# Entrypoint to boot Laravel
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]

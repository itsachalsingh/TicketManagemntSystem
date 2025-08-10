# ---------- Stage 1: Build frontend (Vite) ----------
FROM node:20-alpine AS frontend
WORKDIR /app

# Install deps first (best caching)
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --frozen-lockfile; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    else npm i --no-audit --no-fund; fi

# Copy Vite/Tailwind configs and source needed for build
COPY vite.config.* postcss.config.* tailwind.config.* tsconfig*.json jsconfig*.json ./
COPY resources ./resources
COPY public ./public

# If your build references env vars like import.meta.env.VITE_APP_URL, set a default
ENV VITE_APP_URL=http://localhost

# Build (outputs to public/build by default via laravel-vite-plugin)
RUN npm run build

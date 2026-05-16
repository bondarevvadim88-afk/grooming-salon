# ── Stage 1: build ───────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy only package files first for layer caching
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run build
RUN npx prisma generate

# ── Stage 2: production image ────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Only production deps
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built app + prisma client
COPY --from=builder /app/dist          ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma        ./prisma

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3000

# Run migrations then start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]

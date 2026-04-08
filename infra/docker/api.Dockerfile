# ──────────────────────────────────────────────
# Throttlr API — infra Dockerfile
# Supports both development and production targets
# ──────────────────────────────────────────────

# ── Development ───────────────────────────────
FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/types/package*.json ./packages/types/
COPY packages/config/package*.json ./packages/config/
RUN npm ci

COPY apps/api/ ./apps/api/
COPY packages/ ./packages/

WORKDIR /app
CMD ["npm", "run", "dev", "--workspace=apps/api"]


# ── Production ────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/types/package*.json ./packages/types/
RUN npm ci --workspace=apps/api --workspace=packages/types

COPY apps/api/ ./apps/api/
COPY packages/ ./packages/
COPY turbo.json ./

RUN cd apps/api && npx prisma generate
RUN npm run build --workspace=apps/api --workspace=packages/types

FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/api/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 8000
CMD ["node", "dist/index.js"]

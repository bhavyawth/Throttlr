# ──────────────────────────────────────────────
# Throttlr Dashboard — Production Dockerfile
# ──────────────────────────────────────────────

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/dashboard/package*.json ./apps/dashboard/
COPY packages/types/package*.json ./packages/types/
RUN npm ci --workspace=apps/dashboard --workspace=packages/types

COPY apps/dashboard/ ./apps/dashboard/
COPY packages/types/ ./packages/types/
COPY packages/config/ ./packages/config/
COPY turbo.json ./

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build --workspace=apps/dashboard --workspace=packages/types


# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/dashboard/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]

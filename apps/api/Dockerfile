# ──────────────────────────────────────────────
# Throttlr API — Production Dockerfile
# ──────────────────────────────────────────────

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/types/package*.json ./packages/types/
RUN npm ci --workspace=apps/api --workspace=packages/types

# Copy source
COPY apps/api/ ./apps/api/
COPY packages/types/ ./packages/types/
COPY packages/config/ ./packages/config/
COPY turbo.json ./

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build
RUN npm run build --workspace=apps/api --workspace=packages/types


# Stage 2: Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY --from=builder /app/apps/api/package*.json ./
RUN npm ci --omit=dev

# Copy compiled output
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 8000

CMD ["node", "dist/index.js"]

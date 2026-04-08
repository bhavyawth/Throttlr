# Throttlr ⚡

**Self-hostable Rate Limiter as a Service**

Throttlr lets you add production-grade rate limiting to any application without writing infrastructure code. Define rules, issue API keys, and protect your services in minutes.

---

## Monorepo Structure

```
throttlr/
├── apps/
│   ├── api/          # Express API server (port 8000)
│   └── dashboard/    # Next.js 14 dashboard (port 3000)
├── packages/
│   ├── sdk/          # Node.js SDK for API consumers
│   ├── types/        # Shared TypeScript types
│   └── config/       # Shared tsconfig & eslint
└── infra/
    └── docker/       # Dockerfiles for each app
```

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/dashboard/.env.example apps/dashboard/.env

# 3. Start infrastructure (Postgres + Redis)
docker-compose -f docker-compose.dev.yml up postgres redis -d

# 4. Run database migrations
npm run db:migrate --workspace=apps/api

# 5. Start all apps in dev mode
npm run dev
```

## Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| API        | Express, Prisma, Redis, Pino, Zod   |
| Dashboard  | Next.js 14, Tailwind, Recharts      |
| SDK        | Axios                               |
| Database   | PostgreSQL                          |
| Cache      | Redis                               |
| Monorepo   | Turborepo + npm workspaces          |

## Algorithms

- **Sliding Window** — Uses Redis sorted sets for precise per-window tracking
- **Token Bucket** — Uses Redis hashes + Lua scripts for burst-tolerant limiting

## License

MIT

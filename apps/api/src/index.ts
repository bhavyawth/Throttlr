import "dotenv/config";
import express from "express";
import cors from "cors";
import { logger } from "./lib/logger";
import { redisService } from "./services/redis.service";
import prisma from "./lib/prisma";

// route imports
import { checkRouter } from "./routes/check.route";
import { rulesRouter } from "./routes/rules.route";
import { statsRouter } from "./routes/stats.route";
// middleware imports
import { authMiddleware } from "./middleware/auth.middleware";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();
const PORT = parseInt(process.env.PORT ?? "8000", 10);
// global middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// deep health check — pings Redis and Postgres, reports latency
app.get("/health", async (_req, res) => {
  const timestamp = new Date().toISOString();
  const uptime = process.uptime();

  let redisStatus: "healthy" | "unhealthy" = "unhealthy";
  let redisLatencyMs = -1;
  try {
    const start = performance.now();
    await redisService.getClient().ping();
    redisLatencyMs = Math.round(performance.now() - start);
    redisStatus = "healthy";
  } catch {
    redisStatus = "unhealthy";
  }

  let postgresStatus: "healthy" | "unhealthy" = "unhealthy";
  let postgresLatencyMs = -1;
  try {
    const start = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    postgresLatencyMs = Math.round(performance.now() - start);
    postgresStatus = "healthy";
  } catch {
    postgresStatus = "unhealthy";
  }

  const allHealthy = redisStatus === "healthy" && postgresStatus === "healthy";

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? "ok" : "degraded",
    timestamp,
    uptime: `${Math.floor(uptime)}s`,
    services: {
      redis: { status: redisStatus, latencyMs: redisLatencyMs },
      postgres: { status: postgresStatus, latencyMs: postgresLatencyMs },
    },
  });
});

// api routes
app.use("/", authMiddleware);
app.use("/check", checkRouter);
app.use("/rules", rulesRouter);
app.use("/stats", statsRouter);

app.use(errorMiddleware);

// connect to redisservice before starting the server
async function bootstrap(): Promise<void> {
  await redisService.connect();
  app.listen(PORT, () => {
    logger.info({ port: PORT }, "🚀 Throttlr API server started");
  });
}
bootstrap().catch((err) => {
  logger.fatal({ err }, "Failed to start server");
  process.exit(1);
});
// avoid dirty shutdown
async function shutdown(): Promise<void> {
  logger.info("Shutting down...");
  await redisService.disconnect();
  process.exit(0);
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export default app;
import "dotenv/config";
import express from "express";
import cors from "cors";
import { logger } from "./lib/logger";
import { redisService } from "./services/redis.service";

// route imports
import { checkRouter } from "./routes/check.route";
import { rulesRouter } from "./routes/rules.route";
// import { statsRouter } from "./routes/stats.route";
// middleware imports
import { authMiddleware } from "./middleware/auth.middleware";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();
const PORT = parseInt(process.env.PORT ?? "8000", 10);
// global middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// api v1 routes
app.use("/v1", authMiddleware);
app.use("/v1/check", checkRouter);
app.use("/v1/rules", rulesRouter);
// app.use("/v1/stats", statsRouter);

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
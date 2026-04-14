import "dotenv/config";
import express from "express";
import cors from "cors";
import { logger } from "./lib/logger";

// Route imports (uncomment as implemented)
// import { checkRouter } from "./routes/check.route";
// import { rulesRouter } from "./routes/rules.route";
// import { statsRouter } from "./routes/stats.route";

// Middleware imports (uncomment as implemented)
// import { authMiddleware } from "./middleware/auth.middleware";
// import { errorMiddleware } from "./middleware/error.middleware";

// ── App Setup ─────────────────────────────────────────────────────────────────
const app = express();
const PORT = parseInt(process.env.PORT ?? "8000", 10);

// ── Global Middleware ─────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── API v1 Routes ─────────────────────────────────────────────────────────────
// TODO: Mount routers as they are implemented
// app.use("/v1", authMiddleware);
// app.use("/v1/check", checkRouter);
// app.use("/v1/rules", rulesRouter);
// app.use("/v1/stats", statsRouter);

// ── Error Handling ────────────────────────────────────────────────────────────
// TODO: Mount error middleware last
// app.use(errorMiddleware);

// ── Server Start ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info({ port: PORT }, "🚀 Throttlr API server started");
});

export default app;

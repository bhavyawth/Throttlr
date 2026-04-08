// =============================================================================
// Route: GET /v1/stats
//
// What goes here:
//  - Express Router for aggregate statistics
//  - GET /v1/stats              → overall stats (total allowed/denied, top rules)
//  - GET /v1/stats/rules/:id   → per-rule stats (requests over time, hit rate)
//  - GET /v1/stats/logs        → paginated request logs
//  - Query params: ?from=ISO&to=ISO&page=1&pageSize=50
//  - Data source: RequestLog table (Prisma) or Redis counters for real-time
// =============================================================================

import { Router } from "express";

export const statsRouter = Router();

// TODO: GET /v1/stats
statsRouter.get("/", (_req, res) => {
  res.status(501).json({ success: false, error: "Not implemented" });
});

// TODO: GET /v1/stats/rules/:id
statsRouter.get("/rules/:id", (_req, res) => {
  res.status(501).json({ success: false, error: "Not implemented" });
});

// TODO: GET /v1/stats/logs
statsRouter.get("/logs", (_req, res) => {
  res.status(501).json({ success: false, error: "Not implemented" });
});

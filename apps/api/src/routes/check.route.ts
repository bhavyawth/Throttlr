// =============================================================================
// Route: POST /v1/check
//
// What goes here:
//  - Express Router for the rate-limit check endpoint
//  - Request body validation with Zod:
//      { identifier: string, ruleId: string }
//  - Look up the Rule by ruleId (via RulesService or Prisma)
//  - Dispatch to the correct algorithm (SlidingWindow or TokenBucket)
//  - Log the result to RequestLog (async, non-blocking)
//  - Response: { allowed, remaining, resetAt, retryAfterMs? }
//  - If not allowed: set Retry-After header + return 429
// =============================================================================

import { Router } from "express";

export const checkRouter = Router();

// TODO: POST /v1/check
checkRouter.post("/", (_req, res) => {
  // Placeholder
  res.status(501).json({ success: false, error: "Not implemented" });
});

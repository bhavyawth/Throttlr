import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { rulesService } from "../services/rules.service";
import { slidingWindowCheck } from "../core/algorithms/sliding-window";
import { tokenBucketCheck } from "../core/algorithms/token-bucket";
import prisma from "../lib/prisma";
import { logger } from "../lib/logger";

// zod validation
const checkSchema = z.object({
  identifier: z.string().min(1).max(500),
  ruleId: z.string().min(1),
});

const performCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier, ruleId } = checkSchema.parse(req.body);
    const rule = await rulesService.getRuleById(ruleId, req.apiKey?.id!);
    // the main thing where the algorithm is called
    const result =
      rule.algorithm === "TOKEN_BUCKET"
        ? await tokenBucketCheck(ruleId, identifier, rule.windowSizeSeconds, rule.maxRequests)
        : await slidingWindowCheck(ruleId, identifier, rule.windowSizeSeconds, rule.maxRequests);

    prisma.requestLog
      .create({
        data: {
          userId: identifier,
          ruleId,
          allowed: result.allowed,
          apiKeyId: req.apiKey?.id!,
        },
      })
      .catch((err) => logger.error({ err }, "Failed to log request"));

    res.set({
      "X-RateLimit-Limit": String(rule.maxRequests),
      "X-RateLimit-Remaining": String(result.remaining),
      "X-RateLimit-Reset": String(Math.ceil(result.resetAt.getTime() / 1000)),
    });

    if (!result.allowed) {
      res.set("Retry-After", String(Math.ceil((result.retryAfterMs ?? 0) / 1000)));
      res.status(429).json({
        success: true,
        data: result,
      });
      return;
    }
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const checkController = {
  performCheck,
};

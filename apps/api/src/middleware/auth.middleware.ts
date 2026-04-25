import type { Request, Response, NextFunction } from "express";
import { createHash } from "crypto";
import type { ApiKey } from "@prisma/client";
import prisma from "../lib/prisma";
import { redisService } from "../services/redis.service";
import { authLogger } from "../lib/logger";
import { getAuth } from "@clerk/express";

// Extend Express Request for typesafety
declare global {
  namespace Express {
    interface Request {
      apiKey?: ApiKey;
      clerkUserId?: string;
    }
  }
}

// hashing the api key
function hashApiKey(rawKey: string): string {
  const salt = process.env.API_KEY_SALT ?? "";
  return createHash("sha256").update(rawKey + salt).digest("hex");
}

// vals for redis caching
const CACHE_PREFIX = "apikey:";
const CACHE_TTL_SECONDS = 60;

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const xApiKey = req.headers["x-api-key"];
  // ── API Key Auth ────────────────────────────────────────────────────────
  if (typeof xApiKey === "string" && xApiKey.length > 0) {
    const hashedKey = hashApiKey(xApiKey);
    try {
      const cached = await redisService.getClient().get(CACHE_PREFIX + hashedKey);
      if (cached) {
        const apiKey: ApiKey = JSON.parse(cached);
        if (!apiKey.isActive) {
          res.status(403).json({
            success: false,
            error: "API key is deactivated",
            errorCode: "INACTIVE_API_KEY",
          });
          return;
        }
        req.apiKey = apiKey;
        return next();
      }

      const apiKey = await prisma.apiKey.findUnique({
        where: { key: hashedKey },
      });
      if (!apiKey) {
        authLogger.warn({ hashedKey: hashedKey.slice(0, 8) + "..." }, "Invalid API key attempt");
        res.status(403).json({
          success: false,
          error: "Invalid API key",
          errorCode: "INVALID_API_KEY",
        });
        return;
      }
      if (!apiKey.isActive) {
        res.status(403).json({
          success: false,
          error: "API key is deactivated",
          errorCode: "INACTIVE_API_KEY",
        });
        return;
      }

      await redisService
        .getClient()
        .set(CACHE_PREFIX + hashedKey, JSON.stringify(apiKey), { EX: CACHE_TTL_SECONDS });
      
      req.apiKey = apiKey;
      next();
    } catch (err) {
      authLogger.error({ err }, "API Key auth error");
      next(err);
    }
    return;
  }
  // ── Clerk JWT Auth ──────────────────────────────────────────────────────
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({
        success: false,
        error: "Invalid token: no user ID",
        errorCode: "UNAUTHORIZED",
      });
      return;
    }

    req.clerkUserId = userId;
    next();
  } catch (err) {
    authLogger.warn({ err }, "Clerk token verification failed");
    res.status(401).json({
      success: false,
      error: "Invalid or expired session token",
      errorCode: "UNAUTHORIZED",
    });
  }
}

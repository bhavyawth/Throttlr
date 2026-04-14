import type { Request, Response, NextFunction } from "express";
import { createHash } from "crypto";
import type { ApiKey } from "@prisma/client";
import prisma from "../lib/prisma";
import { redisService } from "../services/redis.service";
import { authLogger } from "../lib/logger";

// Extend Express Request for typesafety
declare global {
  namespace Express {
    interface Request {
      apiKey: ApiKey;
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

function extractKey(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  const xApiKey = req.headers["x-api-key"];
  if (typeof xApiKey === "string" && xApiKey.length > 0) return xApiKey;
  return null;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const rawKey = extractKey(req);
  if (!rawKey) {
    res.status(401).json({
      success: false,
      error: "Missing API key",
      errorCode: "MISSING_API_KEY",
    });
    return;
  }
  const hashedKey = hashApiKey(rawKey);
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
    authLogger.error({ err }, "Auth middleware error");
    next(err);
  }
}

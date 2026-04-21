import type { Request, Response, NextFunction } from "express";
import { redisService } from "../services/redis.service";
import { logger } from "../lib/logger";

// same lua sorted-set approach as our SW algo
const LUA_IP_RATE_LIMIT = `
  redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', ARGV[1])
  local count = redis.call('ZCARD', KEYS[1])
  if count < tonumber(ARGV[3]) then
    redis.call('ZADD', KEYS[1], ARGV[2], ARGV[4])
    redis.call('EXPIRE', KEYS[1], ARGV[5])
    return {1, count + 1}
  end
  redis.call('EXPIRE', KEYS[1], ARGV[5])
  return {0, count}
`;

interface RateLimitOptions {
  windowSeconds: number;
  maxRequests: number;
}

// 100 reqs/60 sec per IP
const DEFAULT_OPTIONS: RateLimitOptions = {
  windowSeconds: 60,
  maxRequests: 100,
};

function extractIp(req: Request): string {
  // trust x-forwarded-for if behind a reverse proxy
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.ip ?? "unknown";
}

export function rateLimitMiddleware(opts?: Partial<RateLimitOptions>) {
  const { windowSeconds, maxRequests } = { ...DEFAULT_OPTIONS, ...opts };

  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = extractIp(req);
    const key = `rl:global:${ip}`;
    const now = Date.now();
    const windowStartMs = now - windowSeconds * 1000;
    const uniqueMember = `${now}:${Math.random().toString(36).slice(2, 8)}`;

    try {
      const result = (await redisService.runLuaScript(
        LUA_IP_RATE_LIMIT,
        [key],
        [windowStartMs, now, maxRequests, uniqueMember, windowSeconds]
      )) as [number, number];
      const [allowed, count] = result;
      const remaining = Math.max(0, maxRequests - count);

      res.set({
        "X-RateLimit-Limit": String(maxRequests),
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(Math.ceil((now + windowSeconds * 1000) / 1000)),
      });

      if (allowed === 0) {
        res.set("Retry-After", String(windowSeconds));
        res.status(429).json({
          success: false,
          error: "Too many requests",
          errorCode: "RATE_LIMIT_EXCEEDED",
        });
        return;
      }
      next();
    } catch (err) { // if redis == down, let the req pass
      logger.warn({ err }, "Global rate limiter failed, allowing request");
      next();
    }
  };
}

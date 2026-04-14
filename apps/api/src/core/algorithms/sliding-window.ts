import { redisService } from "../../services/redis.service";
import { algorithmLogger } from "../../lib/logger";
import type { RateLimitCheckResponse } from "@throttlr/types";

function buildKey(ruleId: string, identifier: string): string {
  return `sw:${ruleId}:${identifier}`;
}

// lua Script
// KEYS[1] = the sorted set key
// ARGV[1] = window start timestamp (ms) — anything scored below this gets pruned
// ARGV[2] = current timestamp (ms) — used as both score and member for the new entry
// ARGV[3] = max allowed requests in the window
// ARGV[4] = a unique member ID for this request (timestamp + random suffix)
// ARGV[5] = key TTL in seconds — auto-cleanup for idle users
// Returns: [allowed (0|1), currentCount, oldestTimestamp]
const LUA_SLIDING_WINDOW = `
  -- Step 1: Remove all requests that have fallen outside the window
  redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', ARGV[1])

  -- Step 2: Count how many requests are still in the window
  local currentCount = redis.call('ZCARD', KEYS[1])

  -- Step 3: Decide
  local allowed = 0
  if currentCount < tonumber(ARGV[3]) then
    -- Under the limit — record this request
    redis.call('ZADD', KEYS[1], ARGV[2], ARGV[4])
    allowed = 1
    currentCount = currentCount + 1
  end

  -- Step 4: Set TTL so keys for idle users don't stick around forever
  redis.call('EXPIRE', KEYS[1], ARGV[5])

  -- Step 5: Get the oldest request timestamp (used to calculate resetAt)
  local oldest = redis.call('ZRANGE', KEYS[1], 0, 0, 'WITHSCORES')
  local oldestScore = 0
  if #oldest > 0 then
    oldestScore = tonumber(oldest[2])
  end

  return { allowed, currentCount, oldestScore }
`;

// ── Public API ────────────────────────────────────────────────────────────────
export async function slidingWindowCheck(
  ruleId: string,
  identifier: string,
  windowSizeSeconds: number,
  maxRequests: number
): Promise<RateLimitCheckResponse> {
  const now = Date.now();
  const windowStartMs = now - windowSizeSeconds * 1000;
  const key = buildKey(ruleId, identifier);
  // uniqueness so that no overwrite happens if request come in the same ms
  // inside sorted set
  const uniqueMember = `${now}:${Math.random().toString(36).slice(2, 8)}`;

  const result = (await redisService.runLuaScript(
    LUA_SLIDING_WINDOW,
    [key],
    [windowStartMs, now, maxRequests, uniqueMember, windowSizeSeconds]
  )) as [number, number, number];

  const [allowed, currentCount, oldestTimestamp] = result;
  const remaining = Math.max(0, maxRequests - currentCount);

  // if allowed then resetAt is when the window boundary is
  // if denied then resetAt is when the oldest request in the window will expire, opening up a slot.
  const resetAt = new Date(
    oldestTimestamp > 0
      ? oldestTimestamp + windowSizeSeconds * 1000
      : now + windowSizeSeconds * 1000
  );

  const response: RateLimitCheckResponse = {
    allowed: allowed === 1,
    remaining,
    resetAt,
  };
  if (allowed === 0) {
    response.retryAfterMs = Math.max(0, resetAt.getTime() - now);
  }

  algorithmLogger.debug(
    { ruleId, identifier, allowed: allowed === 1, remaining, resetAt },
    "Sliding window check"
  );

  return response;
}

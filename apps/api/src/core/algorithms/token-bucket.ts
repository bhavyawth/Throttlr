import { redisService } from "../../services/redis.service";
import { algorithmLogger } from "../../lib/logger";
import type { RateLimitCheckResponse } from "@throttlr/types";

function buildKey(ruleId: string, identifier: string): string {
  return `tb:${ruleId}:${identifier}`;
}

// mapping of the rule fields to the params recieved
// - maxRequests  → bucket capacity (max tokens the bucket can hold)
// - windowSizeSeconds → refill period (time to go from 0 → capacity)
// - refill rate = capacity / windowSizeSeconds (tokens added per second)
// lua script
// KEYS[1] = the hash key
// ARGV[1] = current timestamp in ms
// ARGV[2] = bucket capacity (max tokens)
// ARGV[3] = refill rate (tokens per second, can be fractional)
// ARGV[4] = key TTL in seconds
// Returns: [allowed (0|1), remainingTokens (after this request)]
const LUA_TOKEN_BUCKET = `
  local key = KEYS[1]
  local now = tonumber(ARGV[1])
  local capacity = tonumber(ARGV[2])
  local refillRate = tonumber(ARGV[3])
  local ttl = tonumber(ARGV[4])

  -- Step 1: Read current state (or initialize if first request)
  local tokens = tonumber(redis.call('HGET', key, 'tokens'))
  local lastRefill = tonumber(redis.call('HGET', key, 'lastRefillAt'))

  if tokens == nil then
    -- First request ever for this key — start with a full bucket
    tokens = capacity
    lastRefill = now
  end

  -- Step 2: Refill tokens based on elapsed time
  local elapsed = (now - lastRefill) / 1000  -- convert ms to seconds
  local newTokens = elapsed * refillRate
  tokens = math.min(capacity, tokens + newTokens)
  lastRefill = now

  -- Step 3: Try to consume one token
  local allowed = 0
  if tokens >= 1 then
    tokens = tokens - 1
    allowed = 1
  end

  -- Step 4: Persist the new state
  redis.call('HSET', key, 'tokens', tostring(tokens), 'lastRefillAt', tostring(now))
  redis.call('EXPIRE', key, ttl)

  -- Return tokens floored to int for the remaining count
  return { allowed, math.floor(tokens) }
`;

export async function tokenBucketCheck(
  ruleId: string,
  identifier: string,
  windowSizeSeconds: number,
  maxRequests: number
): Promise<RateLimitCheckResponse> {
  const now = Date.now();
  const key = buildKey(ruleId, identifier);
  const capacity = maxRequests;
  const refillRate = capacity / windowSizeSeconds;

  const result = (await redisService.runLuaScript(
    LUA_TOKEN_BUCKET,
    [key],
    [now, capacity, refillRate, windowSizeSeconds]
  )) as [number, number];

  const [allowed, remaining] = result;

  // resetAt: if denied, tell the caller when ONE token will be available(1/refillRate seconds from now)
  // If allowed, resetAt is when the bucket would be fully refilled.
  const resetAt = new Date(
    allowed === 1
      ? now + ((capacity - remaining) / refillRate) * 1000
      : now + (1 / refillRate) * 1000
  );

  const response: RateLimitCheckResponse = {
    allowed: allowed === 1,
    remaining,
    resetAt,
  };
  if (allowed === 0) {
    response.retryAfterMs = Math.max(0, Math.ceil((1 / refillRate) * 1000));
  }

  algorithmLogger.debug(
    { ruleId, identifier, allowed: allowed === 1, remaining, resetAt },
    "Token bucket check"
  );

  return response;
}

// =============================================================================
// Algorithm: Sliding Window
//
// What goes here:
//  - SlidingWindowCounter class or function
//  - Uses Redis sorted sets (ZADD / ZRANGEBYSCORE / ZREMRANGEBYSCORE)
//  - check(key: string, windowSizeSeconds: number, maxRequests: number): Promise<SlidingWindowResult>
//    → Returns { allowed, remaining, resetAt }
//  - Atomicity: use a Redis Lua script to make ZADD + ZCOUNT atomic
//  - Key format: "sw:{ruleId}:{identifier}"
//  - Expire keys automatically using EXPIRE
// =============================================================================

// TODO: Implement SlidingWindowCounter

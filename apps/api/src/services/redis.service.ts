// =============================================================================
// Service: Redis
//
// What goes here:
//  - Create and export a singleton Redis client using node-redis v4
//  - Connect on startup (called from index.ts)
//  - Handle connection errors gracefully (log + retry)
//  - Export helper functions used by algorithm implementations:
//      - runLuaScript(script, keys, args): Promise<unknown>
//      - getClient(): RedisClientType
//  - Export a disconnect() function for graceful shutdown
// =============================================================================

// TODO: Import { createClient } from "redis"
// TODO: Create singleton RedisClient
// TODO: Export connect(), disconnect(), getClient()

export const redisService = {
  connect: async (): Promise<void> => {
    // TODO: Connect to Redis using REDIS_URL from env
  },
  disconnect: async (): Promise<void> => {
    // TODO: Disconnect gracefully
  },
};

import { createClient, type RedisClientType } from "redis";
import { redisLogger } from "../lib/logger";

let client: RedisClientType;

function getOrCreateClient(): RedisClientType {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL ?? "redis://localhost:6379",
      socket: {
        reconnectStrategy(retries: number) {
          if (retries > 10) {
            redisLogger.fatal("Redis max reconnect attempts reached — giving up");
            return new Error("Redis max reconnect attempts reached");
          }
          return Math.min(retries * 100, 5000); // capped at 5s
        },
      },
    });
    // fire on every connect/disconnect/error
    client.on("error", (err) => redisLogger.error({ err }, "Redis client error"));
    client.on("connect", () => redisLogger.info("Redis connected"));
    client.on("reconnecting", () => redisLogger.warn("Redis reconnecting..."));
  }
  return client;
}

// ── Public API ────────────────────────────────────────────────────────────────
async function connect(): Promise<void> {
  const c = getOrCreateClient();
  if (!c.isOpen) await c.connect();
}

async function disconnect(): Promise<void> {
  if (client?.isOpen) {
    await client.quit();
    redisLogger.info("Redis disconnected!");
  }
}

function getClient(): RedisClientType {
  const c = getOrCreateClient();
  if (!c.isOpen) throw new Error("Redis client is not connected. Call connect() first.");
  return c;
}

async function runLuaScript(
  script: string,
  keys: string[],
  args: (string | number)[]
): Promise<unknown> {
  return getClient().eval(script, {
    keys,
    arguments: args.map(String),
  });
}

export const redisService = { // export as a single service
  connect,
  disconnect,
  getClient,
  runLuaScript,
};

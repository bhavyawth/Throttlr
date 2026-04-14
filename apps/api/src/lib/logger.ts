import pino from "pino";

const transport =
  process.env.NODE_ENV !== "production"
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:HH:MM:ss.l", // readable timestamps in dev
          ignore: "pid,hostname", // noise we don't need locally
        },
      }
    : undefined;

export const logger = pino({
  // set LOG_LEVEL=debug in .env when you need verbose output
  level: process.env.LOG_LEVEL ?? "info",
  transport,
});

// log output you'll see: { "context": "redis", "msg": "connected" }
export const authLogger = logger.child({ context: "auth" });
export const redisLogger = logger.child({ context: "redis" });
export const algorithmLogger = logger.child({ context: "algorithm" });
export const rulesLogger = logger.child({ context: "rules" });

import prisma from "../lib/prisma";
import { redisService } from "./redis.service";
import { rulesLogger } from "../lib/logger";
import { NotFoundError } from "../middleware/error.middleware";
import type { Algorithm } from "@prisma/client";


const CACHE_PREFIX = "rule:";
const CACHE_TTL_SECONDS = 300; // 5 min

async function cacheRule(ruleId: string, data: unknown): Promise<void> {
  try {
    await redisService
      .getClient()
      .set(CACHE_PREFIX + ruleId, JSON.stringify(data), { EX: CACHE_TTL_SECONDS });
  } catch (err) {
    rulesLogger.warn({ err, ruleId }, "Failed to cache rule");
  }
}
async function invalidateCache(ruleId: string): Promise<void> {
  try {
    await redisService.getClient().del(CACHE_PREFIX + ruleId);
  } catch (err) {
    rulesLogger.warn({ err, ruleId }, "Failed to invalidate rule cache");
  }
}


interface CreateRuleInput {
  name: string;
  windowSizeSeconds: number;
  maxRequests: number;
  algorithm?: Algorithm;
  apiKeyId: string;
}

async function createRule(input: CreateRuleInput) {
  const rule = await prisma.rule.create({
    data: {
      name: input.name,
      windowSizeSeconds: input.windowSizeSeconds,
      maxRequests: input.maxRequests,
      algorithm: input.algorithm ?? "SLIDING_WINDOW",
      apiKeyId: input.apiKeyId,
    },
  });
  await cacheRule(rule.id, rule);
  rulesLogger.info({ ruleId: rule.id, name: rule.name }, "Rule created");
  return rule;
}

async function getRuleById(ruleId: string, apiKeyId: string) {
  try {
    const cached = await redisService.getClient().get(CACHE_PREFIX + ruleId);
    if (cached) {
      const rule = JSON.parse(cached);
      if (rule.apiKeyId !== apiKeyId) throw new NotFoundError("Rule");
      return rule;
    }
  } catch (err) {
    if (err instanceof NotFoundError) throw err;
    rulesLogger.warn({ err, ruleId }, "Cache read failed, falling back to DB");
  }

  const rule = await prisma.rule.findUnique({ where: { id: ruleId } });
  if (!rule || rule.apiKeyId !== apiKeyId) throw new NotFoundError("Rule");
  await cacheRule(rule.id, rule);
  return rule;
}

async function getRulesByApiKey(apiKeyId: string) {
  return prisma.rule.findMany({
    where: { apiKeyId },
    orderBy: { createdAt: "desc" },
  });
}

interface UpdateRuleInput {
  name?: string;
  windowSizeSeconds?: number;
  maxRequests?: number;
  algorithm?: Algorithm;
}

async function updateRule(ruleId: string, apiKeyId: string, data: UpdateRuleInput) {
  const existing = await prisma.rule.findUnique({ where: { id: ruleId } });
  if (!existing || existing.apiKeyId !== apiKeyId) throw new NotFoundError("Rule");
  const updated = await prisma.rule.update({
    where: { id: ruleId },
    data,
  });
  await invalidateCache(ruleId);
  await cacheRule(ruleId, updated);
  rulesLogger.info({ ruleId, changes: Object.keys(data) }, "Rule updated");
  return updated;
}

async function deleteRule(ruleId: string, apiKeyId: string) {
  const existing = await prisma.rule.findUnique({ where: { id: ruleId } });
  if (!existing || existing.apiKeyId !== apiKeyId) throw new NotFoundError("Rule");
  await prisma.rule.delete({ where: { id: ruleId } });
  await invalidateCache(ruleId);
  rulesLogger.info({ ruleId }, "Rule deleted");
}

export const rulesService = {
  createRule,
  getRuleById,
  getRulesByApiKey,
  updateRule,
  deleteRule,
}; // export as a single service here too...

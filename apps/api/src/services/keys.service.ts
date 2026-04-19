import { createHash, randomBytes } from "crypto";
import prisma from "../lib/prisma";

const KEY_PREFIX = "thr_";

// same hashing logic as auth middleware
function hashKey(rawKey: string): string {
  const salt = process.env.API_KEY_SALT ?? "";
  return createHash("sha256").update(rawKey + salt).digest("hex");
}

function generateRawKey(): string {
  return KEY_PREFIX + randomBytes(32).toString("hex");
}

async function createApiKey(name: string) {
  const rawKey = generateRawKey();
  const hashedKey = hashKey(rawKey);

  const apiKey = await prisma.apiKey.create({
    data: { name, key: hashedKey },
    select: { id: true, name: true, createdAt: true, isActive: true },
  });
  // returning raw key once, storing hash
  return { ...apiKey, key: rawKey };
}

async function listApiKeys(apiKeyId: string) {
  return prisma.apiKey.findUnique({
    where: { id: apiKeyId },
    select: { id: true, name: true, createdAt: true, isActive: true },
  });
}

async function revokeApiKey(apiKeyId: string) {
  return prisma.apiKey.update({
    where: { id: apiKeyId },
    data: { isActive: false },
    select: { id: true, name: true, createdAt: true, isActive: true },
  });
}

export const keysService = {
  createApiKey,
  listApiKeys,
  revokeApiKey,
};

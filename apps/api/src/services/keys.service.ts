import { createHash, randomBytes } from "crypto";
import prisma from "../lib/prisma";

const KEY_PREFIX = "thr_";

function hashKey(rawKey: string): string {
  const salt = process.env.API_KEY_SALT ?? "";
  return createHash("sha256").update(rawKey + salt).digest("hex");
}

function generateRawKey(): string {
  return KEY_PREFIX + randomBytes(32).toString("hex");
}

async function createApiKey(name: string, ownerId: string) {
  const rawKey = generateRawKey();
  const hashedKey = hashKey(rawKey);

  const apiKey = await prisma.apiKey.create({
    data: { name, key: hashedKey, ownerId },
    select: { id: true, name: true, createdAt: true, isActive: true },
  });
  // Return raw key exactly once — it is never stored
  return { ...apiKey, key: rawKey };
}

async function listApiKeys(ownerId: string) {
  return prisma.apiKey.findMany({
    where: { ownerId },
    select: { id: true, name: true, createdAt: true, isActive: true },
    orderBy: { createdAt: "desc" },
  });
}

async function revokeApiKey(id: string, ownerId: string) {
  const existing = await prisma.apiKey.findUnique({ where: { id } });
  if (!existing || existing.ownerId !== ownerId) return null;

  return prisma.apiKey.update({
    where: { id },
    data: { isActive: false },
    select: { id: true, name: true, createdAt: true, isActive: true },
  });
}

async function getOwnerKeyIds(ownerId: string): Promise<string[]> {
  const keys = await prisma.apiKey.findMany({
    where: { ownerId },
    select: { id: true },
  });
  return keys.map((k) => k.id);
}

export const keysService = {
  createApiKey,
  listApiKeys,
  revokeApiKey,
  getOwnerKeyIds,
};

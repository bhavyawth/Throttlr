import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { keysService } from "../services/keys.service";

// zod validation
const createKeySchema = z.object({
  name: z.string().min(1).max(100),
});

const createKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = createKeySchema.parse(req.body);
    const apiKey = await keysService.createApiKey(name);
    res.status(201).json({ success: true, data: apiKey });
  } catch (err) {
    next(err);
  }
};

const getKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = await keysService.listApiKeys(req.apiKey.id);
    res.json({ success: true, data: apiKey });
  } catch (err) {
    next(err);
  }
};

const revokeKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = await keysService.revokeApiKey(req.apiKey.id);
    res.json({ success: true, data: apiKey });
  } catch (err) {
    next(err);
  }
};

export const keysController = {
  createKey,
  getKey,
  revokeKey,
};

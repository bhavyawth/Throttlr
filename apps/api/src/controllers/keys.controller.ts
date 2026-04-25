import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { keysService } from "../services/keys.service";

const createKeySchema = z.object({
  name: z.string().min(1).max(100),
});

const listKeys = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const keys = await keysService.listApiKeys(req.clerkUserId!);
    res.json({ success: true, data: keys });
  } catch (err) {
    next(err);
  }
};

const createKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = createKeySchema.parse(req.body);
    const apiKey = await keysService.createApiKey(name, req.clerkUserId!);
    res.status(201).json({ success: true, data: apiKey });
  } catch (err) {
    next(err);
  }
};

const revokeKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await keysService.revokeApiKey(req.params.id, req.clerkUserId!);
    if (!result) {
      res.status(404).json({ success: false, error: "API key not found" });
      return;
    }
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const keysController = {
  listKeys,
  createKey,
  revokeKey,
};

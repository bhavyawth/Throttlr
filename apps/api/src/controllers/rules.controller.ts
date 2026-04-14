import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { rulesService } from "../services/rules.service";

// zod validation   
const createRuleSchema = z.object({
  name: z.string().min(1).max(100),
  windowSizeSeconds: z.number().int().positive().max(86400), // max 1 day
  maxRequests: z.number().int().positive().max(1_000_000),
  algorithm: z.enum(["SLIDING_WINDOW", "TOKEN_BUCKET"]).optional(),
});
const updateRuleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  windowSizeSeconds: z.number().int().positive().max(86400).optional(),
  maxRequests: z.number().int().positive().max(1_000_000).optional(),
  algorithm: z.enum(["SLIDING_WINDOW", "TOKEN_BUCKET"]).optional(),
});

const listRules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rules = await rulesService.getRulesByApiKey(req.apiKey.id);
    res.json({ success: true, data: rules });
  } catch (err) {
    next(err);
  }
};

const createRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createRuleSchema.parse(req.body);
    const rule = await rulesService.createRule({
      ...body,
      apiKeyId: req.apiKey.id, // scoped to the authenticated key
    });
    res.status(201).json({ success: true, data: rule });
  } catch (err) {
    next(err);
  }
};

const getRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rule = await rulesService.getRuleById(req.params.id, req.apiKey.id);
    res.json({ success: true, data: rule });
  } catch (err) {
    next(err);
  }
};

const updateRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = updateRuleSchema.parse(req.body);
    const rule = await rulesService.updateRule(req.params.id, req.apiKey.id, body);
    res.json({ success: true, data: rule });
  } catch (err) {
    next(err);
  }
};

const deleteRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await rulesService.deleteRule(req.params.id, req.apiKey.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const rulesController = {
  listRules,
  createRule,
  getRule,
  updateRule,
  deleteRule,
};

import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { rulesService } from "../services/rules.service";
import { keysService } from "../services/keys.service";

const createRuleSchema = z.object({
  name: z.string().min(1).max(100),
  apiKeyId: z.string().min(1),
  windowSizeSeconds: z.number().int().positive().max(86400),
  maxRequests: z.number().int().positive().max(1_000_000),
  algorithm: z.enum(["SLIDING_WINDOW", "TOKEN_BUCKET"]).optional(),
});

const updateRuleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  windowSizeSeconds: z.number().int().positive().max(86400).optional(),
  maxRequests: z.number().int().positive().max(1_000_000).optional(),
  algorithm: z.enum(["SLIDING_WINDOW", "TOKEN_BUCKET"]).optional(),
  isActive: z.boolean().optional(),
});

const listRules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const keyIds = await keysService.getOwnerKeyIds(req.clerkUserId!);
    const rules = await rulesService.getRulesByKeyIds(keyIds);
    res.json({ success: true, data: rules });
  } catch (err) {
    next(err);
  }
};

const createRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createRuleSchema.parse(req.body);
    const keyIds = await keysService.getOwnerKeyIds(req.clerkUserId!);

    if (!keyIds.includes(body.apiKeyId)) {
      res.status(403).json({ success: false, error: "API key does not belong to you" });
      return;
    }

    const rule = await rulesService.createRule({
      ...body,
      apiKeyId: body.apiKeyId,
    });
    res.status(201).json({ success: true, data: rule });
  } catch (err) {
    next(err);
  }
};

const getRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const keyIds = await keysService.getOwnerKeyIds(req.clerkUserId!);
    const rule = await rulesService.getRuleByIdForOwner(req.params.id, keyIds);
    if (!rule) {
      res.status(404).json({ success: false, error: "Rule not found" });
      return;
    }
    res.json({ success: true, data: rule });
  } catch (err) {
    next(err);
  }
};

const updateRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = updateRuleSchema.parse(req.body);
    const keyIds = await keysService.getOwnerKeyIds(req.clerkUserId!);
    const rule = await rulesService.updateRuleForOwner(req.params.id, keyIds, body);
    if (!rule) {
      res.status(404).json({ success: false, error: "Rule not found" });
      return;
    }
    res.json({ success: true, data: rule });
  } catch (err) {
    next(err);
  }
};

const deleteRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const keyIds = await keysService.getOwnerKeyIds(req.clerkUserId!);
    const deleted = await rulesService.deleteRuleForOwner(req.params.id, keyIds);
    if (!deleted) {
      res.status(404).json({ success: false, error: "Rule not found" });
      return;
    }
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

import { Router } from "express";
import { keysController } from "../controllers/keys.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const keysRouter = Router();

// no auth-middleware here
keysRouter.post("/", keysController.createKey);

keysRouter.get("/me", authMiddleware, keysController.getKey);
keysRouter.delete("/me", authMiddleware, keysController.revokeKey);

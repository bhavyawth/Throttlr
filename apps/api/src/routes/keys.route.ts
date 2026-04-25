import { Router } from "express";
import { keysController } from "../controllers/keys.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const keysRouter = Router();

// All key management routes require auth
keysRouter.use(authMiddleware);

keysRouter.get("/", keysController.listKeys);
keysRouter.post("/", keysController.createKey);
keysRouter.delete("/:id", keysController.revokeKey);

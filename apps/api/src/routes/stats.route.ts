import { Router } from "express";
import { statsController } from "../controllers/stats.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const statsRouter = Router();

// All stats routes require auth
statsRouter.use(authMiddleware);

statsRouter.get("/", statsController.getOverview);
statsRouter.get("/rules/:id", statsController.getRuleStats);
statsRouter.get("/logs", statsController.getLogs);

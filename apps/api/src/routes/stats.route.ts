import { Router } from "express";
import { statsController } from "../controllers/stats.controller";

export const statsRouter = Router();

statsRouter.get("/", statsController.getOverview);
statsRouter.get("/rules/:id", statsController.getRuleStats);
statsRouter.get("/logs", statsController.getLogs);

import { Router } from "express";
import { rulesController } from "../controllers/rules.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const rulesRouter = Router();

// All rule management routes require auth
rulesRouter.use(authMiddleware);

rulesRouter.get("/", rulesController.listRules);
rulesRouter.post("/", rulesController.createRule);
rulesRouter.get("/:id", rulesController.getRule);
rulesRouter.patch("/:id", rulesController.updateRule);
rulesRouter.delete("/:id", rulesController.deleteRule);

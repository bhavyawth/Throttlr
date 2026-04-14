import { Router } from "express";
import { rulesController } from "../controllers/rules.controller";

export const rulesRouter = Router();

// ── CRUD endpoints for rules (scoped to API key) ─────────────────────────────
rulesRouter.get("/", rulesController.listRules);
rulesRouter.post("/", rulesController.createRule);
rulesRouter.get("/:id", rulesController.getRule);
rulesRouter.patch("/:id", rulesController.updateRule);
rulesRouter.delete("/:id", rulesController.deleteRule);


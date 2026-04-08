// =============================================================================
// Route: /v1/rules (CRUD)
//
// What goes here:
//  - Express Router for managing rate limit rules
//  - GET    /v1/rules          → list all rules for the authenticated API key
//  - POST   /v1/rules          → create a new rule (validated with Zod)
//  - GET    /v1/rules/:id      → get a single rule by ID
//  - PATCH  /v1/rules/:id      → update a rule
//  - DELETE /v1/rules/:id      → delete a rule (soft delete preferred)
//  - All operations scoped to the authenticated API key (from auth middleware)
// =============================================================================

import { Router } from "express";

export const rulesRouter = Router();

// TODO: GET /v1/rules
rulesRouter.get("/", (_req, res) => {
  res.status(501).json({ success: false, error: "Not implemented" });
});

// TODO: POST /v1/rules
rulesRouter.post("/", (_req, res) => {
  res.status(501).json({ success: false, error: "Not implemented" });
});

// TODO: GET /v1/rules/:id
rulesRouter.get("/:id", (_req, res) => {
  res.status(501).json({ success: false, error: "Not implemented" });
});

// TODO: PATCH /v1/rules/:id
rulesRouter.patch("/:id", (_req, res) => {
  res.status(501).json({ success: false, error: "Not implemented" });
});

// TODO: DELETE /v1/rules/:id
rulesRouter.delete("/:id", (_req, res) => {
  res.status(501).json({ success: false, error: "Not implemented" });
});

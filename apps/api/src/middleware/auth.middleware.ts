// =============================================================================
// Middleware: Auth
//
// What goes here:
//  - Express middleware to authenticate every /v1/* request
//  - Extract API key from Authorization header: "Bearer <key>" or X-API-Key header
//  - Hash the raw key (SHA-256 + salt) and look it up in Prisma ApiKey table
//  - Reject with 401 if missing, 403 if invalid or inactive
//  - Attach the ApiKey record to req (extend Express Request type: req.apiKey)
//  - Cache valid keys in Redis for performance (TTL: 60s)
// =============================================================================

import type { Request, Response, NextFunction } from "express";

// TODO: Extend Express Request to include apiKey
// declare global { namespace Express { interface Request { apiKey: ApiKey } } }

export function authMiddleware(
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  // TODO: Implement API key authentication
  next();
}

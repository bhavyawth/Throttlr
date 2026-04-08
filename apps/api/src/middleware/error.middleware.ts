// =============================================================================
// Middleware: Error Handler
//
// What goes here:
//  - Express 4-argument error handling middleware (must be registered last)
//  - Catch ZodError → 400 with validation details
//  - Catch known custom errors (ThrottlrError, NotFoundError) → appropriate status
//  - Catch Prisma errors (P2002 unique constraint, P2025 not found) → mapped status
//  - All other errors → 500 with generic message (never leak stack in production)
//  - Log errors via pino logger (import from index.ts or a shared logger module)
//  - Response shape: { success: false, error: string, details?: unknown }
// =============================================================================

import type { Request, Response, NextFunction } from "express";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // TODO: Implement structured error handling
  res.status(500).json({
    success: false,
    error: err.message ?? "Internal server error",
  });
}

import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { logger } from "../lib/logger";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errorCode?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, "NOT_FOUND");
  }
}
export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, "CONFLICT");
  }
}

// to recieve error and get distinguished -> 4 args needed
export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // zod validation errors
  if (err instanceof ZodError) {
    const errors = err.issues.map((issue) => ({
      field: issue.path.length > 0 ? issue.path.join(".") : "unknown",
      message: issue.message,
    }));
    res.status(400).json({
      success: false,
      errorCode: "VALIDATION_ERROR",
      errors,
    });
    return;
  }
  // our own AppError / NotFoundError / ConflictError → use its status
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      errorCode: err.errorCode,
    });
    return;
  }
  // prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": 
        res.status(409).json({
          success: false,
          error: "Resource already exists",
          errorCode: "CONFLICT",
        });
        return;
      case "P2025": 
        res.status(404).json({
          success: false,
          error: "Resource not found",
          errorCode: "NOT_FOUND",
        });
        return;
    }
  }
  // everything else → 500
  logger.error({ err, stack: err.stack }, "Unhandled error");

  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
    errorCode: "INTERNAL_ERROR",
  });
}

// =============================================================================
// @throttlr/types — Shared Types
//
// This file exports all shared TypeScript interfaces, types, and enums
// used across the API, Dashboard, and SDK packages.
//
// What goes here:
//  - Rate limiting algorithm enums
//  - Rule / ApiKey / RequestLog DTOs (Data Transfer Objects)
//  - API request/response shapes
//  - SDK method parameter types
//  - Common pagination / error response types
// =============================================================================

// ── Enums ────────────────────────────────────────────────────────────────────

export enum Algorithm {
  SLIDING_WINDOW = "SLIDING_WINDOW",
  TOKEN_BUCKET = "TOKEN_BUCKET",
}

// ── API Key ───────────────────────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  name: string;
  key: string; // hashed — never return the raw key after creation
  isActive: boolean;
  createdAt: Date;
}

export interface ApiKeyCreateInput {
  name: string;
}

export interface ApiKeyCreateResponse {
  apiKey: ApiKey;
  rawKey: string; // returned ONCE on creation, never stored in plaintext
}

// ── Rule ─────────────────────────────────────────────────────────────────────

export interface Rule {
  id: string;
  name: string;
  windowSizeSeconds: number;
  maxRequests: number;
  algorithm: Algorithm;
  apiKeyId: string;
  createdAt: Date;
}

export interface RuleCreateInput {
  name: string;
  windowSizeSeconds: number;
  maxRequests: number;
  algorithm: Algorithm;
  apiKeyId: string;
}

// ── Request Log ───────────────────────────────────────────────────────────────

export interface RequestLog {
  id: string;
  userId: string;
  apiKeyId: string;
  allowed: boolean;
  timestamp: Date;
}

// ── Rate-Limit Check ──────────────────────────────────────────────────────────

export interface RateLimitCheckRequest {
  identifier: string; // e.g. user ID, IP address
  ruleId: string;
}

export interface RateLimitCheckResponse {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfterMs?: number;
}

// ── Common API Response ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}

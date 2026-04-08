// =============================================================================
// @throttlr/sdk — Types
//
// SDK-specific types and configuration interfaces.
// These supplement the shared @throttlr/types for SDK consumers.
//
// What goes here:
//  - ThrottlrClientOptions (base URL, API key, timeout, retry config)
//  - SDK-specific error classes (ThrottlrError, RateLimitError)
//  - Helper types for SDK method overloads
// =============================================================================

export interface ThrottlrClientOptions {
  /** Base URL of the Throttlr API (e.g. "https://api.throttlr.io") */
  baseUrl: string;
  /** Your Throttlr API key */
  apiKey: string;
  /** Request timeout in milliseconds. Default: 5000 */
  timeout?: number;
  /** Number of retries on network failure. Default: 0 */
  retries?: number;
}

export interface CheckOptions {
  /** Unique identifier for the entity being rate-limited (user ID, IP, etc.) */
  identifier: string;
  /** The ID of the rule to check against */
  ruleId: string;
}

export interface CheckResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfterMs?: number;
}

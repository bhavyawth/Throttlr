// =============================================================================
// @throttlr/sdk — RateLimiter Client
//
// This is the main SDK client class that consumers instantiate to interact
// with the Throttlr API.
//
// What goes here:
//  - Constructor accepting ThrottlrClientOptions
//  - Configured axios instance (base URL, auth header, timeout)
//  - check(options: CheckOptions): Promise<CheckResult>
//      → POST /v1/check — checks if a request is allowed
//  - createRule(input: RuleCreateInput): Promise<Rule>
//      → POST /v1/rules — creates a new rate limit rule
//  - getRules(): Promise<Rule[]>
//      → GET /v1/rules — lists all rules for the API key
//  - getStats(): Promise<StatsResponse>
//      → GET /v1/stats — fetches aggregate stats
//  - Error handling: throw ThrottlrError or RateLimitError on 4xx/5xx
// =============================================================================

import axios from "axios";
import type { AxiosInstance } from "axios";
import type { ThrottlrClientOptions, CheckOptions, CheckResult } from "./types";

export class RateLimiter {
  private readonly http: AxiosInstance;

  constructor(options: ThrottlrClientOptions) {
    // TODO: Initialize axios instance with baseUrl, apiKey auth header, and timeout
    this.http = axios.create({
      baseURL: options.baseUrl,
      timeout: options.timeout ?? 5000,
      headers: {
        "X-API-Key": options.apiKey,
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Check if a request should be allowed under the given rule.
   * @throws {Error} When the API returns a non-2xx response
   */
  async check(_options: CheckOptions): Promise<CheckResult> {
    // TODO: POST /v1/check with identifier and ruleId
    // TODO: Handle 429 responses by throwing RateLimitError
    throw new Error("Not implemented");
  }
}

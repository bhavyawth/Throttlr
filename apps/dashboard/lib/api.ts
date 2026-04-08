// =============================================================================
// lib/api.ts — Axios Instance
//
// What goes here:
//  - Create and export a pre-configured axios instance
//  - Base URL from NEXT_PUBLIC_API_URL env variable
//  - Request interceptor: attach JWT token from cookie/localStorage to Authorization header
//  - Response interceptor: handle 401 (redirect to /login), 429 (show toast)
//  - Type-safe wrapper functions for each endpoint:
//      - auth: login(), register(), logout()
//      - rules: getRules(), createRule(), updateRule(), deleteRule()
//      - apiKeys: getApiKeys(), createApiKey(), deleteApiKey()
//      - stats: getStats(), getLogs()
//      - check: checkRateLimit()
// =============================================================================

import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// TODO: Add request interceptor for auth headers
// TODO: Add response interceptor for error handling

export default api;

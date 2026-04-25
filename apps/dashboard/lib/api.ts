import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
});

api.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    try {
      // @ts-ignore - access global Clerk object injected by ClerkProvider
      const token = await window.Clerk?.session?.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // ignore
    }
  }
  return config;
});

// ── Typed API helpers ────────────────────────────────────────────────────────

export const dashboardApi = {
  // Keys
  listKeys: () => api.get("/keys"),
  createKey: (name: string) => api.post("/keys", { name }),
  revokeKey: (id: string) => api.delete(`/keys/${id}`),

  // Rules
  listRules: () => api.get("/rules"),
  createRule: (data: {
    name: string;
    apiKeyId: string;
    windowSizeSeconds: number;
    maxRequests: number;
    algorithm?: "SLIDING_WINDOW" | "TOKEN_BUCKET";
  }) => api.post("/rules", data),
  updateRule: (id: string, data: Record<string, unknown>) =>
    api.patch(`/rules/${id}`, data),
  deleteRule: (id: string) => api.delete(`/rules/${id}`),

  // Stats
  getOverview: (params?: { from?: string; to?: string }) =>
    api.get("/stats", { params }),
  getRuleStats: (id: string, params?: { from?: string; to?: string }) =>
    api.get(`/stats/rules/${id}`, { params }),
  getLogs: (params?: { page?: number; pageSize?: number; from?: string; to?: string }) =>
    api.get("/stats/logs", { params }),
};

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

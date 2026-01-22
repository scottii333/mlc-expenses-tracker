// lib/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api", // Default to /api for Next.js API routes
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

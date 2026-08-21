"use client";

import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    const apiKey = localStorage.getItem("orgApiKey") || localStorage.getItem("selectedOrgApiKey");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (apiKey) config.headers["x-api-key"] = apiKey;
  }
  return config;
});

export default api;

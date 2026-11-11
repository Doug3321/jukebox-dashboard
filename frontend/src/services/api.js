import axios from "axios";

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  timeout: 15000,
});

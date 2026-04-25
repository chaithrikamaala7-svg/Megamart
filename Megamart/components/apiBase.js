import { baseUrl } from "../src/Urls.js";

const configuredBase =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  baseUrl ||
  "http://localhost:3001";

export const API_BASE_URL = String(configuredBase).replace(/\/$/, "");

export function apiUrl(path) {
  if (!path) return API_BASE_URL;
  if (String(path).startsWith("http")) return String(path);
  if (String(path).startsWith("/")) return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/${path}`;
}

export function assetUrl(imageUrl) {
  if (!imageUrl) return "";
  
  const u = String(imageUrl).trim();

  // Normalize old localhost image URLs stored in DB
  if (u.startsWith("http://localhost:3001") || u.startsWith("https://localhost:3001")) {
    const path = u.replace(/^https?:\/\/localhost:3001/, "");
    return path.startsWith("/") ? `${API_BASE_URL}${path}` : `${API_BASE_URL}/${path}`;
  }

  if (u.startsWith("http")) return u;

  if (u.startsWith("/")) return `${API_BASE_URL}${u}`;
  if (u.startsWith("uploads/")) return `${API_BASE_URL}/${u}`;
  return u;
}


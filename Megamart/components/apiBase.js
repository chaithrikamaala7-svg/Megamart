import { baseUrl } from "../src/Urls.js";

export const API_BASE_URL = String(baseUrl || "http://localhost:3001").replace(/\/$/, "");

export function apiUrl(path) {
  if (!path) return API_BASE_URL;
  if (String(path).startsWith("http")) return String(path);
  if (String(path).startsWith("/")) return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/${path}`;
}

export function assetUrl(imageUrl) {
  if (!imageUrl) return "";
  
  const u = String(imageUrl);

  if (u.startsWith("http")) return u;

  if (u.startsWith("/")) return `${API_BASE_URL}${u}`;
  return u;
}


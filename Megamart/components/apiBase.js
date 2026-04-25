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
  
  const u = String(imageUrl);

  if (u.startsWith("http")) return u;

  if (u.startsWith("/")) return `${API_BASE_URL}${u}`;
  return u;
}


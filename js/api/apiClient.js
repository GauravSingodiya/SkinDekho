// js/api/apiClient.js

import { BASE_URL, DEFAULT_HEADERS } from "./config.js";

async function apiRequest(endpoint, method = "GET", body = null, token = null) {
  const headers = { ...DEFAULT_HEADERS };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(BASE_URL + endpoint, options);

    // 👇 IMPORTANT: read text first (prevents JSON crash)
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(data.message || "API Error");
    }

    return data;
  } catch (error) {
    console.error("FETCH FAILED:", error);
    throw error;
  }
}

export default apiRequest;

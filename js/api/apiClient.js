// js/api/apiClient.js

import { BASE_URL, DEFAULT_HEADERS } from "./config.js";

async function apiRequest(endpoint, method = "GET", body = null, token = null) {
  const headers = { ...DEFAULT_HEADERS };

  if (body instanceof FormData) {
    delete headers["Content-Type"];
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(BASE_URL + endpoint, options);

    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {}

    if (!response.ok) {
      let errMsg = data.message || data.title || response.statusText || `HTTP ${response.status} Error`;
      if (response.status === 404) {
        errMsg = `Product or Endpoint Not Found (HTTP 404). Verify if product ID ${endpoint.split('/').pop()} exists or route '${method} ${endpoint}' is deployed.`;
      } else if (response.status === 401 || response.status === 403) {
        errMsg = `Admin Authorization Failed (HTTP ${response.status}). Please verify token or log in again as Admin.`;
      } else if (data.errors && typeof data.errors === "object") {
        const details = Object.entries(data.errors)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ");
        if (details) {
          errMsg += ` (${details})`;
        }
      }
      throw new Error(errMsg);
    }

    return data;
  } catch (error) {
    console.error("FETCH FAILED:", error.message);
    throw error;
  }
}

export default apiRequest;

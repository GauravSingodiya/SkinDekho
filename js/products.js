// products.js
import apiRequest from "./api/apiClient.js";
import { API } from "./api/endpoints.js";

export function getAllProducts(category = "") {
  const url = category
    ? `${API.PRODUCTS.GET_ALL}/${encodeURIComponent(category)}`
    : API.PRODUCTS.GET_ALL;

  return apiRequest(url, "GET");
}

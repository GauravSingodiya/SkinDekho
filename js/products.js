import apiRequest from "./api/apiClient.js";
import { API } from "./api/endpoints.js";

export function getAllProducts() {
  return apiRequest(API.PRODUCTS.GET_ALL, "GET");
}

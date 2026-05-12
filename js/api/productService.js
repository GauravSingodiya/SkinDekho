import apiRequest from "./apiClient.js";
import { API } from "./endpoints.js";

export async function addProductAPI(formData, token) {
  console.log("Adding Product Body:", Object.fromEntries(formData.entries()));
  return await apiRequest(API.PRODUCTS.ADD, "POST", formData, token);
}

export async function updateProductAPI(id, formData, token) {
  return await apiRequest(API.PRODUCTS.UPDATE(id), "PUT", formData, token);
}

export async function deleteProductAPI(id, token) {
  return await apiRequest(API.PRODUCTS.DELETE(id), "DELETE", null, token);
}

export async function getAllProductsAPI() {
  return await apiRequest(API.PRODUCTS.GET_ALL, "GET");
}

import apiRequest from "./apiClient.js";
import { API } from "./endpoints.js";

export async function addProductAPI(formData, token) {
  const bodyLog = Object.fromEntries(formData.entries());
  const parsedLog = {
    ...bodyLog,
    Price: bodyLog.Price ? parseFloat(bodyLog.Price) : null,
    DiscountPrice: bodyLog.DiscountPrice ? parseFloat(bodyLog.DiscountPrice) : null,
    StockQuantity: bodyLog.StockQuantity ? parseInt(bodyLog.StockQuantity, 10) : null,
    Isfeatureproduct: bodyLog.Isfeatureproduct === "true",
    CategoryId: bodyLog.CategoryId ? parseInt(bodyLog.CategoryId, 10) : null,
  };
  console.log("Adding Product Body:", parsedLog);
  return await apiRequest(API.PRODUCTS.ADD, "POST", formData, token);
}

export async function updateProductAPI(id, formData, token) {
  const bodyLog = Object.fromEntries(formData.entries());
  const parsedLog = {
    ...bodyLog,
    Price: bodyLog.Price ? parseFloat(bodyLog.Price) : null,
    DiscountPrice: bodyLog.DiscountPrice ? parseFloat(bodyLog.DiscountPrice) : null,
    StockQuantity: bodyLog.StockQuantity ? parseInt(bodyLog.StockQuantity, 10) : null,
    Isfeatureproduct: bodyLog.Isfeatureproduct === "true",
  };
  console.log("Updating Product Body:", parsedLog);
  return await apiRequest(API.PRODUCTS.UPDATE(id), "PUT", formData, token);
}

export async function deleteProductAPI(id, token) {
  return await apiRequest(API.PRODUCTS.DELETE(id), "DELETE", null, token);
}

export async function getAllProductsAPI() {
  return await apiRequest(API.PRODUCTS.GET_ALL, "GET");
}

export async function addCategoryAPI(formData, token) {
  return await apiRequest(API.PRODUCTS.ADD_CATEGORY, "POST", formData, token);
}

export async function updateCategoryAPI(id, formData, token) {
  return await apiRequest(API.PRODUCTS.UPDATE_CATEGORY(id), "POST", formData, token);
}

export async function deleteCategoryAPI(id, token) {
  return await apiRequest(API.PRODUCTS.DELETE_CATEGORY(id), "DELETE", null, token);
}

export async function saveProductDetailsAPI(id, payload, token) {
  return await apiRequest(API.PRODUCTS.SAVE_DETAILS(id), "POST", payload, token);
}

export async function deleteProductImageAPI(id, token) {
  return await apiRequest(API.PRODUCTS.DELETE_PRODUCT_IMAGE(id), "DELETE", null, token);
}

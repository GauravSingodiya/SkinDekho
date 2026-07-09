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
  return await apiRequest("/api/Products/AddCategory", "POST", formData, token);
}

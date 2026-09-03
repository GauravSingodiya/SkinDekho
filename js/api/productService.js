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
  console.log(`Updating Product ID ${id} Body:`, bodyLog);

  formData.set("id", id.toString());
  formData.set("Id", id.toString());

  try {
    return await apiRequest(API.PRODUCTS.UPDATE(id), "PUT", formData, token);
  } catch (err) {
    if (err.message && (err.message.includes("405") || err.message.includes("Method Not Allowed"))) {
      console.warn("PUT to UpdateProduct failed with 405 (proxy block), retrying with POST...", err.message);
      return await apiRequest(API.PRODUCTS.UPDATE(id), "POST", formData, token);
    }
    throw err;
  }
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

export async function getProductByIdAPI(id) {
  return await apiRequest(API.PRODUCTS.GET_BY_ID(id), "GET");
}

export async function deleteProductImageAPI(productId, imageId, token) {
  return await apiRequest(API.PRODUCTS.DELETE_PRODUCT_IMAGE(productId, imageId), "DELETE", null, token);
}

export async function setPrimaryImageAPI(productId, imageId, token) {
  return await apiRequest(API.PRODUCTS.SET_PRIMARY_IMAGE(productId, imageId), "POST", {}, token);
}

export async function reorderProductImagesAPI(productId, imageIds, token) {
  return await apiRequest(API.PRODUCTS.REORDER_PRODUCT_IMAGES(productId), "POST", { imageIds }, token);
}

// products.js
import apiRequest from "./api/apiClient.js";
import { API } from "./api/endpoints.js";

export function getAllProducts(category = "") {
  const url = category
    ? `${API.PRODUCTS.GET_ALL}/${encodeURIComponent(category)}`
    : API.PRODUCTS.GET_ALL;

  return apiRequest(url, "GET");
}

export function getProductsByFilter({
  category = "",
  priceUnder = "",
  priceSort = "",
  productName = "",
} = {}) {
  const params = new URLSearchParams();

  if (category) params.append("category", category);
  if (priceUnder) params.append("priceUnder", priceUnder);
  if (priceSort) params.append("priceSort", priceSort);
  if (productName) params.append("productName", productName);
  console.log(
    "`${API.PRODUCTS.FILTER}",
    `${API.PRODUCTS.FILTER}?${params.toString()}`
  );
  return apiRequest(`${API.PRODUCTS.FILTER}?${params.toString()}`, "GET");
}

export function getAllCategories() {
  return apiRequest(API.PRODUCTS.CATEGORIES, "GET");
}

export function getFeaturedProducts() {
  return apiRequest(API.PRODUCTS.FEATURED, "GET");
}

export async function getProductById(id) {
  // Try to find in all products since there's no specific detail endpoint in endpoints.js
  const res = await getAllProducts();
  const products = res.result || res || [];
  return products.find((p) => p.id == id);
}
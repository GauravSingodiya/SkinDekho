// js/api/cartService.js
import apiRequest from "./apiClient.js";
import { API } from "./endpoints.js";

/**
 * Adds a product to the cart via API
 * @param {number} productId 
 * @param {number} quantity 
 * @param {string} token 
 * @returns {Promise}
 */
export function addToCartAPI(productId, quantity, token) {
  const body = {
    productId,
    quantity
  };
  return apiRequest(API.CART.ADD, "POST", body, token);
}

/**
 * Fetches the current cart from the API
 * @param {string} token 
 * @returns {Promise}
 */
export function getCartAPI(token) {
  return apiRequest(API.CART.LIST, "GET", null, token);
}

/**
 * Removes an item from the cart via API
 * @param {number} itemId 
 * @param {string} token 
 * @returns {Promise}
 */
export function removeFromCartAPI(itemId, token) {
  return apiRequest(API.CART.REMOVE(itemId), "DELETE", null, token);
}

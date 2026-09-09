// js/api/cartService.js
import apiRequest from "./apiClient.js";
import { API } from "./endpoints.js";

/**
 * Adds a product to the cart via API
 * @param {number} productId 
 * @param {number} quantity 
 * @param {string} token 
 * @param {object|number|string} [variant=null] - Selected variant object or variant ID
 * @param {string} [optionalSize=null] - Optional size string
 * @returns {Promise}
 */
export function addToCartAPI(productId, quantity, token, variant = null, optionalSize = null) {
  const pId = parseInt(productId, 10) || productId;
  const qty = parseInt(quantity, 10) || 1;

  const body = {
    productId: pId,
    ProductId: pId,
    quantity: qty,
    Quantity: qty,
  };

  let productVariantId = null;
  let selectedSize = null;

  if (variant) {
    if (typeof variant === "object") {
      const vId =
        variant.productVariantId ??
        variant.ProductVariantId ??
        variant.variantId ??
        variant.VariantId ??
        variant.id ??
        variant.Id ??
        null;
      if (vId !== null && vId !== undefined && vId !== "" && !isNaN(vId)) {
        productVariantId = parseInt(vId, 10);
      }

      const rawSize =
        variant.size ??
        variant.Size ??
        variant.variant ??
        variant.Variant ??
        variant.name ??
        variant.Name ??
        optionalSize ??
        null;
      if (rawSize !== null && rawSize !== undefined && String(rawSize).trim() !== "") {
        selectedSize = String(rawSize).trim();
      }
    } else if (
      typeof variant === "number" ||
      (!isNaN(variant) && typeof variant === "string" && String(variant).trim() !== "" && !isNaN(Number(variant)))
    ) {
      productVariantId = parseInt(variant, 10);
      if (optionalSize && String(optionalSize).trim()) {
        selectedSize = String(optionalSize).trim();
      }
    } else if (typeof variant === "string" && variant.trim() !== "") {
      selectedSize = variant.trim();
      if (optionalSize !== null && optionalSize !== undefined && !isNaN(optionalSize)) {
        productVariantId = parseInt(optionalSize, 10);
      }
    }
  }

  if (!selectedSize && optionalSize && typeof optionalSize === "string" && optionalSize.trim()) {
    selectedSize = optionalSize.trim();
  }

  // ✅ Send productVariantId ONLY IF selected
  if (productVariantId !== null && productVariantId !== undefined && !isNaN(productVariantId)) {
    body.productVariantId = productVariantId;
    body.ProductVariantId = productVariantId;
  }

  // ✅ Send size ONLY IF selected
  if (selectedSize !== null && selectedSize !== undefined && String(selectedSize).trim() !== "") {
    body.size = String(selectedSize).trim();
    body.Size = String(selectedSize).trim();
  }

  console.log("🛒 Sending Add to Cart Payload:", body);
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

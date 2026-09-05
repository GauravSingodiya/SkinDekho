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
export function addToCartAPI(productId, quantity, token, variant = null) {
  const pId = parseInt(productId, 10) || productId;
  const qty = parseInt(quantity, 10) || 1;

  const body = {
    productId: pId,
    ProductId: pId,
    quantity: qty,
    Quantity: qty,
  };

  if (variant) {
    const sizeVal = typeof variant === "object" ? (variant.size || variant.Size || variant.name || variant.Name || "") : variant;
    const vId = typeof variant === "object" ? (variant.id ?? variant.Id ?? null) : null;
    const regPrice = typeof variant === "object" ? (variant.price ?? variant.Price ?? null) : null;
    const discPrice = typeof variant === "object" ? (variant.discountPrice ?? variant.DiscountPrice ?? null) : null;
    const effectivePrice = (discPrice !== null && discPrice !== "" && discPrice !== undefined && (!regPrice || parseFloat(discPrice) < parseFloat(regPrice)))
      ? parseFloat(discPrice)
      : (regPrice ? parseFloat(regPrice) : null);

    body.variant = sizeVal;
    body.Variant = sizeVal;
    body.variantName = sizeVal;
    body.VariantName = sizeVal;
    body.size = sizeVal;
    body.Size = sizeVal;

    if (vId) {
      body.variantId = vId;
      body.VariantId = vId;
      body.productVariantId = vId;
      body.ProductVariantId = vId;
    }
    if (effectivePrice !== null && effectivePrice !== undefined) {
      body.price = effectivePrice;
      body.Price = effectivePrice;
      body.unitPrice = effectivePrice;
      body.UnitPrice = effectivePrice;
    }
    if (discPrice !== null && discPrice !== "" && discPrice !== undefined) {
      body.discountPrice = parseFloat(discPrice);
      body.DiscountPrice = parseFloat(discPrice);
    }
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

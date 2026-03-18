// js/cart.js - Now a module

import { getCartAPI, removeFromCartAPI } from "./api/cartService.js";

$(document).ready(function () {
  const token = sessionStorage.getItem("token");
  if (!token) {
    $("#cart-items").html('<tr><td colspan="6" class="text-center">Please login to view your cart.</td></tr>');
    return;
  }
  loadCartItems(token);
  syncCartBadge(token); 
});

async function loadCartItems(token) {
  const $cartTableBody = $("#cart-items");
  $cartTableBody.html('<tr><td colspan="6" class="text-center"><div class="spinner-border text-primary" role="status"></div> Loading cart...</td></tr>');

  try {
    const res = await getCartAPI(token);
    const cartItems = res.result?.items || res.result || [];
    $cartTableBody.empty();

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      $cartTableBody.html('<tr><td colspan="6" class="text-center">Your cart is empty.</td></tr>');
      updateCartTotals([]);
      return;
    }

    cartItems.forEach((item) => {
      const price = item.productPrice || 0;
      const quantity = item.quantity || 1;
      const total = (price * quantity).toFixed(2);
      const imageUrl = item.imageUrl || "img/product-default.jpg";
      const name = item.productName || "Product";
      const productId = item.productId;
      
      const row = `
        <tr data-id="${productId}">
          <th scope="row">
            <div class="d-flex align-items-center">
              <img src="${imageUrl}" class="img-fluid me-5 rounded-circle" style="width: 80px; height: 80px;" alt="${name}">
            </div>
          </th>
          <td>
            <p class="mb-0 mt-4">${name}</p>
          </td>
          <td>
            <p class="mb-0 mt-4">₹${price}</p>
          </td>
          <td>
            <div class="input-group quantity mt-4 bg-light rounded-pill p-1" style="width: 120px; border: 1px solid #e9ecef;">
              <div class="input-group-btn">
                <button class="btn btn-sm btn-minus rounded-circle bg-white border-0 shadow-sm" style="width: 30px; height: 30px; padding: 0;">
                  <i class="fa fa-minus text-primary" style="font-size: 0.8rem;"></i>
                </button>
              </div>
              <input type="text" class="form-control form-control-sm text-center border-0 bg-transparent fw-bold" value="${quantity}" readonly style="box-shadow: none;">
              <div class="input-group-btn">
                <button class="btn btn-sm btn-plus rounded-circle bg-white border-0 shadow-sm" style="width: 30px; height: 30px; padding: 0;">
                  <i class="fa fa-plus text-primary" style="font-size: 0.8rem;"></i>
                </button>
              </div>
            </div>
          </td>
          <td>
            <p class="mb-0 mt-4 item-total">₹${total}</p>
          </td>
          <td>
            <button class="btn btn-md rounded-circle bg-light border mt-4 btn-remove">
              <i class="fa fa-times text-danger"></i>
            </button>
          </td>
        </tr>
      `;
      $cartTableBody.append(row);
    });
    
    updateCartTotals(cartItems);
  } catch (err) {
    console.error("Failed to load cart items:", err);
    $cartTableBody.html('<tr><td colspan="6" class="text-center text-danger">Failed to load cart. Please try again.</td></tr>');
  }
}

function updateCartTotals(cartItems) {
  let subtotal = 0;
  
  cartItems.forEach(item => {
    const price = item.productPrice || 0;
    const quantity = item.quantity || 1;
    subtotal += price * quantity;
  });
  
  const shipping = 0; // The API might handle shipping or it's free
  const total = subtotal + shipping;
  
  $("#cart-subtotal").text(`₹${subtotal.toFixed(2)}`);
  $("#cart-shipping").text(`Free`);
  $("#cart-total").text(`₹${total.toFixed(2)}`);
}

// Remove Item
$(document).on("click", ".btn-remove", async function () {
  const itemId = $(this).closest("tr").data("id");
  const token = sessionStorage.getItem("token");
  
  if (!confirm("Are you sure you want to remove this item?")) return;

  try {
    await removeFromCartAPI(itemId, token);
    loadCartItems(token);
    syncCartBadge(token);
  } catch (err) {
    alert("Failed to remove item: " + err.message);
  }
});

// Change Quantity
$(document).on("click", ".btn-plus, .btn-minus", async function () {
  const isPlus = $(this).hasClass("btn-plus");
  const productId = $(this).closest("tr").data("id");
  const token = sessionStorage.getItem("token");
  
  const quantityChange = isPlus ? 1 : -1;
  const currentQty = parseInt($(this).closest(".quantity").find("input").val());
  
  if (!isPlus && currentQty <= 1) return; // Prevent decrementing below 1

  const $btn = $(this);
  const originalHtml = $btn.html();
  $btn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');

  try {
    const { addToCartAPI } = await import("./api/cartService.js");
    const res = await addToCartAPI(productId, quantityChange, token);
    
    // Refresh cart
    loadCartItems(token);
    syncCartBadge(token);
  } catch (err) {
    console.error("Update Quantity Error:", err);
    alert("Failed to update quantity. Please try again.");
  } finally {
    $btn.prop("disabled", false).html(originalHtml);
  }
});

async function syncCartBadge(token) {
  try {
    const res = await getCartAPI(token);
    const cartItems = res.result?.items || res.result || [];
    const totalItems = Array.isArray(cartItems) 
      ? cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
      : 0;
    $(".fa-shopping-bag").next("span").text(totalItems);
  } catch (err) {
    console.error("Failed to sync badge:", err);
  }
}

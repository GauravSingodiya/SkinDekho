// js/cart.js - Now a module

import { getCartAPI, removeFromCartAPI } from "./api/cartService.js";
import { getAllProducts } from "./products.js";
import { BASE_URL } from "./api/config.js";
import { showConfirm, showToast, syncCartBadge } from "./main.js";

function getAuthToken() {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  if (!token || token === "null" || token === "undefined") {
    return null;
  }
  return token;
}

$(document).ready(function () {
  const token = getAuthToken();
  if (!token) {
    // ✅ Guest: show localStorage cart
    loadGuestCart();
  } else {
    loadCartItems(token);
  }
  syncCartBadge();

  // ✅ Proceed to Checkout — login required
  $(document).on("click", "#checkoutBtn, .checkout-btn, a[href='chackout.html'], a[href='checkout.html']", function (e) {
    const t = getAuthToken();
    if (!t) {
      e.preventDefault();
      e.stopImmediatePropagation();
      $("#authModal").modal("show");
    }
  });
});

// ✅ Guest cart display from localStorage
function loadGuestCart() {
  const $cartTableBody = $("#cart-items");
  const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");

  if (!guestCart.length) {
    $cartTableBody.html('<tr><td colspan="6" class="text-center">Your cart is empty. <a href="shop.html">Continue Shopping</a></td></tr>');
    updateCartTotals([]);
    return;
  }

  $cartTableBody.empty();
  const mappedItems = guestCart.map((item, index) => ({
    index: index,
    productId: item.id,
    productName: item.name,
    productPrice: item.price,
    effectivePrice: item.price,
    variantSize: item.variant || (item.variantDetails ? (item.variantDetails.size || item.variantDetails.name) : null),
    imageUrl: item.imageUrl,
    quantity: item.quantity,
  }));

  mappedItems.forEach((item) => {
    const price = item.effectivePrice || item.productPrice || 0;
    const quantity = item.quantity || 1;
    const total = (price * quantity).toFixed(2);

    const relativeImgUrl = item.imageUrl || "";
    const fullImgUrl = relativeImgUrl.startsWith("http")
      ? relativeImgUrl
      : relativeImgUrl
        ? (BASE_URL + relativeImgUrl)
        : "img/product-default.jpg";

    const name = item.productName || "Product";
    const productId = item.productId;
    const vBadge = item.variantSize
      ? `<span class="badge bg-light text-primary border border-primary-subtle px-2 py-1 mt-1 d-inline-block" style="font-size: 0.78rem; border-radius: 6px;">Size: ${item.variantSize}</span>`
      : "";

    const row = `
      <tr data-id="${productId}" data-index="${item.index}" data-variant="${item.variantSize || ''}">
        <th scope="row">
          <div class="d-flex align-items-center">
            <img src="${fullImgUrl}" class="img-fluid me-5 rounded-circle" style="width: 80px; height: 80px;" alt="${name}">
          </div>
        </th>
        <td>
          <p class="mb-0 mt-3 fw-bold text-dark">${name}</p>
          ${vBadge}
        </td>
        <td><p class="mb-0 mt-4 fw-semibold text-dark">₹${price}</p></td>
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
        <td><p class="mb-0 mt-4 item-total fw-bold text-dark">₹${total}</p></td>
        <td>
          <button class="btn btn-md rounded-circle bg-light border mt-4 btn-remove">
            <i class="fa fa-times text-danger"></i>
          </button>
        </td>
      </tr>
    `;
    $cartTableBody.append(row);
  });

  updateCartTotals(mappedItems);
  syncCartBadge();
}

async function loadCartItems(token) {
  const $cartTableBody = $("#cart-items");
  $cartTableBody.html('<tr><td colspan="6" class="text-center"><div class="spinner-border text-primary" role="status"></div> Loading cart...</td></tr>');

  try {
    const [res, productsRes] = await Promise.all([
      getCartAPI(token),
      getAllProducts().catch(() => ({ result: [] })),
    ]);

    const cartItems = res.result?.items || res.result || [];
    const allProducts = productsRes.result || productsRes || [];
    const cartVariants = JSON.parse(localStorage.getItem("cartVariants") || "{}");

    $cartTableBody.empty();

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      $cartTableBody.html('<tr><td colspan="6" class="text-center">Your cart is empty.</td></tr>');
      updateCartTotals([]);
      return;
    }

    cartItems.forEach((item, index) => {
      const pId = item.productId || item.id;
      const savedVar = cartVariants[pId] || null;

      // Extract variant size and price
      let variantSize = item.size || item.Size || item.variant || item.variantName || (savedVar ? savedVar.size : null);
      let effectivePrice = item.variantPrice || (savedVar ? savedVar.price : null);

      // Match against product's variants list from allProducts
      const productObj = allProducts.find((p) => p.id == pId);
      if (productObj) {
        const rawVars = productObj.variants || productObj.Variants || productObj.variantsJson || productObj.VariantsJson || [];
        let pVariants = [];
        if (Array.isArray(rawVars)) {
          pVariants = rawVars.map((v) => {
            if (typeof v === "string") {
              try { return JSON.parse(v); } catch (e) { return { size: v, name: v, price: productObj.price, discountPrice: productObj.discountPrice }; }
            }
            return v;
          });
        } else if (typeof rawVars === "string" && rawVars.trim()) {
          try { pVariants = JSON.parse(rawVars); } catch (e) {}
        }

        if (pVariants.length > 0) {
          const itmVarId = item.variantId || item.VariantId || item.productVariantId || item.ProductVariantId || (savedVar ? savedVar.variantId : null);
          const itmSizeNorm = (variantSize || "").toString().trim().toLowerCase();

          const matchedVar = pVariants.find((pv) => {
            const pvId = pv.id ?? pv.Id;
            const pvSizeNorm = (pv.size || pv.Size || pv.name || pv.Name || "").toString().trim().toLowerCase();
            return (itmVarId && pvId == itmVarId) || (itmSizeNorm && pvSizeNorm && (pvSizeNorm === itmSizeNorm || pvSizeNorm.includes(itmSizeNorm) || itmSizeNorm.includes(pvSizeNorm)));
          }) || (savedVar ? null : (pVariants.length === 1 ? pVariants[0] : null));

          if (matchedVar) {
            variantSize = matchedVar.size || matchedVar.Size || matchedVar.name || matchedVar.Name;
            const regP = matchedVar.price ?? matchedVar.Price;
            const discP = matchedVar.discountPrice ?? matchedVar.DiscountPrice;
            effectivePrice = (discP !== null && discP !== "" && discP !== undefined && (!regP || parseFloat(discP) < parseFloat(regP)))
              ? parseFloat(discP)
              : parseFloat(regP);
          }
        }
      }

      // If effectivePrice resolved, use it; otherwise fallback to item.productPrice
      const price = (effectivePrice !== null && effectivePrice !== undefined && !isNaN(parseFloat(effectivePrice)))
        ? parseFloat(effectivePrice)
        : (parseFloat(item.productPrice) || 0);

      item.effectivePrice = price;
      item.variantSize = variantSize;

      const quantity = parseInt(item.quantity) || 1;
      const total = (price * quantity).toFixed(2);

      const relativeImgUrl = item.imageUrl || "";
      const fullImgUrl = relativeImgUrl.startsWith("http")
        ? relativeImgUrl
        : relativeImgUrl
          ? (BASE_URL + relativeImgUrl)
          : "img/product-default.jpg";

      const name = item.productName || (productObj ? productObj.name : "Product");
      const vBadge = variantSize
        ? `<span class="badge bg-light text-primary border border-primary-subtle px-2 py-1 mt-1 d-inline-block" style="font-size: 0.78rem; border-radius: 6px;">Size: ${variantSize}</span>`
        : "";

      const row = `
        <tr data-id="${pId}" data-index="${index}" data-variant="${variantSize || ''}">
          <th scope="row">
            <div class="d-flex align-items-center">
              <img src="${fullImgUrl}" class="img-fluid me-5 rounded-circle" style="width: 80px; height: 80px;" alt="${name}">
            </div>
          </th>
          <td>
            <p class="mb-0 mt-3 fw-bold text-dark">${name}</p>
            ${vBadge}
          </td>
          <td>
            <p class="mb-0 mt-4 fw-semibold text-dark">₹${price}</p>
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
            <p class="mb-0 mt-4 item-total fw-bold text-dark">₹${total}</p>
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
    syncCartBadge();
  } catch (err) {
    console.error("Failed to load cart items:", err);
    $cartTableBody.html('<tr><td colspan="6" class="text-center text-danger">Failed to load cart. Please try again.</td></tr>');
  }
}

function updateCartTotals(cartItems) {
  let subtotal = 0;

  cartItems.forEach((item) => {
    const price = parseFloat(item.effectivePrice ?? item.productPrice ?? 0) || 0;
    const quantity = parseInt(item.quantity) || 1;
    subtotal += price * quantity;
  });

  const shipping = (subtotal > 0 && subtotal <= 500) ? 50 : 0;
  const total = subtotal + shipping;

  $("#cart-subtotal").text(`₹${subtotal.toFixed(2)}`);
  if (subtotal === 0) {
    $("#cart-shipping").html('<span class="text-muted">₹0.00</span>');
  } else if (shipping > 0) {
    $("#cart-shipping").html('<span class="text-dark fw-bold">₹50.00</span> <small class="text-muted d-block" style="font-size: 0.75rem;">(Free shipping over ₹500)</small>');
  } else {
    $("#cart-shipping").html('<span class="text-success fw-bold">Free</span> <small class="text-muted d-block" style="font-size: 0.75rem;">(Order over ₹500)</small>');
  }
  $("#cart-total").text(`₹${total.toFixed(2)}`);
}

// Remove Item
$(document).on("click", ".btn-remove", async function () {
  const $row = $(this).closest("tr");
  const itemId = $row.data("id");
  const itemIndex = $row.data("index");
  const variantSize = $row.data("variant");
  const token = getAuthToken();

  const confirmed = await showConfirm("Remove Item", "Are you sure you want to remove this item from your cart?");
  if (!confirmed) return;

  if (!token) {
    let guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
    if (typeof itemIndex !== "undefined" && itemIndex !== null && guestCart[itemIndex]) {
      guestCart.splice(itemIndex, 1);
    } else {
      const idx = guestCart.findIndex((it) => {
        const v = it.variant || (it.variantDetails ? (it.variantDetails.size || it.variantDetails.name) : null);
        return it.id == itemId && (!variantSize || v == variantSize);
      });
      if (idx !== -1) {
        guestCart.splice(idx, 1);
      }
    }
    localStorage.setItem("guestCart", JSON.stringify(guestCart));
    loadGuestCart();
    syncCartBadge();
    showToast("Item removed from cart", "success");
    return;
  }

  const $btn = $(this);
  const originalHtml = $btn.html();
  $btn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');

  try {
    await removeFromCartAPI(itemId, token);
    loadCartItems(token);
    syncCartBadge();
    showToast("Item removed from cart", "success");
  } catch (err) {
    showToast(err.message || "Failed to remove item", "error");
  } finally {
    $btn.prop("disabled", false).html(originalHtml);
  }
});

// Change Quantity
$(document).on("click", ".btn-plus, .btn-minus", async function () {
  const isPlus = $(this).hasClass("btn-plus");
  const $row = $(this).closest("tr");
  const productId = $row.data("id");
  const itemIndex = $row.data("index");
  const variantSize = $row.data("variant");
  const token = getAuthToken();

  const quantityChange = isPlus ? 1 : -1;
  const currentQty = parseInt($row.find(".quantity input").val(), 10) || 1;

  if (!isPlus && currentQty <= 1) {
    const confirmed = await showConfirm("Remove Item", "Are you sure you want to remove this item from your cart?");
    if (!confirmed) return;

    if (!token) {
      let guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      if (typeof itemIndex !== "undefined" && itemIndex !== null && guestCart[itemIndex]) {
        guestCart.splice(itemIndex, 1);
      } else {
        const idx = guestCart.findIndex((it) => {
          const v = it.variant || (it.variantDetails ? (it.variantDetails.size || it.variantDetails.name) : null);
          return it.id == productId && (!variantSize || v == variantSize);
        });
        if (idx !== -1) {
          guestCart.splice(idx, 1);
        }
      }
      localStorage.setItem("guestCart", JSON.stringify(guestCart));
      loadGuestCart();
      syncCartBadge();
      showToast("Item removed from cart", "success");
      return;
    }

    const $btn = $(this);
    const originalHtml = $btn.html();
    $btn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');

    try {
      await removeFromCartAPI(productId, token);
      loadCartItems(token);
      syncCartBadge();
      showToast("Item removed from cart", "success");
    } catch (err) {
      console.error("Remove Item Error:", err);
      showToast("Failed to remove item. Please try again.", "error");
    } finally {
      $btn.prop("disabled", false).html(originalHtml);
    }
    return;
  }

  // Guest Cart Quantity Update
  if (!token) {
    let guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
    let targetItem = null;
    if (typeof itemIndex !== "undefined" && itemIndex !== null && guestCart[itemIndex]) {
      targetItem = guestCart[itemIndex];
    } else {
      targetItem = guestCart.find((it) => {
        const v = it.variant || (it.variantDetails ? (it.variantDetails.size || it.variantDetails.name) : null);
        return it.id == productId && (!variantSize || v == variantSize);
      });
    }

    if (!targetItem) {
      loadGuestCart();
      return;
    }

    targetItem.quantity = Math.max(1, (parseInt(targetItem.quantity, 10) || 1) + quantityChange);
    localStorage.setItem("guestCart", JSON.stringify(guestCart));
    loadGuestCart();
    syncCartBadge();
    return;
  }

  // Logged-in User Quantity Update
  const $btn = $(this);
  const originalHtml = $btn.html();
  $btn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');

  try {
    const cartVariants = JSON.parse(localStorage.getItem("cartVariants") || "{}");
    const savedVar = cartVariants[productId] || null;
    const { addToCartAPI } = await import("./api/cartService.js");
    await addToCartAPI(productId, quantityChange, token, savedVar);

    // Refresh cart
    loadCartItems(token);
    syncCartBadge();
  } catch (err) {
    console.error("Update Quantity Error:", err);
    showToast("Failed to update quantity. Please try again.", "error");
  } finally {
    $btn.prop("disabled", false).html(originalHtml);
  }
});

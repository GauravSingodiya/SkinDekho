import { getAddressesAPI, checkoutAPI } from "./api/orderService.js";
import { getCartAPI } from "./api/cartService.js";
import { showToast } from "./main.js";

$(document).ready(function () {
  const token = sessionStorage.getItem("token");
  let selectedAddressId = null;
  let isNewAddress = false;

  if (!token) {
    showToast("Please login to proceed with checkout", "error");
    window.location.href = "index.html";
    return;
  }

  // Load addresses on start
  loadAddresses();

  // Toggle New Address Form
  $("#show-new-address-btn").on("click", function () {
    isNewAddress = !isNewAddress;
    if (isNewAddress) {
      $("#new-address-form").slideDown();
      $(this).html('<i class="fas fa-times me-2"></i>Cancel New Address');
      $(".address-card").removeClass("selected");
      selectedAddressId = null;
    } else {
      $("#new-address-form").slideUp();
      $(this).html('<i class="fas fa-plus me-2"></i>Add New Address');
      // Clear inputs
      $("#new-address-form input").val("").removeClass("is-invalid");
    }
  });

  // Handle Address Selection
  $("#address-list").on("click", ".address-card", function () {
    if (isNewAddress) {
      // If adding new, close it
      $("#show-new-address-btn").click();
    }
    $(".address-card").removeClass("selected");
    $(this).addClass("selected");
    selectedAddressId = $(this).data("id");
  });

  // Place Order
  $("#placeOrderBtn").on("click", async function () {
    const $btn = $(this);
    
    // Check selection
    if (!selectedAddressId && !isNewAddress) {
      showToast("Please select an address or add a new one", "warning");
      return;
    }

    let payload = {
      addressId: selectedAddressId,
      newAddress: null,
    };

    if (isNewAddress) {
      if (!validateForm()) {
        showToast("Please fix the errors in the address form", "error");
        return;
      }
      payload.addressId = null;
      payload.newAddress = {
        firstName: $("#firstName").val().trim(),
        lastName: $("#lastName").val().trim(),
        phoneNumber: $("#phoneNumber").val().trim(),
        addressLine1: $("#addressLine1").val().trim(),
        addressLine2: $("#addressLine2").val().trim(),
        city: $("#city").val().trim(),
        state: $("#state").val().trim(),
        postalCode: $("#postalCode").val().trim(),
        country: $("#country").val().trim(),
        addressType: "home",
        isDefault: true,
      };
    }

    console.log("Checkout Body:", payload);

    $btn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm me-2"></span>Placing Order...');

    try {
      const response = await checkoutAPI(payload, token);
      if (response.success) {
        showToast("Order placed successfully!", "success");
        sessionStorage.removeItem("cart"); // Clear cart
        setTimeout(() => {
          window.location.href = "index.html"; // Or a success page if exists
        }, 2000);
      } else {
        throw new Error(response.message || "Failed to place order");
      }
    } catch (error) {
      showToast(error.message, "error");
      $btn.prop("disabled", false).html("Place Order");
    }
  });

  async function loadAddresses() {
    try {
      const response = await getAddressesAPI(token);
      const addresses = response.result || [];
      const $list = $("#address-list");
      $list.empty();

      if (addresses.length === 0) {
        $list.append('<div class="col-12 text-center py-4 text-muted">No saved addresses found. Please add a new one.</div>');
        return;
      }

      addresses.forEach((addr) => {
        const addressCard = `
          <div class="col-md-6">
            <div class="address-card p-3 rounded border h-100 position-relative" data-id="${addr.id}">
              <i class="fas fa-check-circle text-primary position-absolute" style="top: 10px; right: 10px; display: none; font-size: 1.2rem;"></i>
              <h6 class="fw-bold mb-1">${addr.firstName} ${addr.lastName}</h6>
              <p class="small mb-1 text-dark">${addr.addressLine1}, ${addr.addressLine2 || ""}</p>
              <p class="small mb-1 text-dark">${addr.city}, ${addr.state} - ${addr.postalCode}</p>
              <p class="small mb-0 text-muted"><i class="fas fa-phone-alt me-1"></i>${addr.phoneNumber}</p>
            </div>
          </div>
        `;
        $list.append(addressCard);
      });
    } catch (error) {
      console.error("Failed to load addresses", error);
      $("#address-list").html('<div class="col-12 text-center py-4 text-danger">Failed to load addresses</div>');
    }
  }

  function validateForm() {
    let isValid = true;
    const requiredFields = ["firstName", "lastName", "phoneNumber", "addressLine1", "city", "state", "postalCode", "country"];

    requiredFields.forEach((id) => {
      const $input = $(`#${id}`);
      if (!$input.val().trim()) {
        $input.addClass("is-invalid");
        isValid = false;
      } else {
        $input.removeClass("is-invalid");
      }
    });

    // Basic phone validation
    const phone = $("#phoneNumber").val().trim();
    if (phone && !/^\d{10,15}$/.test(phone)) {
      $("#phoneNumber").addClass("is-invalid");
      isValid = false;
    }

    return isValid;
  }

  // --- Cart Table Rendering (Fetched from API) ---
  async function renderCartTable() {
    const $tableBody = $("#checkoutOrderTable");
    $tableBody.html('<tr><td colspan="5" class="py-5 text-center"><div class="spinner-border text-primary" role="status"></div> Loading your items...</td></tr>');

    let subtotal = 0;

    try {
      const res = await getCartAPI(token);
      const cartItems = res.result?.items || res.result || [];
      $tableBody.empty();

      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        $tableBody.html(`
          <tr>
            <td colspan="5" class="py-5 text-center">Your cart is currently empty.</td>
          </tr>
        `);
        return;
      }

      // Generate Cart Item Rows
      cartItems.forEach((item) => {
        const price = parseFloat(item.productPrice) || 0;
        const quantity = parseInt(item.quantity) || 1;
        const total = price * quantity;
        subtotal += total;

        const imgSrc = item.imageUrl || "img/product-default.jpg";

        const tr = `
          <tr>
            <th scope="row">
              <div class="d-flex align-items-center mt-2">
                <img
                  src="${imgSrc}"
                  class="img-fluid rounded-circle"
                  style="width: 70px; height: 70px; object-fit: cover;"
                  alt="${item.productName || "Product"}"
                />
              </div>
            </th>
            <td class="py-5">${item.productName || "Product Name"}</td>
            <td class="py-5">₹${price.toFixed(2)}</td>
            <td class="py-5">${quantity}</td>
            <td class="py-5">₹${total.toFixed(2)}</td>
          </tr>
        `;
        $tableBody.append(tr);
      });

      // Add Subtotal Row
      $tableBody.append(`
        <tr>
          <th scope="row"></th>
          <td class="py-5"></td>
          <td class="py-5"></td>
          <td class="py-5">
            <p class="mb-0 text-dark py-3 fw-bold">Subtotal</p>
          </td>
          <td class="py-5">
            <div class="py-3 border-bottom border-top">
              <p class="mb-0 text-dark fw-bold">₹${subtotal.toFixed(2)}</p>
            </div>
          </td>
        </tr>
      `);

      // Add Shipping Options Row
      $tableBody.append(`
        <tr>
          <th scope="row"></th>
          <td class="py-5">
            <p class="mb-0 text-dark py-4">Shipping</p>
          </td>
          <td colspan="3" class="py-5">
            <div class="form-check text-start">
              <input type="checkbox" class="form-check-input bg-primary border-0 shipping-opt" id="Shipping-1" name="Shipping-1" value="0" checked />
              <label class="form-check-label" for="Shipping-1">Free Shipping</label>
            </div>
            <div class="form-check text-start">
              <input type="checkbox" class="form-check-input bg-primary border-0 shipping-opt" id="Shipping-2" name="Shipping-1" value="15" />
              <label class="form-check-label" for="Shipping-2">Flat rate: ₹15.00</label>
            </div>
          </td>
        </tr>
      `);

      // Add Final Total Row
      $tableBody.append(`
        <tr>
          <th scope="row"></th>
          <td class="py-5">
            <p class="mb-0 text-dark text-uppercase py-3 fw-bold">TOTAL</p>
          </td>
          <td class="py-5"></td>
          <td class="py-5"></td>
          <td class="py-5">
            <div class="py-3 border-bottom border-top">
              <p class="mb-0 text-dark fw-bold" id="finalTotal">₹${subtotal.toFixed(2)}</p>
            </div>
          </td>
        </tr>
      `);

    } catch (err) {
      console.error("Failed to load checkout cart:", err);
      $tableBody.html('<tr><td colspan="5" class="py-5 text-center text-danger">Failed to load order items.</td></tr>');
    }
  }

  // Update total on shipping change (Global listener)
  $(document).on("change", ".shipping-opt", async function () {
    $(".shipping-opt").not(this).prop("checked", false);
    
    // Check if subtotal is available or recalculate from API
    try {
      const res = await getCartAPI(token);
      const cartItems = res.result?.items || res.result || [];
      let subtotal = 0;
      cartItems.forEach(item => {
        subtotal += (parseFloat(item.productPrice) || 0) * (parseInt(item.quantity) || 1);
      });

      const shippingCost = parseFloat($(this).val()) || 0;
      const finalTotal = subtotal + shippingCost;
      $("#finalTotal").text(`₹${finalTotal.toFixed(2)}`);
    } catch (e) {}
  });

  renderCartTable();
});

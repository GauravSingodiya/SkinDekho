import {
  getAddressesAPI,
  checkoutAPI,
  updateAddressAPI,
  deleteAddressAPI,
  addAddressAPI,
} from "./api/orderService.js";
import { getCartAPI } from "./api/cartService.js";
import { showToast } from "./main.js";
import { BASE_URL } from "./api/config.js";
import { getAllProducts } from "./products.js";

$(document).ready(function () {
  const token = sessionStorage.getItem("token");
  let selectedAddressId = null;

  if (!token) {
    showToast("Please login to proceed with checkout", "error");
    window.location.href = "home.html";
    return;
  }

  // Load addresses on start
  loadAddresses();

  // Handle Add New Button
  $("#show-new-address-btn").on("click", function () {
    $(".address-card").removeClass("selected");
    $(".address-card").find(".fa-check-circle").hide();
    selectedAddressId = null;
    $("#new-address-section").removeClass("d-none").css("opacity", "1");
    // Clear the form fields so they can enter a fresh address
    $("#checkout-firstName").val("");
    $("#checkout-lastName").val("");
    $("#checkout-phone").val("");
    $("#checkout-addr1").val("");
    $("#checkout-addr2").val("");
    $("#checkout-city").val("");
    $("#checkout-state").val("");
    $("#checkout-zip").val("");
  });

  // Handle Edit Address Click
  $(document).on("click", ".edit-address-btn", function (e) {
    e.stopPropagation();
    const addr = $(this).data("address");
    $("#addressId").val(addr.id);
    $("#addrFirstName").val(addr.firstName);
    $("#addrLastName").val(addr.lastName);
    $("#addrPhone").val(addr.phoneNumber);
    $("#addrType").val(addr.addressType || "Home");
    $("#addrLine1").val(addr.addressLine1);
    $("#addrLine2").val(addr.addressLine2 || "");
    $("#addrCity").val(addr.city);
    $("#addrState").val(addr.state);
    $("#addrZip").val(addr.postalCode);
    $("#addrDefault").prop("checked", addr.isDefault);

    $("#addressModalLabel").text("Edit Shipping Address");
    $("#addressModal").modal("show");
  });

  // Handle Delete Address Click
  $(document).on("click", ".delete-address-btn", async function (e) {
    e.stopPropagation();
    const id = $(this).data("id");
    if (confirm("Are you sure you want to delete this address?")) {
      try {
        await deleteAddressAPI(id, token);
        showToast("Address deleted successfully", "success");
        loadAddresses();
      } catch (err) {
        showToast(err.message || "Delete failed", "error");
      }
    }
  });

  // Handle Save Address Button in Modal
  $("#saveAddressBtn").on("click", async function () {
    const id = $("#addressId").val();
    const payload = {
      firstName: $("#addrFirstName").val().trim(),
      lastName: $("#addrLastName").val().trim(),
      phoneNumber: $("#addrPhone").val().trim(),
      addressType: $("#addrType").val(),
      addressLine1: $("#addrLine1").val().trim(),
      addressLine2: $("#addrLine2").val().trim(),
      city: $("#addrCity").val().trim(),
      state: $("#addrState").val().trim(),
      postalCode: $("#addrZip").val().trim(),
      isDefault: $("#addrDefault").is(":checked"),
      country: "India",
    };

    if (id) payload.id = parseInt(id);

    if (
      !payload.firstName ||
      !payload.lastName ||
      !payload.phoneNumber ||
      !payload.addressLine1 ||
      !payload.city ||
      !payload.state ||
      !payload.postalCode
    ) {
      showToast("Please fill all required fields", "warning");
      return;
    }

    const $btn = $(this);
    const $spinner = $("#addressSpinner");
    $btn.prop("disabled", true);
    $spinner.removeClass("d-none");

    try {
      if (id) {
        await updateAddressAPI(id, payload, token);
        showToast("Address updated successfully!", "success");
      } else {
        await addAddressAPI(payload, token);
        showToast("Address added successfully!", "success");
      }
      $("#addressModal").modal("hide");
      loadAddresses();
    } catch (err) {
      showToast(err.message || "Save failed", "error");
    } finally {
      $btn.prop("disabled", false);
      $spinner.addClass("d-none");
    }
  });

  // Handle Address Selection
  $("#address-list").on("click", ".address-card", function () {
    $(".address-card").removeClass("selected");
    $(".address-card").find(".fa-check-circle").hide();
    $(this).addClass("selected");
    $(this).find(".fa-check-circle").show();
    selectedAddressId = $(this).data("id");
    // When an address is selected, hide the new address form
    $("#new-address-section").addClass("d-none");
  });

  // Place Order
  $("#placeOrderBtn").on("click", async function () {
    const $btn = $(this);
    let payload = {
      addressId: selectedAddressId ? parseInt(selectedAddressId) : null,
      newAddress: null,
    };

    // If no existing address selected, validate new address form
    if (!selectedAddressId) {
      const newAddr = {
        firstName: $("#checkout-firstName").val().trim(),
        lastName: $("#checkout-lastName").val().trim(),
        phoneNumber: $("#checkout-phone").val().trim(),
        addressLine1: $("#checkout-addr1").val().trim(),
        addressLine2: $("#checkout-addr2").val().trim(),
        city: $("#checkout-city").val().trim(),
        state: $("#checkout-state").val().trim(),
        postalCode: $("#checkout-zip").val().trim(),
        country: $("#checkout-country").val().trim(),
        addressType: "Home",
        isDefault: true,
      };

      if (!newAddr.firstName || !newAddr.lastName || !newAddr.phoneNumber || !newAddr.addressLine1 || !newAddr.city || !newAddr.state || !newAddr.postalCode) {
        showToast("Please select an existing address or fill the required fields for a new one.", "warning");
        return;
      }
      payload.newAddress = newAddr;
      payload.addressId = null;
    } else {
      payload.newAddress = null;
    }

    $btn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm me-2"></span>Placing Order...');

    try {
      console.log("checkoutAPI payload:", payload);
      const response = await checkoutAPI(payload, token);
      if (response.success) {
        showToast("Order placed successfully!", "success");
        sessionStorage.removeItem("cart");
        setTimeout(() => (window.location.href = "home.html"), 2000);
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
        $list.append('<div class="col-12 text-center py-4 text-muted">No saved addresses found.</div>');
        $("#new-address-section").removeClass("d-none").css("opacity", "1");
        selectedAddressId = null;
      } else {
        $("#new-address-section").addClass("d-none"); // Hide form if addresses exist
        
        // Find default address or choose the first one
        const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
        selectedAddressId = defaultAddr ? defaultAddr.id : null;

        addresses.forEach((addr) => {
          const isSelected = selectedAddressId === addr.id;
          const addressCard = `
            <div class="col-md-6">
              <div class="address-card p-3 rounded border position-relative ${isSelected ? "selected" : ""}" data-id="${addr.id}">
                <i class="fas fa-check-circle text-primary position-absolute" style="top: 10px; right: 10px; ${isSelected ? "" : "display: none;"} font-size: 1.2rem;"></i>
                <h6 class="fw-bold mb-1">${addr.firstName} ${addr.lastName}</h6>
                <p class="small mb-1 text-dark">${addr.addressLine1}, ${addr.addressLine2 || ""}</p>
                <p class="small mb-1 text-dark">${addr.city}, ${addr.state} - ${addr.postalCode}</p>
                <p class="small mb-2 text-muted"><i class="fas fa-phone-alt me-1"></i>${addr.phoneNumber}</p>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-outline-primary edit-address-btn" 
                    data-address='${JSON.stringify(addr).replace(/'/g, "&apos;")}'>
                    <i class="fas fa-edit"></i> Edit
                  </button>
                  <button class="btn btn-sm btn-outline-danger delete-address-btn" data-id="${addr.id}">
                    <i class="fas fa-trash-alt"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          `;
          $list.append(addressCard);
        });
      }
    } catch (error) {
      console.error("Failed to load addresses", error);
      $("#address-list").html('<div class="col-12 text-center py-4 text-danger">Failed to load addresses</div>');
    }
  }

  // --- Cart Table Rendering (Fetched from API) ---
  async function renderCartTable() {
    const $tableBody = $("#checkoutOrderTable");
    $tableBody.html(
      '<tr><td colspan="5" class="py-5 text-center"><div class="spinner-border text-primary" role="status"></div> Loading your items...</td></tr>',
    );

    let subtotal = 0;

    try {
      const res = await getCartAPI(token);
      const cartItems = res.result?.items || res.result || [];

      try {
        const productsRes = await getAllProducts();
        const products = productsRes.result || productsRes || [];
        const productPriceMap = {};
        products.forEach(p => {
          productPriceMap[p.id] = p.discountPrice !== null && p.discountPrice !== undefined ? p.discountPrice : p.price;
        });
        cartItems.forEach(item => {
          if (productPriceMap[item.productId] !== undefined) {
            item.productPrice = productPriceMap[item.productId];
          }
        });
      } catch (e) {
        console.error("Failed to map discount prices in checkout table", e);
      }

      $tableBody.empty();

      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        showToast(
          "Your cart is empty. Please add products to proceed.",
          "warning",
        );
        $("#placeOrderBtn")
          .prop("disabled", true)
          .addClass("opacity-50")
          .css("cursor", "not-allowed")
          .attr("title", "Add products to cart first");

        $tableBody.html(`
          <tr>
            <td colspan="5" class="py-5 text-center">
              <div class="py-5">
                <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                <h4 class="text-muted mb-4">Your cart is currently empty.</h4>
                <p class="mb-4">Add some products to your cart before checking out.</p>
                <a href="shop.html" class="btn btn-primary border-secondary rounded-pill px-4 py-3 text-white">
                  <i class="fas fa-shopping-bag me-2"></i>Go to Shop
                </a>
              </div>
            </td>
          </tr>
        `);
      } else {
        // Generate Cart Item Rows
        cartItems.forEach((item) => {
          const price = parseFloat(item.productPrice) || 0;
          const quantity = parseInt(item.quantity) || 1;
          const total = price * quantity;
          subtotal += total;

          const relativeImgUrl = item.imageUrl || "";
          const imgSrc = relativeImgUrl.startsWith("http")
            ? relativeImgUrl
            : relativeImgUrl
            ? (BASE_URL + relativeImgUrl)
            : "img/product-default.jpg";

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
      }

      // Add Subtotal Row
      $tableBody.append(`
        <tr>
          <th scope="row"></th>
          <td class="py-2"></td>
          <td class="py-2"></td>
          <td class="py-2">
            <p class="mb-0 text-dark fw-bold">Subtotal</p>
          </td>
          <td class="py-2">
            <div>
              <p class="mb-0 text-dark fw-bold">₹${subtotal.toFixed(2)}</p>
            </div>
          </td>
        </tr>
      `);

      // Add Shipping Options Row
      $tableBody.append(`
        <tr>
          <th scope="row"></th>
          <td class="py-2">
            <p class="mb-0 text-dark">Shipping</p>
          </td>
          <td colspan="3" class="py-2">
            <div class="form-check text-start">
              <input type="checkbox" class="form-check-input bg-primary border-0 shipping-opt" id="Shipping-2" name="Shipping-1" value="15" checked disabled />
              <label class="form-check-label" for="Shipping-2">Flat rate: ₹15.00</label>
            </div>
          </td>
        </tr>
      `);

      // Add Final Total Row
      const finalTotalWithShipping = subtotal + 15.00;
      $tableBody.append(`
        <tr>
          <th scope="row"></th>
          <td class="py-2">
            <p class="mb-0 text-dark text-uppercase fw-bold">TOTAL</p>
          </td>
          <td class="py-2"></td>
          <td class="py-2"></td>
          <td class="py-2">
            <div>
              <p class="mb-0 text-dark fw-bold" id="finalTotal">₹${finalTotalWithShipping.toFixed(2)}</p>
            </div>
          </td>
        </tr>
      `);
    } catch (err) {
      console.error("Failed to load checkout cart:", err);
      $tableBody.html(
        '<tr><td colspan="5" class="py-5 text-center text-danger">Failed to load order items.</td></tr>',
      );
    }
  }

  // Update total on shipping change (Global listener)
  $(document).on("change", ".shipping-opt", async function () {
    $(".shipping-opt").not(this).prop("checked", false);

    // Check if subtotal is available or recalculate from API
    try {
      const res = await getCartAPI(token);
      const cartItems = res.result?.items || res.result || [];

      try {
        const productsRes = await getAllProducts();
        const products = productsRes.result || productsRes || [];
        const productPriceMap = {};
        products.forEach(p => {
          productPriceMap[p.id] = p.discountPrice !== null && p.discountPrice !== undefined ? p.discountPrice : p.price;
        });
        cartItems.forEach(item => {
          if (productPriceMap[item.productId] !== undefined) {
            item.productPrice = productPriceMap[item.productId];
          }
        });
      } catch (e) {}

      let subtotal = 0;
      cartItems.forEach((item) => {
        subtotal +=
          (parseFloat(item.productPrice) || 0) * (parseInt(item.quantity) || 1);
      });

      const shippingCost = parseFloat($(this).val()) || 0;
      const finalTotal = subtotal + shippingCost;
      $("#finalTotal").text(`₹${finalTotal.toFixed(2)}`);
    } catch (e) {}
  });

  // Payment Method item click and toggle descriptions
  $(document).on("change", "input[name='paymentMethod']", function() {
    $(".payment-method-item").removeClass("selected-payment");
    $(".payment-desc").addClass("d-none");
    
    const $parent = $(this).closest(".payment-method-item");
    $parent.addClass("selected-payment");
    $parent.find(".payment-desc").removeClass("d-none");
  });

  $(document).on("click", ".payment-method-item", function(e) {
    if (!$(e.target).is("input")) {
      $(this).find("input[name='paymentMethod']").prop("checked", true).trigger("change");
    }
  });

  renderCartTable();
});

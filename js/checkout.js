import {
  getAddressesAPI,
  checkoutAPI,
  updateAddressAPI,
  deleteAddressAPI,
  addAddressAPI,
  verifyPaymentAPI,
} from "./api/orderService.js";
import { getCartAPI, removeFromCartAPI } from "./api/cartService.js";
import { showToast, syncCartBadge } from "./main.js";
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

  // --- India Regions Database for Dynamic Dropdowns ---
  const INDIA_REGIONS = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Rajahmundry", "Kakinada", "Kadapa", "Anantapur"],
    "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Tawang", "Pasighat", "Ziro", "Bomdila"],
    "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Nagaon", "Tinsukia", "Tezpur"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Arrah", "Begusarai"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Jagdalpur", "Ambikapur"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi", "West Delhi", "East Delhi", "Dwarka", "Rohini"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Anand", "Navsari"],
    "Haryana": ["Faridabad", "Gurugram", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula"],
    "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Nahan", "Kullu", "Chamba"],
    "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Kathua", "Samba", "Udhampur"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", "Giridih"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi", "Davangere", "Bellary", "Shimoga", "Tumakuru"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Palakkad", "Kannur", "Kottayam"],
    "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Kalyan-Dombivli", "Vasai-Virar", "Aurangabad", "Navi Mumbai", "Solapur", "Kolhapur"],
    "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur"],
    "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongpoh"],
    "Mizoram": ["Aizawl", "Lunglei", "Champhai"],
    "Nagaland": ["Dimapur", "Kohima", "Mokokchung", "Tuensang"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Balasore", "Puri", "Bhadrak"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Pathankot"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Sikar", "Bharatpur", "Sri Ganganagar"],
    "Sikkim": ["Gangtok", "Namchi", "Geyzing"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tiruppur", "Erode", "Vellore", "Thoothukudi", "Nagercoil"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam", "Khammam", "Mahbubnagar"],
    "Tripura": ["Agartala", "Dharmanagar", "Udaipur", "Kailasahar"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Prayagraj", "Bareilly", "Aligarh", "Noida", "Moradabad", "Gorakhpur"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Haldwani", "Roorkee", "Rudrapur", "Kashipur", "Rishikesh"],
    "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Siliguri", "Asansol", "Durgapur", "Kharagpur", "Bardhaman", "Malda", "Baharampur"]
  };

  // --- Modal Address Render Helpers ---
  function renderStateField(isIndia) {
    if (isIndia) {
      const options = Object.keys(INDIA_REGIONS).map(s => `<option value="${s}">${s}</option>`).join("");
      $("#stateContainer").html(`
        <label class="form-label">State</label>
        <select class="form-select" id="addrState" required>
          <option value="">Select State</option>
          ${options}
        </select>
      `);
    } else {
      $("#stateContainer").html(`
        <label class="form-label">State</label>
        <input type="text" class="form-control" id="addrState" placeholder="Enter State" required />
      `);
    }
  }

  function renderCityField(isIndia, stateName = "") {
    if (isIndia) {
      let options = "";
      if (stateName && INDIA_REGIONS[stateName]) {
        options = INDIA_REGIONS[stateName].map(c => `<option value="${c}">${c}</option>`).join("");
      }
      $("#cityContainer").html(`
        <label class="form-label">City/District</label>
        <select class="form-select" id="addrCity" required ${stateName ? "" : "disabled"}>
          <option value="">Select City</option>
          ${options}
        </select>
      `);
    } else {
      $("#cityContainer").html(`
        <label class="form-label">City/District</label>
        <input type="text" class="form-control" id="addrCity" placeholder="Enter City" required />
      `);
    }
  }

  // --- Inline Checkout Address Render Helpers ---
  function renderCheckoutStateField(isIndia) {
    if (isIndia) {
      const options = Object.keys(INDIA_REGIONS).map(s => `<option value="${s}">${s}</option>`).join("");
      $("#checkoutStateContainer").html(`
        <label class="form-label">State<sup>*</sup></label>
        <select class="form-select" id="checkout-state" required>
          <option value="">Select State</option>
          ${options}
        </select>
      `);
    } else {
      $("#checkoutStateContainer").html(`
        <label class="form-label">State<sup>*</sup></label>
        <input type="text" class="form-control" id="checkout-state" placeholder="State" required />
      `);
    }
  }

  function renderCheckoutCityField(isIndia, stateName = "") {
    if (isIndia) {
      let options = "";
      if (stateName && INDIA_REGIONS[stateName]) {
        options = INDIA_REGIONS[stateName].map(c => `<option value="${c}">${c}</option>`).join("");
      }
      $("#checkoutCityContainer").html(`
        <label class="form-label">City<sup>*</sup></label>
        <select class="form-select" id="checkout-city" required ${stateName ? "" : "disabled"}>
          <option value="">Select City</option>
          ${options}
        </select>
      `);
    } else {
      $("#checkoutCityContainer").html(`
        <label class="form-label">City<sup>*</sup></label>
        <input type="text" class="form-control" id="checkout-city" placeholder="City" required />
      `);
    }
  }

  // Event Listeners for Modal Select Changes
  $(document).on("change", "#addrCountry", function () {
    const isIndia = $(this).val() === "India";
    renderStateField(isIndia);
    renderCityField(isIndia, "");
  });

  $(document).on("change", "#addrState", function () {
    const isIndia = $("#addrCountry").val() === "India";
    if (isIndia) {
      renderCityField(true, $(this).val());
    }
  });

  // Event Listeners for Inline Form Select Changes
  $(document).on("change", "#checkout-country", function () {
    const isIndia = $(this).val() === "India";
    renderCheckoutStateField(isIndia);
    renderCheckoutCityField(isIndia, "");
  });

  $(document).on("change", "#checkout-state", function () {
    const isIndia = $("#checkout-country").val() === "India";
    if (isIndia) {
      renderCheckoutCityField(true, $(this).val());
    }
  });

  // Initialize Checkout Inline Form selectors
  renderCheckoutStateField(true);
  renderCheckoutCityField(true, "");

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
    $("#checkout-country").val("India");
    renderCheckoutStateField(true);
    renderCheckoutCityField(true, "");
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
    $("#addrZip").val(addr.postalCode);
    $("#addrDefault").prop("checked", addr.isDefault);

    const isIndia = !addr.country || addr.country === "India";
    $("#addrCountry").val(isIndia ? "India" : "Other");

    renderStateField(isIndia);
    $("#addrState").val(addr.state);
    renderCityField(isIndia, addr.state);
    $("#addrCity").val(addr.city);

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
    const countryVal = $("#addrCountry").val();
    const payload = {
      firstName: $("#addrFirstName").val().trim(),
      lastName: $("#addrLastName").val().trim(),
      phoneNumber: $("#addrPhone").val().trim(),
      addressType: $("#addrType").val(),
      addressLine1: $("#addrLine1").val().trim(),
      addressLine2: $("#addrLine2").val().trim(),
      city: $("#addrCity").val() ? $("#addrCity").val().trim() : "",
      state: $("#addrState").val() ? $("#addrState").val().trim() : "",
      postalCode: $("#addrZip").val().trim(),
      isDefault: $("#addrDefault").is(":checked"),
      country: countryVal === "India" ? "India" : "Other",
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
    const paymentMethod = $("input[name='paymentMethod']:checked").val();

    if (paymentMethod !== "Razorpay") {
      showToast("This payment method is not active. Please select Razorpay.", "warning");
      return;
    }

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
      if (response.success && response.result) {
        const rzpData = response.result;
        
        // Remove items from local cart immediately since the order is placed
        sessionStorage.removeItem("cart");

        // Open Razorpay Checkout modal
        const rzpOptions = {
          key: rzpData.keyId,
          amount: Math.round(rzpData.amount * 100), // convert to paise
          currency: rzpData.currency || "INR",
          name: "SkinDekho",
          description: "Payment for Order #" + rzpData.orderId,
          order_id: rzpData.razorpayOrderId,
          handler: async function (authResponse) {
            $btn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm me-2"></span>Verifying Payment...');
            try {
              const verifyPayload = {
                orderId: rzpData.orderId,
                razorpayPaymentId: authResponse.razorpay_payment_id,
                razorpayOrderId: authResponse.razorpay_order_id,
                razorpaySignature: authResponse.razorpay_signature
              };
              
              const verificationResult = await verifyPaymentAPI(verifyPayload, token);
              if (verificationResult.success) {
                showToast("Order placed & payment verified successfully!", "success");
                setTimeout(() => {
                  window.location.href = "User.html#orders";
                }, 2000);
              } else {
                showToast(verificationResult.message || "Payment verification failed. Redirecting to My Orders...", "error");
                setTimeout(() => {
                  window.location.href = "User.html#orders";
                }, 2000);
              }
            } catch (err) {
              showToast(err.message || "Verification failed. Redirecting to My Orders...", "error");
              setTimeout(() => {
                window.location.href = "User.html#orders";
              }, 2000);
            }
          },
          prefill: {
            name: payload.newAddress ? `${payload.newAddress.firstName} ${payload.newAddress.lastName}` : "",
            contact: payload.newAddress ? payload.newAddress.phoneNumber : ""
          },
          theme: {
            color: "#e2af18"
          },
          modal: {
            ondismiss: function () {
              showToast("Payment cancelled. Redirecting to My Orders...", "warning");
              setTimeout(() => {
                window.location.href = "User.html#orders";
              }, 2000);
            }
          }
        };

        // Attempt to prefill logged-in user details from session storage
        try {
          const userStr = sessionStorage.getItem("user");
          if (userStr) {
            const user = JSON.parse(userStr);
            if (!rzpOptions.prefill.name && (user.firstName || user.lastName)) {
              rzpOptions.prefill.name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
            }
            if (!rzpOptions.prefill.contact && user.phoneNumber) {
              rzpOptions.prefill.contact = user.phoneNumber;
            }
            if (user.email) {
              rzpOptions.prefill.email = user.email;
            }
          }
        } catch (e) {
          console.error("Failed to parse user details for prefill", e);
        }

        const rzp = new Razorpay(rzpOptions);
        rzp.open();
        $btn.html("Awaiting Payment...");
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
        const cartVariants = JSON.parse(localStorage.getItem("cartVariants") || "{}");

        cartItems.forEach((item) => {
          const pId = item.productId || item.id;
          const savedVar = cartVariants[pId] || null;

          let variantSize = item.size || item.Size || item.variant || item.variantName || (savedVar ? savedVar.size : null);
          let effectivePrice = item.variantPrice || (savedVar ? savedVar.price : null);

          const productObj = products.find((p) => p.id == pId);
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

          if (effectivePrice !== null && effectivePrice !== undefined && !isNaN(parseFloat(effectivePrice))) {
            item.productPrice = parseFloat(effectivePrice);
          } else if (productObj) {
            item.productPrice = (productObj.discountPrice !== null && productObj.discountPrice !== undefined) ? productObj.discountPrice : productObj.price;
          }
          if (variantSize) {
            item.variantSize = variantSize;
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
            <td colspan="6" class="py-5 text-center">
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
        // Enable Place Order button if items exist
        $("#placeOrderBtn")
          .prop("disabled", false)
          .removeClass("opacity-50")
          .css("cursor", "pointer")
          .removeAttr("title");

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

          const itemId = item.id || item.cartId || item.productId;
          const vBadge = item.variantSize
            ? `<span class="badge bg-light text-primary border border-primary-subtle px-2 py-1 mt-1 d-inline-block" style="font-size: 0.75rem; border-radius: 6px;">Size: ${item.variantSize}</span>`
            : "";

          const tr = `
            <tr>
              <th scope="row">
                <div class="d-flex align-items-center mt-2">
                  <img
                    src="${imgSrc}"
                    class="img-fluid rounded-circle"
                    style="width: 55px; height: 55px; object-fit: cover;"
                    alt="${item.productName || "Product"}"
                  />
                </div>
              </th>
              <td class="py-4 align-middle">
                <div>${item.productName || "Product Name"}</div>
                ${vBadge}
              </td>
              <td class="py-4 align-middle">₹${price.toFixed(2)}</td>
              <td class="py-4 align-middle">${quantity}</td>
              <td class="py-4 align-middle fw-bold">₹${total.toFixed(2)}</td>
              <td class="py-4 align-middle text-center">
                <button type="button" class="btn btn-md rounded-circle bg-light border text-danger remove-checkout-item-btn p-1 px-2" data-id="${itemId}" title="Remove item from order">
                  <i class="fa fa-times"></i>
                </button>
              </td>
            </tr>
          `;
          $tableBody.append(tr);
        });
      }

      // Add Subtotal Row
      $tableBody.append(`
        <tr class="border-top">
          <td colspan="3" class="py-2 text-dark fw-bold">Subtotal</td>
          <td colspan="3" class="py-2 text-end text-dark fw-bold">₹${subtotal.toFixed(2)}</td>
        </tr>
      `);

      // Calculate Shipping (₹50 if subtotal <= ₹500, else Free)
      const shippingCharge = subtotal <= 500 ? 50.00 : 0.00;

      // Add Shipping Options Row
      $tableBody.append(`
        <tr>
          <td colspan="2" class="py-2 text-dark">Shipping</td>
          <td colspan="4" class="py-2 text-end">
            <span class="fw-semibold text-dark">${shippingCharge > 0 ? "Flat rate: ₹50.00" : "Free Shipping"}</span>
          </td>
        </tr>
      `);

      // Add Final Total Row
      const finalTotalWithShipping = subtotal + shippingCharge;
      $tableBody.append(`
        <tr class="border-top border-2">
          <td colspan="3" class="py-2 text-dark text-uppercase fw-bold" style="font-size: 1.05rem;">TOTAL</td>
          <td colspan="3" class="py-2 text-end text-dark fw-bold" style="font-size: 1.05rem;" id="finalTotal">₹${finalTotalWithShipping.toFixed(2)}</td>
        </tr>
      `);
    } catch (err) {
      console.error("Failed to load checkout cart:", err);
      $tableBody.html(
        '<tr><td colspan="6" class="py-5 text-center text-danger">Failed to load order items.</td></tr>',
      );
    }
  }

  // Remove Item from Cart in Checkout
  $(document).on("click", ".remove-checkout-item-btn", async function () {
    const itemId = $(this).data("id");
    if (!itemId) return;

    const $btn = $(this);
    $btn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm" role="status"></span>');

    try {
      await removeFromCartAPI(itemId, token);
      showToast("Item removed from order", "success");
      syncCartBadge();
      await renderCartTable();
    } catch (err) {
      console.error("Failed to remove item from checkout:", err);
      showToast(err.message || "Failed to remove item. Please try again.", "error");
      $btn.prop("disabled", false).html('<i class="fa fa-times"></i>');
    }
  });

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
        const cartVariants = JSON.parse(localStorage.getItem("cartVariants") || "{}");

        cartItems.forEach((item) => {
          const pId = item.productId || item.id;
          const savedVar = cartVariants[pId] || null;

          let variantSize = item.size || item.Size || item.variant || item.variantName || (savedVar ? savedVar.size : null);
          let effectivePrice = item.variantPrice || (savedVar ? savedVar.price : null);

          const productObj = products.find((p) => p.id == pId);
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
                const regP = matchedVar.price ?? matchedVar.Price;
                const discP = matchedVar.discountPrice ?? matchedVar.DiscountPrice;
                effectivePrice = (discP !== null && discP !== "" && discP !== undefined && (!regP || parseFloat(discP) < parseFloat(regP)))
                  ? parseFloat(discP)
                  : parseFloat(regP);
              }
            }
          }

          if (effectivePrice !== null && effectivePrice !== undefined && !isNaN(parseFloat(effectivePrice))) {
            item.productPrice = parseFloat(effectivePrice);
          } else if (productObj) {
            item.productPrice = (productObj.discountPrice !== null && productObj.discountPrice !== undefined) ? productObj.discountPrice : productObj.price;
          }
        });
      } catch (e) { }

      let subtotal = 0;
      cartItems.forEach((item) => {
        subtotal +=
          (parseFloat(item.productPrice) || 0) * (parseInt(item.quantity) || 1);
      });

      const shippingCost = parseFloat($(this).val()) || 0;
      const finalTotal = subtotal + shippingCost;
      $("#finalTotal").text(`₹${finalTotal.toFixed(2)}`);
    } catch (e) { }
  });

  // Payment Method item click and toggle descriptions
  $(document).on("change", "input[name='paymentMethod']", function () {
    $(".payment-method-item").removeClass("selected-payment");
    $(".payment-desc").addClass("d-none");

    const $parent = $(this).closest(".payment-method-item");
    $parent.addClass("selected-payment");
    $parent.find(".payment-desc").removeClass("d-none");
  });

  $(document).on("click", ".payment-method-item", function (e) {
    if (!$(e.target).is("input")) {
      $(this).find("input[name='paymentMethod']").prop("checked", true).trigger("change");
    }
  });

  renderCartTable();
});

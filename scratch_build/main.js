import { loginUser, registerUser, getCurrentUser } from "./auth.js";
import {
  getAllCategories,
  getAllProducts,
  getFeaturedProducts,
  getProductsByFilter,
  getLatestProducts
} from "./products.js";
import { addToCartAPI, getCartAPI } from "./api/cartService.js";
import { getDashboardStats } from "./api/dashboardService.js";
import { BASE_URL } from "./api/config.js";
export function showToast(message, type = "success", title = "") {
  const toastContainer = $("#toast-container");
  if (toastContainer.length === 0) {
    $("body").append(
      '<div id="toast-container" class="position-fixed bottom-0 end-0 p-3" style="z-index: 10000"></div>'
    );
  }
  const icons = {
    success: '<i class="fas fa-check-circle text-success me-2"></i>',
    error: '<i class="fas fa-exclamation-circle text-danger me-2"></i>',
    info: '<i class="fas fa-info-circle text-info me-2"></i>'
  };
  const toastId = "toast-" + Date.now();
  const toastHtml = `
    <div id="${toastId}" class="toast custom-toast show" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        ${icons[type] || icons.info}
        <strong class="me-auto text-dark">${title || (type === "success" ? "Success" : "Notification")}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
      <div class="progress">
          <div class="progress-bar bg-${type === "success" ? "primary" : type === "error" ? "danger" : "info"}" role="progressbar" style="width: 100%"></div>
      </div>
    </div>
  `;
  $("#toast-container").append(toastHtml);
  const $toast = $(`#${toastId}`);
  setTimeout(() => {
    $toast.find(".progress-bar").css("width", "0%");
  }, 10);
  setTimeout(() => {
    $toast.addClass("hiding");
    setTimeout(() => {
      $toast.remove();
    }, 400);
  }, 3e3);
}
export function showConfirm(title, message) {
  return new Promise((resolve) => {
    const modalId = "confirm-modal-" + Date.now();
    const modalHtml = `
      <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true" style="z-index: 10050;">
        <div class="modal-dialog modal-dialog-centered" style="max-width: 400px;">
          <div class="modal-content border-0 shadow-lg" style="border-radius: 16px; overflow: hidden; background: #fff;">
            <div class="modal-header border-0 pb-0 pt-4 px-4 d-flex justify-content-between align-items-center">
              <h5 class="modal-title fw-bold text-dark" style="font-size: 1.25rem; font-family: 'Raleway', sans-serif;">${title}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" style="background-size: 0.8rem;"></button>
            </div>
            <div class="modal-body px-4 py-3 text-muted" style="font-size: 0.95rem; line-height: 1.5; font-family: 'Open Sans', sans-serif;">
              ${message}
            </div>
            <div class="modal-footer border-0 pt-2 pb-4 px-4 d-flex gap-2 justify-content-end">
              <button type="button" class="btn border border-secondary rounded-pill px-4 py-2 text-primary cancel-btn" data-bs-dismiss="modal" style="font-size: 0.9rem; font-weight: 600; transition: all 0.2s;">Cancel</button>
              <button type="button" class="btn btn-primary rounded-pill px-4 py-2 text-white confirm-btn" style="background-color: #81c408 !important; border: none !important; font-size: 0.9rem; font-weight: 600; transition: all 0.2s;">Remove</button>
            </div>
          </div>
        </div>
      </div>
    `;
    $("body").append(modalHtml);
    const $modalEl = $(`#${modalId}`);
    const modalInstance = new bootstrap.Modal($modalEl[0], {
      backdrop: "static",
      keyboard: false
    });
    modalInstance.show();
    $modalEl.find(".confirm-btn").on("click", function() {
      modalInstance.hide();
      resolve(true);
    });
    $modalEl.on("hidden.bs.modal", function() {
      $modalEl.remove();
      resolve(false);
    });
  });
}
(function($2) {
  "use strict";
  var spinner = function() {
    setTimeout(function() {
      if ($2("#spinner").length > 0) {
        $2("#spinner").removeClass("show");
      }
    }, 1);
  };
  spinner();
  function injectMobileBranding() {
    const $mobileLogo = $2(".navbar-brand img.d-xl-none");
    if ($mobileLogo.length > 0 && $2("#mobile-brand-title").length === 0) {
      const brandTextHtml = `
        <span id="mobile-brand-title" class="d-inline d-xl-none ms-2 fw-bold text-primary" style="font-family: 'Raleway', sans-serif; font-size: 1.25rem; letter-spacing: -0.5px; vertical-align: middle;">
          Skin Dekh<i class="fas fa-eye text-primary" style="font-size: 0.95em; margin-left: 1px; vertical-align: middle;"></i>
        </span>
      `;
      $mobileLogo.after(brandTextHtml);
      if ($2("#mobile-brand-center-style").length === 0) {
        $2("head").append(`
          <style id="mobile-brand-center-style">
            @media (max-width: 1199px) {
              .navbar {
                position: relative;
                display: flex;
                align-items: center;
              }
              #mobile-brand-title {
                position: absolute;
                left: 50% !important;
                transform: translateX(-50%) !important;
                margin: 0 !important;
                white-space: nowrap;
                z-index: 5;
              }
            }
          </style>
        `);
      }
    }
  }
  injectMobileBranding();
  function ensureAuthModal() {
    if ($2("#authModal").length === 0) {
      console.log("Injecting Auth Modal...");
      const modalHtml = `
        <div class="modal fade" id="authModal" tabindex="-1" aria-hidden="true" style="z-index: 10050;">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content rounded-3 shadow-lg" style="border: 0; background: #fff;">
              <div class="modal-header border-bottom py-3 px-4">
                <h5 class="modal-title fw-bold text-primary">Login / Sign Up</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body p-4">
                <ul class="nav nav-pills mb-4 justify-content-center" id="authTab">
                  <li class="nav-item">
                    <button class="nav-link active px-4" data-bs-toggle="pill" data-bs-target="#loginTab" type="button">Login</button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link px-4" data-bs-toggle="pill" data-bs-target="#signupTab" type="button">Sign Up</button>
                  </li>
                </ul>
                <div class="tab-content">
                  <div class="tab-pane fade show active" id="loginTab">
                    <form id="loginForm">
                      <div class="mb-3">
                        <label class="form-label text-dark fw-semibold small">Email Address</label>
                        <input type="email" class="form-control py-2" name="email" placeholder="Enter email" required />
                      </div>
                      <div class="mb-3">
                        <label class="form-label text-dark fw-semibold small">Password</label>
                        <input type="password" class="form-control py-2" name="password" placeholder="Enter password" required />
                      </div>
                      <button class="btn btn-primary w-100 py-2 fw-bold text-white shadow-sm" style="background: #81c408; border-color: #81c408;">Login</button>
                    </form>
                  </div>
                  <div class="tab-pane fade" id="signupTab">
                    <form id="signupForm">
                      <div class="row g-2 mb-3">
                        <div class="col-6">
                          <label class="form-label text-dark fw-semibold small">First Name</label>
                          <input type="text" class="form-control py-2" name="firstName" placeholder="First Name" required />
                        </div>
                        <div class="col-6">
                          <label class="form-label text-dark fw-semibold small">Last Name</label>
                          <input type="text" class="form-control py-2" name="lastName" placeholder="Last Name" required />
                        </div>
                      </div>
                      <div class="mb-3">
                        <label class="form-label text-dark fw-semibold small">Email Address</label>
                        <input type="email" class="form-control py-2" name="email" placeholder="Email" required />
                      </div>
                      <div class="mb-3">
                        <label class="form-label text-dark fw-semibold small">Phone Number</label>
                        <input type="tel" class="form-control py-2" name="phoneNumber" placeholder="10-digit mobile number" pattern="[0-9]{10}" required />
                      </div>
                      <div class="mb-3">
                        <label class="form-label text-dark fw-semibold small">Password</label>
                        <input type="password" class="form-control py-2" name="password" placeholder="Password" required />
                      </div>
                      <button class="btn btn-primary w-100 py-2 fw-bold text-white shadow-sm" style="background: #81c408; border-color: #81c408;">Sign Up</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      $2("body").append(modalHtml);
    }
  }
  function openAuthModal() {
    ensureAuthModal();
    const modalEl = document.getElementById("authModal");
    if (!modalEl) return;
    try {
      if (window.bootstrap && window.bootstrap.Modal) {
        const modalInstance = window.bootstrap.Modal.getOrCreateInstance(modalEl);
        modalInstance.show();
        return;
      }
    } catch (err) {
      console.warn("Bootstrap Modal show exception, using fallback", err);
    }
    if (window.jQuery && $2.fn.modal) {
      $2(modalEl).modal("show");
      return;
    }
    $2(modalEl).removeClass("d-none").addClass("show").css({ display: "block", opacity: "1", zIndex: "1055" }).attr("aria-hidden", "false");
    if ($2(".modal-backdrop").length === 0) {
      $2("body").append('<div class="modal-backdrop fade show" style="z-index: 1050;"></div>');
    }
  }
  $2(document).on("click", "#authModal [data-bs-dismiss='modal'], #authModal .btn-close, .modal-backdrop", function() {
    const modalEl = document.getElementById("authModal");
    if (modalEl && window.bootstrap && window.bootstrap.Modal) {
      try {
        const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();
      } catch (e) {
      }
    }
    $2("#authModal").removeClass("show").css({ display: "none" }).attr("aria-hidden", "true");
    $2(".modal-backdrop").remove();
  });
  let searchProductsCache = [];
  function ensureSearchModal() {
    if ($2("#searchModal").length === 0) {
      const searchModalHtml = `
        <div class="modal fade" id="searchModal" tabindex="-1" aria-labelledby="searchModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-fullscreen">
            <div class="modal-content border-0 rounded-0" style="background: #f8fafc;">
              <!-- Top Search Header -->
              <div class="modal-header border-bottom bg-white py-2 px-3 align-items-center shadow-sm">
                <button type="button" class="btn p-2 text-dark border-0 shadow-none me-2" data-bs-dismiss="modal" aria-label="Back" style="font-size: 1.2rem;">
                  <i class="fas fa-arrow-left"></i>
                </button>
                <div class="input-group flex-grow-1">
                  <input
                    type="search"
                    id="modalSearchInput"
                    class="form-control rounded-3 border py-2 px-3 shadow-none"
                    placeholder="Search"
                    style="font-size: 1rem; border-color: #cbd5e1; background: #fff;"
                    autocomplete="off"
                  />
                </div>
              </div>

              <!-- Search Content Body -->
              <div class="modal-body p-0" style="overflow-y: auto; overflow-x: hidden;">
                <!-- Sub-header -->
                <div class="px-3 py-2 text-uppercase fw-bold text-muted small bg-light border-bottom d-flex align-items-center gap-2" id="searchSectionHeader" style="letter-spacing: 0.5px; font-size: 0.78rem;">
                  <i class="fas fa-chart-line text-primary"></i> <span id="searchHeaderTitle">OUR EXPERT RECOMMENDATIONS</span>
                </div>

                <!-- Products Recommendations / Live Search Results List -->
                <div class="container py-3" style="max-width: 650px; width: 100%; box-sizing: border-box;">
                  <div id="modalSearchResultsList" class="d-flex flex-column gap-2" style="width: 100%; overflow-x: hidden;">
                    <div class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm text-primary me-2"></div>Loading recommendations...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      $2("body").append(searchModalHtml);
    }
  }
  function renderModalProductRow(item) {
    const relativeImgUrl = item.imageUrl || "";
    const fullImgUrl = relativeImgUrl.startsWith("http") ? relativeImgUrl : relativeImgUrl ? BASE_URL + relativeImgUrl : "img/product-default.jpg";
    const currentPrice = item.discountPrice ?? item.price;
    const mrp = item.discountPrice ? item.price : Math.round(item.price * 1.2);
    const discountPct = Math.round((mrp - currentPrice) / mrp * 100);
    const discountBadge = discountPct > 0 ? `<span class="position-absolute top-0 start-0 badge text-white px-1 py-1" style="background: #8b5cf6; font-size: 0.6rem; font-weight: 700; border-top-left-radius: 4px; border-bottom-right-radius: 6px; z-index: 2;">SAVE ${discountPct}%</span>` : "";
    return `
      <a href="product-detail.html?id=${item.id}" class="d-flex align-items-center p-2 bg-white rounded shadow-sm text-decoration-none border hover-shadow" style="transition: transform 0.15s ease, box-shadow 0.15s ease; width: 100%; box-sizing: border-box; overflow: hidden;">
        <div class="position-relative me-3 flex-shrink-0" style="width: 75px; height: 75px; background: #ffffff; border-radius: 6px; overflow: hidden; border: 1px solid #f1f5f9;">
          <img src="${fullImgUrl}" alt="${item.name}" class="w-100 h-100" style="object-fit: contain; filter: none; opacity: 1; font-size: 0;" onerror="this.onerror=null;this.src='img/product-default.jpg';" />
          ${discountBadge}
        </div>
        <div class="flex-grow-1" style="min-width: 0; overflow: hidden;">
          <h6 class="text-dark fw-bold mb-1 text-truncate" style="font-size: 0.92rem; font-family: 'Raleway', sans-serif;">${item.name}</h6>
          <div class="d-flex align-items-center text-warning small mb-1" style="font-size: 0.78rem;">
            <i class="fas fa-star me-1"></i>
            <i class="fas fa-star me-1"></i>
            <i class="fas fa-star me-1"></i>
            <i class="fas fa-star me-1"></i>
            <i class="fas fa-star-half-alt me-1"></i>
            <span class="text-muted ms-1" style="font-size: 0.75rem; font-weight: 600;">4.7</span>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span class="fw-bold" style="font-size: 0.98rem; color: #7c3aed;">\u20B9${currentPrice}</span>
            ${mrp > currentPrice ? `<span class="text-muted text-decoration-line-through small" style="font-size: 0.8rem;">\u20B9${mrp}</span>` : ""}
          </div>
        </div>
      </a>
    `;
  }
  async function loadModalSearchData(query = "") {
    const $container = $2("#modalSearchResultsList");
    const $headerTitle = $2("#searchHeaderTitle");
    try {
      if (searchProductsCache.length === 0) {
        const res = await getAllProducts();
        searchProductsCache = res.result || res || [];
      }
      const q = query.trim().toLowerCase();
      let list = [];
      if (!q) {
        $headerTitle.text("OUR EXPERT RECOMMENDATIONS");
        list = searchProductsCache.slice(0, 10);
      } else {
        $headerTitle.text(`SEARCH RESULTS (${q})`);
        list = searchProductsCache.filter(
          (item) => item.name && item.name.toLowerCase().includes(q) || item.description && item.description.toLowerCase().includes(q) || item.category && item.category.toLowerCase().includes(q)
        );
      }
      $container.empty();
      if (list.length === 0) {
        $container.html(`
          <div class="text-center py-5 text-muted">
            <i class="fas fa-search-minus mb-2" style="font-size: 2.5rem; opacity: 0.5;"></i>
            <p class="mb-0">No matching products found for "${query}".</p>
          </div>
        `);
        return;
      }
      list.forEach((item) => {
        if (!item.name || item.name === "string") return;
        $container.append(renderModalProductRow(item));
      });
    } catch (err) {
      console.error("Failed to load modal search products", err);
      $container.html('<div class="text-center py-4 text-danger">Failed to load products.</div>');
    }
  }
  ensureAuthModal();
  ensureSearchModal();
  $2(document).on("click", '[data-bs-target="#searchModal"], .btn-search', function(e) {
    e.preventDefault();
    ensureSearchModal();
    const searchModalEl = document.getElementById("searchModal");
    if (searchModalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(searchModalEl);
      modal.show();
      loadModalSearchData($2("#modalSearchInput").val() || "");
      setTimeout(() => {
        $2("#modalSearchInput").focus();
      }, 300);
    }
  });
  $2(window).scroll(function() {
    if ($2(window).width() < 992) {
      if ($2(this).scrollTop() > 55) {
        $2(".fixed-top").addClass("shadow");
      } else {
        $2(".fixed-top").removeClass("shadow");
      }
    } else {
      if ($2(this).scrollTop() > 55) {
        $2(".fixed-top").addClass("shadow").css("top", -55);
      } else {
        $2(".fixed-top").removeClass("shadow").css("top", 0);
      }
    }
  });
  $2(window).scroll(function() {
    if ($2(this).scrollTop() > 300) {
      $2(".back-to-top").fadeIn("slow");
    } else {
      $2(".back-to-top").fadeOut("slow");
    }
  });
  $2(".back-to-top").click(function() {
    $2("html, body").animate({ scrollTop: 0 }, 1500, "easeInOutExpo");
    return false;
  });
  $2(".vegetable-carousel").owlCarousel({
    autoplay: true,
    smartSpeed: 1500,
    center: false,
    dots: true,
    loop: true,
    margin: 25,
    nav: true,
    navText: [
      '<i class="bi bi-arrow-left"></i>',
      '<i class="bi bi-arrow-right"></i>'
    ],
    responsive: {
      0: { items: 1 },
      576: { items: 1 },
      768: { items: 2 },
      992: { items: 3 },
      1200: { items: 4 }
    }
  });
  $2(document).ready(function() {
    let videoSrc = "";
    $2(".btn-play").click(function() {
      videoSrc = $2(this).data("src");
    });
    $2("#videoModal").on("shown.bs.modal", function() {
      $2("#video").attr(
        "src",
        videoSrc + "?autoplay=1&modestbranding=1&showinfo=0"
      );
    });
    $2("#videoModal").on("hide.bs.modal", function() {
      $2("#video").attr("src", videoSrc);
    });
  });
  $2("#loginForm").on("submit", async function(e) {
    e.preventDefault();
    const email = $2(this).find("[name='email']").val();
    const password = $2(this).find("[name='password']").val();
    console.log("email---", email, password);
    try {
      const res = await loginUser(email, password);
      console.log("Login Success:", res);
      const token = res.result?.token?.accessToken || res.token;
      if (!token) throw new Error("Token not received");
      sessionStorage.setItem("token", token);
      localStorage.setItem("token", token);
      console.log("Token:", token);
      try {
        const userRes = await getCurrentUser(token);
        console.log("Current User:", userRes);
        const userData = userRes.result || userRes;
        sessionStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (userErr) {
        console.error("Failed to fetch user data", userErr);
      }
      showToast("Login successful \u2705 Redirecting...", "success", "Welcome Back");
      $2("#authModal").modal("hide");
      setTimeout(() => {
        window.location.href = "User.html";
      }, 600);
    } catch (err) {
      showToast(err.message || "Login failed", "error", "Login Error");
    }
  });
  $2("#signupForm").on("submit", async function(e) {
    e.preventDefault();
    const payload = {
      firstName: $2(this).find("[name='firstName']").val(),
      lastName: $2(this).find("[name='lastName']").val(),
      email: $2(this).find("[name='email']").val(),
      phoneNumber: $2(this).find("[name='phoneNumber']").val(),
      password: $2(this).find("[name='password']").val()
    };
    console.log("payload---", payload);
    try {
      const res = await registerUser(payload);
      console.log("Signup Success:", res);
      const token = res.result?.token?.accessToken || res.token;
      const user = res.result?.user || res.user;
      if (token) {
        sessionStorage.setItem("token", token);
        localStorage.setItem("token", token);
        if (user) {
          sessionStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("user", JSON.stringify(user));
        }
        showToast("Signup & Login successful \u{1F389} Redirecting...", "success", "Welcome");
      } else {
        showToast("Signup successful \u{1F389}", "success", "Account Created");
      }
      $2("#authModal").modal("hide");
      this.reset();
      if (typeof syncCartBadge === "function") {
        syncCartBadge();
      }
      setTimeout(() => {
        window.location.href = token ? "User.html" : "home.html";
      }, 600);
    } catch (err) {
      console.log(err, "err");
      showToast(err.message || "Signup failed", "error", "Signup Error");
    }
  });
  function handleUserIconClick(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    const isValidToken = token && token !== "null" && token !== "undefined" && token.trim() !== "";
    if (isValidToken) {
      window.location.href = "User.html";
    } else {
      sessionStorage.removeItem("token");
      localStorage.removeItem("token");
      openAuthModal();
    }
  }
  if (typeof window !== "undefined") {
    window.handleUserIconClick = handleUserIconClick;
    window.openAuthModal = openAuthModal;
    window.loadModalSearchData = loadModalSearchData;
  }
  $2(document).on(
    "click",
    ".user-icon-link, .user-icon-link *, a[href*='User.html']:not(.btn-link), .fa-user, [data-auth-trigger]",
    function(e) {
      handleUserIconClick(e);
    }
  );
  $2(document).on("click", ".footer-item a", function(e) {
    const linkText = $2(this).text().trim();
    const loginRequiredLinks = [
      "My Account",
      "Shop details",
      "Shopping Cart",
      "Order History"
    ];
    if (loginRequiredLinks.includes(linkText)) {
      const token = sessionStorage.getItem("token");
      if (!token) {
        e.preventDefault();
        $2("#authModal").modal("show");
      }
    }
  });
  $2(document).on("input", "#modalSearchInput", function() {
    const val = this.value;
    loadModalSearchData(val);
    const isShopPage = window.location.pathname.includes("shop.html");
    if (isShopPage && typeof handleSearch === "function") {
      $2("#shopSearchInput").val(val);
      handleSearch(val);
    }
  });
  $2(document).on("keypress", "#modalSearchInput", function(e) {
    if (e.which === 13) {
      e.preventDefault();
      const query = $2(this).val().trim();
      const isShopPage = window.location.pathname.includes("shop.html");
      if (isShopPage && typeof handleSearch === "function") {
        $2("#shopSearchInput").val(query);
        handleSearch(query);
        const searchModal = bootstrap.Modal.getInstance($2("#searchModal")[0]);
        if (searchModal) searchModal.hide();
      } else if (query) {
        window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
      }
    }
  });
})(jQuery);
function renderClinikallyProductCard(item, colClass = "") {
  const relativeImgUrl = item.imageUrl || "";
  const fullImgUrl = relativeImgUrl.startsWith("http") ? relativeImgUrl : relativeImgUrl ? BASE_URL + relativeImgUrl : "img/product-default.jpg";
  const currentPrice = item.discountPrice ?? item.price;
  const mrp = item.discountPrice ? item.price : Math.round(item.price * 1.2);
  const discountPct = Math.round((mrp - currentPrice) / mrp * 100);
  const showDiscount = discountPct > 0;
  const whatsappMessage = encodeURIComponent(
    `\u{1F9F4} *${item.name}*
\u{1F4B0} Price: \u20B9${currentPrice}`
  );
  return `
    <div class="${colClass}">
      <div class="rounded position-relative fruite-item h-100">
        <div class="fruite-img position-relative">
          <a href="product-detail.html?id=${item.id}" class="d-flex align-items-center justify-content-center w-100 h-100">
            <img src="${fullImgUrl}" class="img-fluid rounded-top" onerror="this.onerror=null;this.src='img/product-sm-1.jpg'" alt="${item.name}" />
          </a>
          ${item.category ? `<span class="badge bg-secondary position-absolute product-card-category-badge">${item.category}</span>` : ""}
        </div>

        <div class="p-4 border border-secondary border-top-0 rounded-bottom d-flex flex-column">
          <div class="product-rating d-flex align-items-center mb-1">
            <i class="fas fa-star text-warning" style="font-size: 0.68rem;"></i>
            <span class="text-dark fw-bold ms-1" style="font-size: 0.72rem;">4.6</span>
            <span class="text-muted ms-1" style="font-size: 0.68rem;">(42)</span>
          </div>

          <h4 class="mb-1"><a href="product-detail.html?id=${item.id}" class="text-dark text-decoration-none">${item.name}</a></h4>
          <p class="text-muted small product-desc d-none d-md-block mb-2">${item.description || ""}</p>

          <div class="d-flex align-items-baseline mb-2">
            <span class="text-dark fw-bold fs-6">\u20B9${currentPrice}</span>
            ${mrp > currentPrice ? `<span class="text-muted text-decoration-line-through ms-2" style="font-size: 0.75rem;">\u20B9${mrp}</span>` : ""}
          </div>

          <div class="d-flex align-items-center gap-1 mt-auto">
            <a href="javascript:void(0)" 
               class="btn btn-outline-primary rounded-pill px-2 py-1 add-to-cart-btn flex-grow-1"
               data-id="${item.id}"
               data-name="${item.name}"
               data-price="${currentPrice}"
               data-img="${fullImgUrl}">
              <i class="fa fa-shopping-bag me-1"></i>Add to cart
            </a>

            <a href="https://wa.me/919461972759?text=${whatsappMessage}"
               target="_blank"
               class="whatsapp-btn ms-1"
               title="Chat on WhatsApp">
              <i class="fab fa-whatsapp"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}
async function loadProducts(category = "") {
  try {
    const res = await getAllProducts(category);
    let products = res.result || [];
    const $productList = $("#productList");
    const isShopPage = $("body").hasClass("shop-page") || window.location.pathname.includes("shop.html");
    if (!isShopPage) {
      products = products.slice(0, 8);
    }
    const colClass = isShopPage ? "col-6 col-md-6 col-lg-4 col-xl-4" : "col-6 col-md-6 col-lg-3 col-xl-3";
    $productList.empty();
    products.forEach((item) => {
      if (!item.name || item.name === "string") return;
      $productList.append(renderClinikallyProductCard(item, colClass));
    });
  } catch (err) {
    console.error("Failed to load products", err);
  }
}
let allProducts = [];
const activeFilters = {
  category: "",
  priceUnder: "",
  priceSort: "",
  productName: ""
};
function applyFilters() {
  const filters = {};
  if (activeFilters.category) filters.category = activeFilters.category;
  if (activeFilters.productName)
    filters.productName = activeFilters.productName;
  getFilterProducts(filters);
}
let currentPage = 1;
const PRODUCTS_PER_PAGE = 12;
async function getFilterProducts(filters = {}) {
  try {
    let products = [];
    try {
      const res = await getProductsByFilter(filters);
      products = res.result || res || [];
    } catch (e) {
      console.warn("getProductsByFilter failed, trying getAllProducts", e);
    }
    if ((!products || products.length === 0) && (activeFilters.productName || activeFilters.category)) {
      const allRes = await getAllProducts();
      products = allRes.result || allRes || [];
      if (activeFilters.category) {
        const catLower = activeFilters.category.toLowerCase();
        products = products.filter(
          (item) => item.category?.toLowerCase() === catLower
        );
      }
    }
    if (activeFilters.productName) {
      const queryLower = activeFilters.productName.toLowerCase().trim();
      if (queryLower) {
        products = products.filter(
          (item) => item.name && item.name.toLowerCase().includes(queryLower) || item.description && item.description.toLowerCase().includes(queryLower) || item.category && item.category.toLowerCase().includes(queryLower)
        );
      }
    }
    const maxPrice = activeFilters.priceUnder ? Number(activeFilters.priceUnder) : null;
    if (maxPrice && maxPrice > 0) {
      products = products.filter((item) => {
        const displayPrice = item.discountPrice ?? item.price;
        return Number(displayPrice) <= maxPrice;
      });
    }
    if (activeFilters.priceSort) {
      products = [...products].sort((a, b) => {
        const pa = Number(a.discountPrice ?? a.price);
        const pb = Number(b.discountPrice ?? b.price);
        return activeFilters.priceSort == 1 ? pa - pb : pb - pa;
      });
    }
    allProducts = products;
    currentPage = 1;
    renderPaginatedProducts();
    renderPagination();
  } catch (err) {
    console.error("Filter load failed", err);
  }
}
function renderPaginatedProducts() {
  const $productList = $("#productList");
  $productList.empty();
  if (!allProducts || allProducts.length === 0) {
    const searchVal = $("#shopSearchInput").val()?.trim() || "";
    const activeCat = $("#categoryTabs a.active").data("category") || "";
    const emptyHtml = `
      <div class="col-12 text-center py-5">
        <div class="mb-3">
          <i class="fas fa-search-minus text-muted" style="font-size: 3.5rem;"></i>
        </div>
        <h4 class="fw-bold text-dark mb-2">No products found ${searchVal ? `for "${searchVal}"` : ""}</h4>
        <p class="text-muted mb-4" style="max-width: 450px; margin: 0 auto;">
          We couldn't find any products matching your current filters ${activeCat ? `in category "${activeCat}"` : ""}. Try searching for different keywords or reset your filters.
        </p>
        <button class="btn btn-outline-primary rounded-pill px-4 text-primary mt-2 fw-bold" id="clearAllFiltersBtn">
          <i class="fas fa-redo me-2"></i>Reset All Filters
        </button>
      </div>
    `;
    $productList.html(emptyHtml);
    return;
  }
  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const end = start + PRODUCTS_PER_PAGE;
  const productsToShow = allProducts.slice(start, end);
  const isShopPage = $("body").hasClass("shop-page") || window.location.pathname.includes("shop.html");
  const colClass = isShopPage ? "col-6 col-md-6 col-lg-4 col-xl-4" : "col-6 col-md-6 col-lg-3 col-xl-3";
  productsToShow.forEach((item) => {
    if (!item.name || item.name === "string") return;
    $productList.append(renderClinikallyProductCard(item, colClass));
  });
}
function renderPagination() {
  const $pagination = $("#pagination");
  $pagination.empty();
  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);
  if (totalPages <= 1) return;
  $pagination.append(`
    <a href="#" class="rounded ${currentPage === 1 ? "disabled" : ""}" data-page="prev">&laquo;</a>
  `);
  for (let i = 1; i <= totalPages; i++) {
    $pagination.append(`
      <a href="#" class="rounded ${i === currentPage ? "active" : ""}" data-page="${i}">
        ${i}
      </a>
    `);
  }
  $pagination.append(`
    <a href="#" class="rounded ${currentPage === totalPages ? "disabled" : ""}" data-page="next">&raquo;</a>
  `);
}
$(document).on("click", "#pagination a", function(e) {
  e.preventDefault();
  const page = $(this).data("page");
  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);
  if (page === "prev" && currentPage > 1) currentPage--;
  else if (page === "next" && currentPage < totalPages) currentPage++;
  else if (!isNaN(page)) currentPage = page;
  renderPaginatedProducts();
  renderPagination();
  $("html, body").animate(
    { scrollTop: $("#productList").offset().top - 100 },
    300
  );
});
let searchDebounceTimer = null;
function handleSearch(value) {
  clearTimeout(searchDebounceTimer);
  const query = value.trim();
  const $clearBtn = $("#clearShopSearchBtn");
  if (query.length > 0) {
    $clearBtn.removeClass("d-none");
  } else {
    $clearBtn.addClass("d-none");
  }
  searchDebounceTimer = setTimeout(() => {
    activeFilters.productName = query;
    applyFilters();
  }, 300);
}
$(document).on("input", "#shopSearchInput", function() {
  handleSearch(this.value);
});
$(document).on(
  "click",
  "#shopSearchIconBtn, #shopSearchIconBtn *",
  function(e) {
    e.preventDefault();
    clearTimeout(searchDebounceTimer);
    const query = $("#shopSearchInput").val()?.trim() || "";
    $("#categoryTabs a").removeClass("active");
    $("#categoryTabs a[data-category='']").addClass("active");
    activeFilters.category = "";
    activeFilters.productName = query;
    if (query.length > 0) {
      $("#clearShopSearchBtn").removeClass("d-none");
    } else {
      $("#clearShopSearchBtn").addClass("d-none");
    }
    applyFilters();
  }
);
$(document).on("keypress", "#shopSearchInput", function(e) {
  if (e.which === 13) {
    e.preventDefault();
    clearTimeout(searchDebounceTimer);
    const query = $(this).val().trim();
    $("#categoryTabs a").removeClass("active");
    $("#categoryTabs a[data-category='']").addClass("active");
    activeFilters.category = "";
    activeFilters.productName = query;
    if (query.length > 0) {
      $("#clearShopSearchBtn").removeClass("d-none");
    } else {
      $("#clearShopSearchBtn").addClass("d-none");
    }
    applyFilters();
  }
});
$(document).on("click", "#clearShopSearchBtn", function() {
  $("#shopSearchInput").val("").focus();
  $(this).addClass("d-none");
  $("#categoryTabs a").removeClass("active");
  $("#categoryTabs a[data-category='']").addClass("active");
  activeFilters.productName = "";
  activeFilters.category = "";
  applyFilters();
});
$(document).on("click", "#clearAllFiltersBtn", function() {
  $("#shopSearchInput").val("");
  $("#clearShopSearchBtn").addClass("d-none");
  $("#categoryTabs a").removeClass("active");
  $("#categoryTabs a[data-category='']").addClass("active");
  const maxVal = parseInt($("#rangeInput").attr("max") || "500", 10);
  $("#rangeInput").val(maxVal);
  $("#amount").val(maxVal + "+");
  activeFilters.category = "";
  activeFilters.priceUnder = "";
  activeFilters.priceSort = "";
  activeFilters.productName = "";
  applyFilters();
});
$(document).on("click", "#toggleMobileFiltersBtn", function() {
  const $filters = $("#mobileFiltersContainer");
  const isHidden = $filters.hasClass("d-none") || !$filters.hasClass("d-block");
  if (isHidden) {
    $filters.removeClass("d-none").addClass("d-block");
    $(this).html('<i class="fas fa-times me-2"></i>Hide Filters');
    $(this).addClass("btn-primary text-white").removeClass("btn-outline-primary");
  } else {
    $filters.removeClass("d-block").addClass("d-none");
    $(this).html('<i class="fas fa-sliders-h me-2"></i>Filters');
    $(this).addClass("btn-outline-primary").removeClass("btn-primary text-white");
  }
});
$(document).on("input", "#rangeInput", function() {
  const val = parseInt(this.value, 10);
  const maxVal = parseInt($(this).attr("max") || "500", 10);
  if (val >= maxVal) {
    activeFilters.priceUnder = "";
    $("#amount").val(maxVal + "+");
  } else {
    activeFilters.priceUnder = val;
    $("#amount").val(val);
  }
  applyFilters();
});
$(document).on("click", "#sortDropdownBtn", function(e) {
  e.stopPropagation();
  $(".premium-sort-container").toggleClass("active");
});
$(document).on("click", ".sort-option", function() {
  const value = $(this).data("value");
  const text = $(this).text().trim();
  $("#currentSortText").text(text);
  $(".sort-option").removeClass("active");
  $(this).addClass("active");
  $(".premium-sort-container").removeClass("active");
  $("#fruits").val(value).trigger("change");
});
$(document).on("click", function(e) {
  if (!$(e.target).closest(".premium-sort-container").length) {
    $(".premium-sort-container").removeClass("active");
  }
});
$("#fruits").on("change", function() {
  const value = $(this).val();
  activeFilters.priceSort = value === "low" ? 1 : value === "high" ? 2 : "";
  applyFilters();
});
function getCategoryIcon(category) {
  const name = category ? category.trim() : "";
  const iconMap = {
    "Face Wash": "fa-pump-soap",
    "Moisturing Lotion": "fa-magic",
    "Moisturing Cream": "fa-magic",
    "Face Serum": "fa-tint",
    "Sunscreen Lotion": "fa-sun",
    "Hair Care": "fa-hand-holding-heart",
    Acne: "fa-notes-medical",
    Tablets: "fa-pills"
  };
  return iconMap[name] || "fa-tag";
}
async function loadCategories() {
  try {
    const res = await getAllCategories();
    const categories = res.result || res || [];
    console.log("categories---", categories);
    const $categoryTabs = $("#categoryTabs");
    if ($categoryTabs.length === 0) return;
    $categoryTabs.empty();
    $categoryTabs.append(`
      <li>
        <div class="d-flex justify-content-between fruite-name">
          <a href="#" class="active" data-category="">
            <i class="fas fa-th-large me-2"></i>All
          </a>
        </div>
      </li>
    `);
    categories.forEach((item) => {
      if (!item.category || item.category === "string") return;
      const iconClass = getCategoryIcon(item.category);
      $categoryTabs.append(`
        <li>
          <div class="d-flex justify-content-between fruite-name">
            <a href="#" data-category="${item.category}">
              <i class="fas ${iconClass} me-2"></i>
              ${item.category}
            </a>
          </div>
        </li>
      `);
    });
  } catch (err) {
    console.error("Failed to load categories", err);
  }
}
const pastelBackgrounds = [
  "#ffe8d6",
  // Peach
  "#e8e8ff",
  // Lavender
  "#d8f3dc",
  // Mint Green
  "#ffe5ec",
  // Soft Pink
  "#d8f3f3",
  // Light Aqua
  "#ffebd6",
  // Light Orange
  "#f0e6ff",
  // Light Purple
  "#ffe5d9"
  // Soft Coral
];
async function loadNavbarCategories() {
  try {
    const res = await getAllCategories();
    const categories = res.result || res || [];
    const $dropdowns = $(".navbar-categories-dropdown");
    if ($dropdowns.length === 0) return;
    $dropdowns.each(function() {
      const $dropdown = $(this);
      $dropdown.find(".dropdown-item:not([href='shop.html'])").remove();
      categories.forEach((item) => {
        if (!item.category || item.category === "string") return;
        $dropdown.append(`
          <a href="shop.html?category=${encodeURIComponent(item.category)}" class="dropdown-item">${item.category}</a>
        `);
      });
    });
  } catch (err) {
    console.error("Failed to load navbar categories", err);
  }
}
async function loadHomeCategories() {
  const $container = $("#homeCategoriesList");
  if ($container.length === 0) return;
  try {
    const res = await getAllCategories();
    const categories = res.result || res || [];
    $container.empty();
    if (categories.length === 0) {
      $container.html(
        '<div class="col-12 text-center py-4 text-muted">No categories found.</div>'
      );
      return;
    }
    categories.forEach((item, index) => {
      if (!item.category || item.category === "string") return;
      const bgColor = pastelBackgrounds[index % pastelBackgrounds.length];
      const relativeImgUrl = item.imageUrl || "";
      const fullImgUrl = relativeImgUrl.startsWith("http") ? relativeImgUrl : relativeImgUrl ? BASE_URL + relativeImgUrl : "img/product-default.jpg";
      const cardHtml = `
        <div class="category-card" onclick="window.location.href='shop.html?category=${encodeURIComponent(item.category)}'">
          <div class="category-card-img-wrapper" style="background-color: ${bgColor}">
            <div class="category-card-img-inner">
              <img src="${fullImgUrl}" alt="${item.category}" onerror="this.onerror=null;this.src='img/product-sm-1.jpg'" />
            </div>
          </div>
          <a href="shop.html?category=${encodeURIComponent(item.category)}" class="category-card-title">${item.category}</a>
        </div>
      `;
      $container.append(cardHtml);
    });
    $(document).off("click", ".category-next-btn").on("click", ".category-next-btn", function() {
      const $wrapper = $(".category-carousel-wrapper");
      const scrollAmount = $wrapper.width() * 0.75;
      $wrapper.animate(
        { scrollLeft: $wrapper.scrollLeft() + scrollAmount },
        400
      );
    });
    $(document).off("click", ".category-prev-btn").on("click", ".category-prev-btn", function() {
      const $wrapper = $(".category-carousel-wrapper");
      const scrollAmount = $wrapper.width() * 0.75;
      $wrapper.animate(
        { scrollLeft: $wrapper.scrollLeft() - scrollAmount },
        400
      );
    });
  } catch (err) {
    console.error("Failed to load home page categories", err);
    $container.html(
      '<div class="col-12 text-center py-4 text-danger">Failed to load categories.</div>'
    );
  }
}
async function loadLatestProducts() {
  const $container = $("#latestProductList");
  if ($container.length === 0) return;
  try {
    const res = await getLatestProducts();
    const products = res.result || res || [];
    $container.empty();
    if (products.length === 0) {
      $container.html(
        '<div class="col-12 text-center py-4 text-muted">No latest products found.</div>'
      );
      return;
    }
    products.forEach((item) => {
      if (!item.name || item.name === "string") return;
      $container.append(
        renderClinikallyProductCard(item, "latest-product-card")
      );
    });
    $(document).off("click", ".latest-next-btn").on("click", ".latest-next-btn", function() {
      const $wrapper = $(".latest-carousel-wrapper");
      const scrollAmount = $wrapper.width() * 0.75;
      $wrapper.animate(
        { scrollLeft: $wrapper.scrollLeft() + scrollAmount },
        400
      );
    });
    $(document).off("click", ".latest-prev-btn").on("click", ".latest-prev-btn", function() {
      const $wrapper = $(".latest-carousel-wrapper");
      const scrollAmount = $wrapper.width() * 0.75;
      $wrapper.animate(
        { scrollLeft: $wrapper.scrollLeft() - scrollAmount },
        400
      );
    });
  } catch (err) {
    console.error("Failed to load latest products", err);
    $container.html(
      '<div class="col-12 text-center py-4 text-danger">Failed to load latest products.</div>'
    );
  }
}
$(document).on("click", "#categoryTabs a", function(e) {
  const isShopPage = $("body").hasClass("shop-page") || window.location.pathname.includes("shop.html");
  if (!isShopPage) {
    return;
  }
  e.preventDefault();
  $("#categoryTabs a").removeClass("active");
  $(this).addClass("active");
  const category = $(this).data("category") || "";
  activeFilters.category = category;
  activeFilters.priceUnder = "";
  const $slider = $("#rangeInput");
  const maxVal = parseInt($slider.attr("max") || "500", 10);
  $slider.val(maxVal);
  $("#amount").val(maxVal + "+");
  applyFilters();
});
async function loadHomeFeaturedProducts() {
  const $container = $("#featuredProductsHomeList");
  if ($container.length === 0) return;
  try {
    const res = await getFeaturedProducts();
    const products = res.result || res || [];
    $container.empty();
    if (products.length === 0) {
      $container.html(
        '<div class="col-12 text-center py-4 text-muted">No featured products found.</div>'
      );
      return;
    }
    products.forEach((item) => {
      if (!item.name || item.name === "string") return;
      $container.append(
        renderClinikallyProductCard(item, "featured-product-card")
      );
    });
    $(document).off("click", ".featured-next-btn").on("click", ".featured-next-btn", function() {
      const $wrapper = $(".featured-carousel-wrapper");
      const scrollAmount = $wrapper.width() * 0.75;
      $wrapper.animate(
        { scrollLeft: $wrapper.scrollLeft() + scrollAmount },
        400
      );
    });
    $(document).off("click", ".featured-prev-btn").on("click", ".featured-prev-btn", function() {
      const $wrapper = $(".featured-carousel-wrapper");
      const scrollAmount = $wrapper.width() * 0.75;
      $wrapper.animate(
        { scrollLeft: $wrapper.scrollLeft() - scrollAmount },
        400
      );
    });
  } catch (err) {
    console.error("Failed to load home page featured products", err);
    $container.html(
      '<div class="col-12 text-center py-4 text-danger">Failed to load featured products.</div>'
    );
  }
}
let allFeaturedProducts = [];
let showAllFeatured = false;
async function loadFeaturedProducts() {
  try {
    const res = await getFeaturedProducts();
    allFeaturedProducts = res || [];
    renderFeaturedProducts();
  } catch (err) {
    console.error("Failed to load featured products", err);
  }
}
function renderFeaturedProducts() {
  const $container = $("#featuredProductList");
  const $viewMoreBtn = $("#viewMoreFeatured");
  $container.empty();
  const productsToShow = showAllFeatured ? allFeaturedProducts : allFeaturedProducts.slice(0, 3);
  productsToShow.forEach((item) => {
    if (!item.name || item.name === "string") return;
    const card = `
      <div class="d-flex align-items-center justify-content-start mb-3">
        <div class="rounded me-4" style="width: 100px; height: 100px">
          <img src="${item.imageUrl}" class="img-fluid rounded" />
        </div>

        <div>
          <h6 class="mb-2">${item.name}</h6>

          <div class="d-flex mb-2">
            ${'<i class="fa fa-star text-secondary"></i>'.repeat(item.rating || 4)}
          </div>

          <div class="d-flex mb-2">
            <h5 class="fw-bold me-2">\u20B9${item.discountPrice ?? item.price}</h5>
            ${item.discountPrice ? `<h5 class="text-danger text-decoration-line-through">\u20B9${item.price}</h5>` : ""}
          </div>
        </div>
      </div>
    `;
    $container.append(card);
  });
  if (allFeaturedProducts.length > 3) {
    $viewMoreBtn.show().text(showAllFeatured ? "View Less" : "View More");
  } else {
    $viewMoreBtn.hide();
  }
}
$(document).on("click", "#viewMoreFeatured", function() {
  showAllFeatured = !showAllFeatured;
  renderFeaturedProducts();
});
async function loadDashboardStats() {
  console.log("Attempting to load dashboard stats...");
  try {
    const res = await getDashboardStats();
    console.log("Raw dashboard response:", res);
    const stats = res.result || res;
    if (stats) {
      $("#satisfiedCustomers").text(stats.satisfiedCustomers ?? "0");
      $("#qualityOfService").text(stats.qualityOfService ?? "0%");
      $("#qualityCertificates").text(stats.qualityCertificates ?? "0");
      $("#availableProducts").text(stats.availableProducts ?? "0");
      console.log("Dashboard stats updated in UI:", stats);
    }
  } catch (error) {
    console.error("Failed to load dashboard stats:", error);
  }
}
$(document).ready(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get("category");
  const searchParam = urlParams.get("search");
  if ($("body").hasClass("shop-page") || window.location.pathname.includes("shop.html")) {
    const sliderMax = parseInt($("#rangeInput").attr("max") || "500", 10);
    $("#rangeInput").val(sliderMax);
    $("#amount").val(sliderMax + "+");
    if (searchParam && searchParam.trim()) {
      $("#shopSearchInput").val(searchParam.trim());
      $("#clearShopSearchBtn").removeClass("d-none");
      activeFilters.productName = searchParam.trim();
      applyFilters();
    } else if (categoryParam && categoryParam.trim()) {
      activeFilters.category = categoryParam.trim();
      applyFilters();
    } else {
      applyFilters();
    }
    loadCategories().then(() => {
      if (categoryParam && categoryParam.trim()) {
        const targetCategory = categoryParam.trim().toLowerCase();
        $("#categoryTabs a").removeClass("active");
        $("#categoryTabs a").each(function() {
          const cat = $(this).data("category");
          if (cat && cat.toString().trim().toLowerCase() === targetCategory) {
            $(this).addClass("active");
          }
        });
      }
    });
    loadFeaturedProducts();
  }
  loadNavbarCategories();
  loadHomeCategories();
  loadHomeFeaturedProducts();
  loadLatestProducts();
  loadDashboardStats();
  syncCartBadge();
});
$(document).on("click", ".add-to-cart-btn", async function(e) {
  e.preventDefault();
  const productId = $(this).data("id");
  const productName = $(this).data("name") || "Product";
  const productPrice = $(this).data("price");
  const productImg = $(this).data("img") || "";
  const token = sessionStorage.getItem("token");
  const $btn = $(this);
  const originalHtml = $btn.html();
  $btn.prop("disabled", true).html(
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Adding...'
  );
  try {
    if (token) {
      const res = await addToCartAPI(productId, 1, token);
      if (res.success) {
        showToast(
          `<strong>${productName}</strong> has been added to your cart.`,
          "success",
          "Added to Cart"
        );
        syncCartBadge();
      } else {
        throw new Error(res.message || "Failed to add to cart");
      }
    } else {
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const existing = guestCart.find((item) => item.id == productId);
      if (existing) {
        existing.quantity += 1;
      } else {
        guestCart.push({
          id: productId,
          name: productName,
          price: productPrice,
          imageUrl: productImg,
          quantity: 1
        });
      }
      localStorage.setItem("guestCart", JSON.stringify(guestCart));
      const totalItems = guestCart.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      $(".fa-shopping-bag").next("span").text(totalItems);
      showToast(
        `<strong>${productName}</strong> added to cart. <a href="cart.html" class="text-white fw-bold">View Cart</a>`,
        "success",
        "Added to Cart"
      );
    }
  } catch (err) {
    console.error("Add to Cart Error:", err);
    showToast(err.message || "Failed to add to cart", "error", "Cart Error");
  } finally {
    $btn.prop("disabled", false).html(originalHtml);
  }
});
export async function syncCartBadge() {
  const token = sessionStorage.getItem("token");
  if (!token) {
    const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
    const guestTotal = guestCart.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0
    );
    $(".fa-shopping-bag").next("span").text(guestTotal);
    $(".mobile-cart-badge, .cart-count-badge, .nav-cart-count").text(guestTotal);
    return;
  }
  try {
    const res = await getCartAPI(token);
    const cartItems = res.result?.items || res.result || [];
    const totalItems = Array.isArray(cartItems) ? cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
    $(".fa-shopping-bag").next("span").text(totalItems);
    $(".mobile-cart-badge, .cart-count-badge, .nav-cart-count").text(totalItems);
  } catch (err) {
    console.error("Failed to sync cart badge", err);
  }
}
function updateCartBadge() {
  const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  $(".fa-shopping-bag").next("span").text(totalItems);
  $(".mobile-cart-badge, .cart-count-badge, .nav-cart-count").text(totalItems);
}
import { sendContactMessage } from "./contact.js";
$(document).on("submit", "#contactForm", async function(e) {
  e.preventDefault();
  const name = $(this).find("[name='name']").val();
  const email = $(this).find("[name='email']").val();
  const message = $(this).find("[name='message']").val();
  const $submitBtn = $("#contactSubmitBtn");
  const $spinner = $submitBtn.find(".spinner-border");
  const $messageDiv = $("#contactMessage");
  $submitBtn.prop("disabled", true);
  $spinner.removeClass("d-none");
  $messageDiv.removeClass("text-success text-danger").text("");
  try {
    const res = await sendContactMessage({ name, email, message });
    console.log("res:::", res);
    $messageDiv.addClass("text-success").text("Message sent successfully! We will get back to you shortly.");
    setTimeout(() => {
      $messageDiv.text("").removeClass("text-success");
    }, 3e3);
    this.reset();
  } catch (err) {
    console.error("Contact Error:", err);
    $messageDiv.addClass("text-danger").text(err.message || "Failed to send message. Please try again.");
  } finally {
    $submitBtn.prop("disabled", false);
    $spinner.addClass("d-none");
  }
});
$(document).ready(function() {
  const currentLocation = window.location.pathname.split("/").pop() || "home.html";
  $(".navbar-nav .nav-link").each(function() {
    const $this = $(this);
    const href = $this.attr("href");
    const isProductsPage = currentLocation === "shop.html" || currentLocation === "product-detail.html";
    if (href === currentLocation || isProductsPage && $this.text().trim() === "Products") {
      $(".navbar-nav .nav-link").removeClass("active");
      $this.addClass("active");
    }
  });
});

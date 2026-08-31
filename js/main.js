import { loginUser, registerUser, getCurrentUser } from "./auth.js";
import {
  getAllCategories,
  getAllProducts,
  getFeaturedProducts,
  getProductsByFilter,
  getLatestProducts,
} from "./products.js";
import { addToCartAPI, getCartAPI } from "./api/cartService.js";
import { getDashboardStats } from "./api/dashboardService.js";
import { BASE_URL } from "./api/config.js";

// ✅ Custom Toast Function
export function showToast(message, type = "success", title = "") {
  const toastContainer = $("#toast-container");
  if (toastContainer.length === 0) {
    $("body").append(
      '<div id="toast-container" class="position-fixed bottom-0 end-0 p-3" style="z-index: 10000"></div>',
    );
  }

  const icons = {
    success: '<i class="fas fa-check-circle text-success me-2"></i>',
    error: '<i class="fas fa-exclamation-circle text-danger me-2"></i>',
    info: '<i class="fas fa-info-circle text-info me-2"></i>',
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

  // Progress bar animation
  setTimeout(() => {
    $toast.find(".progress-bar").css("width", "0%");
  }, 10);

  // Auto-dismiss
  setTimeout(() => {
    $toast.addClass("hiding");
    setTimeout(() => {
      $toast.remove();
    }, 400);
  }, 3000);
}

// ✅ Custom Premium Confirm Modal
export function showConfirm(title, message) {
  return new Promise((resolve) => {
    const modalId = "confirm-modal-" + Date.now();
    const modalHtml = `
      <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true" style="backdrop-filter: blur(6px); background: rgba(24, 25, 31, 0.3); z-index: 10050;">
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
      backdrop: 'static',
      keyboard: false
    });

    modalInstance.show();

    $modalEl.find(".confirm-btn").on("click", function () {
      modalInstance.hide();
      resolve(true);
    });

    $modalEl.on("hidden.bs.modal", function () {
      $modalEl.remove();
      resolve(false);
    });
  });
}

(function ($) {
  "use strict";

  /* ==========================
     Spinner
  ========================== */
  var spinner = function () {
    setTimeout(function () {
      if ($("#spinner").length > 0) {
        $("#spinner").removeClass("show");
      }
    }, 1);
  };
  spinner();

  /* ==========================
     Mobile Header Branding
  ========================== */
  function injectMobileBranding() {
    const $mobileLogo = $(".navbar-brand img.d-xl-none");
    if ($mobileLogo.length > 0 && $("#mobile-brand-title").length === 0) {
      const brandTextHtml = `
        <span id="mobile-brand-title" class="d-inline d-xl-none ms-2 fw-bold text-primary" style="font-family: 'Raleway', sans-serif; font-size: 1.25rem; letter-spacing: -0.5px; vertical-align: middle;">
          Skin Dekh<i class="fas fa-eye text-primary" style="font-size: 0.95em; margin-left: 1px; vertical-align: middle;"></i>
        </span>
      `;
      $mobileLogo.after(brandTextHtml);

      // Center the mobile brand container in the header bar
      if ($("#mobile-brand-center-style").length === 0) {
        $("head").append(`
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

  /* ==========================
     Inject Auth Modal if Missing
  ========================== */
  function ensureAuthModal() {
    if ($("#authModal").length === 0) {
      console.log("Injecting Auth Modal...");
      const modalHtml = `
        <div class="modal fade" id="authModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content rounded-3">
              <div class="modal-header">
                <h5 class="modal-title">Login / Sign Up</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <ul class="nav nav-pills mb-3 justify-content-center" id="authTab">
                  <li class="nav-item">
                    <button class="nav-link active" data-bs-toggle="pill" data-bs-target="#loginTab">Login</button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="pill" data-bs-target="#signupTab">Sign Up</button>
                  </li>
                </ul>
                <div class="tab-content">
                  <div class="tab-pane fade show active" id="loginTab">
                    <form id="loginForm">
                      <div class="mb-3">
                        <label>Email</label>
                        <input type="email" class="form-control" name="email" placeholder="Enter email" required />
                      </div>
                      <div class="mb-3">
                        <label>Password</label>
                        <input type="password" class="form-control" name="password" placeholder="Enter password" required />
                      </div>
                      <button class="btn btn-primary w-100 py-2" style="color: #fff">Login</button>
                    </form>
                  </div>
                  <div class="tab-pane fade" id="signupTab">
                    <form id="signupForm">
                      <div class="mb-3">
                        <label>First Name</label>
                        <input type="text" class="form-control" name="firstName" placeholder="First Name" required />
                      </div>
                      <div class="mb-3">
                        <label>Last Name</label>
                        <input type="text" class="form-control" name="lastName" placeholder="Last Name" required />
                      </div>
                      <div class="mb-3">
                        <label>Email</label>
                        <input type="email" class="form-control" name="email" placeholder="Email" required />
                      </div>
                      <div class="mb-3">
                        <label>Phone Number</label>
                        <input type="tel" class="form-control" name="phoneNumber" placeholder="Phone Number" pattern="[0-9]{10}" required />
                      </div>
                      <div class="mb-3">
                        <label>Password</label>
                        <input type="password" class="form-control" name="password" placeholder="Password" required />
                      </div>
                      <button class="btn btn-primary w-100 py-2" style="color: #fff">Sign Up</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      $("body").append(modalHtml);
    }
  }
  ensureAuthModal();

  /* ==========================
     Fixed Navbar
  ========================== */
  $(window).scroll(function () {
    if ($(window).width() < 992) {
      if ($(this).scrollTop() > 55) {
        $(".fixed-top").addClass("shadow");
      } else {
        $(".fixed-top").removeClass("shadow");
      }
    } else {
      if ($(this).scrollTop() > 55) {
        $(".fixed-top").addClass("shadow").css("top", -55);
      } else {
        $(".fixed-top").removeClass("shadow").css("top", 0);
      }
    }
  });

  /* ==========================
     Back to Top Button
  ========================== */
  $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
      $(".back-to-top").fadeIn("slow");
    } else {
      $(".back-to-top").fadeOut("slow");
    }
  });

  $(".back-to-top").click(function () {
    $("html, body").animate({ scrollTop: 0 }, 1500, "easeInOutExpo");
    return false;
  });

  /* ==========================
     Vegetable Carousel
  ========================== */
  $(".vegetable-carousel").owlCarousel({
    autoplay: true,
    smartSpeed: 1500,
    center: false,
    dots: true,
    loop: true,
    margin: 25,
    nav: true,
    navText: [
      '<i class="bi bi-arrow-left"></i>',
      '<i class="bi bi-arrow-right"></i>',
    ],
    responsive: {
      0: { items: 1 },
      576: { items: 1 },
      768: { items: 2 },
      992: { items: 3 },
      1200: { items: 4 },
    },
  });

  /* ==========================
     Modal Video
  ========================== */
  $(document).ready(function () {
    let videoSrc = "";

    $(".btn-play").click(function () {
      videoSrc = $(this).data("src");
    });

    $("#videoModal").on("shown.bs.modal", function () {
      $("#video").attr(
        "src",
        videoSrc + "?autoplay=1&modestbranding=1&showinfo=0",
      );
    });

    $("#videoModal").on("hide.bs.modal", function () {
      $("#video").attr("src", videoSrc);
    });
  });

  /* ==========================
     LOGIN FORM
  ========================== */
  $("#loginForm").on("submit", async function (e) {
    e.preventDefault();

    const email = $(this).find("[name='email']").val();
    const password = $(this).find("[name='password']").val();
    console.log("email---", email, password);

    try {
      const res = await loginUser(email, password);
      console.log("Login Success:", res);

      const token = res.result?.token?.accessToken || res.token;
      if (!token) throw new Error("Token not received");

      sessionStorage.setItem("token", token);
      console.log("Token:", token);

      try {
        const userRes = await getCurrentUser(token);
        console.log("Current User:", userRes);
        const userData = userRes.result || userRes;
        sessionStorage.setItem("user", JSON.stringify(userData));
      } catch (userErr) {
        console.error("Failed to fetch user data", userErr);
      }

      showToast("Login successful ✅", "success", "Welcome Back");
      $("#authModal").modal("hide");

      // Optional: Refresh if already on a secured page
      if (window.location.pathname.includes("User.html")) {
        window.location.reload();
      }
    } catch (err) {
      showToast(err.message || "Login failed", "error", "Login Error");
    }
  });

  /* ==========================
     SIGNUP FORM
  ========================== */
  $("#signupForm").on("submit", async function (e) {
    e.preventDefault();

    const payload = {
      firstName: $(this).find("[name='firstName']").val(),
      lastName: $(this).find("[name='lastName']").val(),
      email: $(this).find("[name='email']").val(),
      phoneNumber: $(this).find("[name='phoneNumber']").val(),
      password: $(this).find("[name='password']").val(),
    };
    console.log("payload---", payload);
    try {
      const res = await registerUser(payload);
      console.log("Signup Success:", res);

      const token = res.result?.token?.accessToken;
      const user = res.result?.user;

      if (token) {
        sessionStorage.setItem("token", token);
        if (user) {
          sessionStorage.setItem("user", JSON.stringify(user));
        }
        showToast("Signup & Login successful 🎉", "success", "Welcome");
      } else {
        showToast("Signup successful 🎉", "success", "Account Created");
      }

      $("#authModal").modal("hide");
      this.reset();

      if (typeof syncCartBadge === "function") {
        syncCartBadge();
      }

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.log(err, "err");
      showToast(err.message || "Signup failed", "error", "Signup Error");
    }
  });

  /* ==========================
     USER ICON CLICKS
  ========================== */
  $(document).on("click", ".user-icon-link", function (e) {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    if (token) {
      window.location.href = "User.html";
    } else {
      $("#authModal").modal("show");
    }
  });

  /* ==========================
     FOOTER ACCOUNT LINKS LOGIN CHECK
  ========================== */
  $(document).on("click", ".footer-item a", function (e) {
    const linkText = $(this).text().trim();
    const loginRequiredLinks = ["My Account", "Shop details", "Shopping Cart", "Order History"];

    if (loginRequiredLinks.includes(linkText)) {
      const token = sessionStorage.getItem("token");
      if (!token) {
        e.preventDefault();
        $("#authModal").modal("show");
      }
    }
  });
})(jQuery);

async function loadProducts(category = "") {
  try {
    const res = await getAllProducts(category);
    const products = res.result || [];
    const $productList = $("#productList");

    const isShopPage =
      $("body").hasClass("shop-page") ||
      window.location.pathname.includes("shop.html");

    if (!isShopPage) {
      products = products.slice(0, 8);
    }

    const colClass = isShopPage
      ? "col-md-6 col-lg-4 col-xl-4" // SHOP: 3 items/row on large and xl
      : "col-md-6 col-lg-3 col-xl-3"; // HOME: 4 items/row on large+

    $productList.empty();

    products.forEach((item) => {
      if (!item.name || item.name === "string") return;

      const relativeImgUrl = item.imageUrl || "";
      const fullImgUrl = relativeImgUrl.startsWith("http")
        ? relativeImgUrl
        : relativeImgUrl
          ? (BASE_URL + relativeImgUrl)
          : "img/product-default.jpg";

      const productCard = `
        <div class="${colClass}">
          <div class="rounded position-relative fruite-item h-100">
            <div class="fruite-img">
              <a href="product-detail.html?id=${item.id}">
                <img src="${fullImgUrl}" class="img-fluid w-100 rounded-top" onerror="this.onerror=null;this.src='img/product-sm-1.jpg'" />
              </a>
            </div>

            <div class="text-white bg-secondary px-3 py-1 rounded position-absolute"
                 style="top:10px; left:10px">
              ${item.category}
            </div>

            <div class="p-4 border border-secondary border-top-0 rounded-bottom">
              <h4><a href="product-detail.html?id=${item.id}" class="text-dark text-decoration-none">${item.name}</a></h4>
              <p class="text-muted small product-desc">${item.description}</p>

              <div class="d-flex justify-content-between align-items-center">
                <p class="text-dark fs-5 fw-bold mb-0">
                  ₹${item.discountPrice ?? item.price}
                </p>

                <div class="d-flex gap-2">
                  <a href="javascript:void(0)" 
                     class="btn border border-secondary rounded-pill px-2 text-primary add-to-cart-btn"
                     data-id="${item.id}"
                     data-name="${item.name}"
                     data-price="${item.discountPrice ?? item.price}"
                     data-img="${fullImgUrl}">
                    <i class="fa fa-shopping-bag me-2"></i>Add to cart
                  </a>

                  <a href="https://wa.me/919461972759?text=${encodeURIComponent(item.name)}"
                     target="_blank"
                     class="border-primary rounded-pill px-2 text-primary whatsapp-btn">
                    <i class="fab fa-whatsapp fs-2"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      $productList.append(productCard);
    });
  } catch (err) {
    console.error("Failed to load products", err);
  }
}



// $(document).ready(function () {
//   loadProducts(); // loads all products
// });

let allProducts = [];
let currentPage = 1;
const PRODUCTS_PER_PAGE = 12;

async function getFilterProducts(filters = {}) {
  try {
    const res = await getProductsByFilter(filters);
    allProducts = res.result || [];
    currentPage = 1;
    console.log("shop res::::", res);

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

  const isShopPage =
    $("body").hasClass("shop-page") ||
    window.location.pathname.includes("shop.html");

  const colClass = isShopPage
    ? "col-md-6 col-lg-4 col-xl-4" // SHOP: 3 items/row on large and xl
    : "col-md-6 col-lg-3 col-xl-3"; // HOME: 4 items/row on large+

  productsToShow.forEach((item) => {
    if (!item.name || item.name === "string") return;

    const relativeImgUrl = item.imageUrl || "";
    const fullImgUrl = relativeImgUrl.startsWith("http")
      ? relativeImgUrl
      : relativeImgUrl
        ? (BASE_URL + relativeImgUrl)
        : "img/product-default.jpg";

    const whatsappMessage = encodeURIComponent(
      `🧴 *${item.name}*\n💰 Price: ₹${item.discountPrice ?? item.price}`,
    );

    const productCard = `
      <div class="${colClass}">
        <div class="rounded position-relative fruite-item h-100">
          <div class="fruite-img">
            <a href="product-detail.html?id=${item.id}">
              <img src="${fullImgUrl}" class="img-fluid w-100 rounded-top" onerror="this.onerror=null;this.src='img/product-sm-1.jpg'" />
            </a>
          </div>

          <div class="text-white bg-secondary px-3 py-1 rounded position-absolute"
               style="top:10px; left:10px">
            ${item.category}
          </div>

          <div class="p-4 border border-secondary border-top-0 rounded-bottom">
            <h4><a href="product-detail.html?id=${item.id}" class="text-dark text-decoration-none">${item.name}</a></h4>
            <p class="text-muted small product-desc">${item.description}</p>

            <div class="d-flex justify-content-between align-items-center">
              <p class="text-dark fs-5 fw-bold mb-0">
                ₹${item.discountPrice ?? item.price}
              </p>

              <div class="d-flex gap-2">
                <a href="javascript:void(0)" 
                   class="btn border border-secondary rounded-pill px-2 text-primary add-to-cart-btn"
                   data-id="${item.id}"
                   data-name="${item.name}"
                   data-price="${item.discountPrice ?? item.price}"
                   data-img="${fullImgUrl}">
                  <i class="fa fa-shopping-bag me-2"></i>Add to cart
                </a>

                <a href="https://wa.me/919461972759?text=${whatsappMessage}"
                   target="_blank"
                   class="border-primary rounded-pill px-1 text-primary whatsapp-btn">
                  <i class="fab fa-whatsapp fs-2"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    $productList.append(productCard);
  });
}
function renderPagination() {
  const $pagination = $("#pagination");
  $pagination.empty();

  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);

  if (totalPages <= 1) return;

  // Previous
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

  // Next
  $pagination.append(`
    <a href="#" class="rounded ${currentPage === totalPages ? "disabled" : ""}" data-page="next">&raquo;</a>
  `);
}

$(document).on("click", "#pagination a", function (e) {
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
    300,
  );
});

// async function getFilterProducts(filters = {}) {
//   try {
//     const res = await getProductsByFilter(filters);
//     console.log("res---", res);
//     const products = res.result || [];
//     const $productList = $("#productList");

//     $productList.empty();

//     products.forEach((item) => {
//       if (!item.name || item.name === "string") return;

//       const whatsappMessage = encodeURIComponent(
//         `🧴 *${item.name}*\n\n💰 Price: ₹${item.discountPrice ?? item.price}`,
//       );

//       const productCard = `
//         <div class="col-12 col-md-6 col-lg-4">
//           <div class="rounded position-relative fruite-item h-100">

//             <div class="fruite-img">
//               <img src="${item.imageUrl}" class="img-fluid w-100 rounded-top" />
//             </div>

//             <div class="text-white bg-secondary px-3 py-1 rounded position-absolute"
//                  style="top:10px; left:10px">
//               ${item.category}
//             </div>

//             <div class="p-4 border border-secondary border-top-0 rounded-bottom">
//               <h4>${item.name}</h4>
//               <p class="text-muted small">${item.description}</p>

//               <div class="d-flex justify-content-between align-items-center">
//                 <p class="text-dark fs-5 fw-bold mb-0">
//                   ₹${item.discountPrice ?? item.price}
//                 </p>

//                 <div class="d-flex gap-2">
//                   <a class="btn border border-secondary rounded-pill px-2 text-primary">
//                     <i class="fa fa-shopping-bag me-2"></i>Add to cart
//                   </a>

//                   <a href="https://wa.me/919461972759?text=${whatsappMessage}"
//                      target="_blank"
//                      class="border-success rounded-pill px-1 text-success whatsapp-btn">
//                     <i class="fab fa-whatsapp"></i>
//                   </a>
//                 </div>
//               </div>
//             </div>

//           </div>
//         </div>
//       `;

//       $productList.append(productCard);
//     });
//   } catch (err) {
//     console.error("Filter load failed", err);
//   }
// }



// $("#searchInput").on("input", function () {
//   getFilterProducts({
//     productName: $(this).val().trim(),
//   });
// });
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
    getFilterProducts({
      productName: query,
    });
  }, 300);
}

// Shop search input
$(document).on("input", "#shopSearchInput", function () {
  handleSearch(this.value);
});

// Click handler for search icon inside shop input box
$(document).on("click", "#shopSearchIconBtn, #shopSearchIconBtn *", function (e) {
  e.preventDefault();
  clearTimeout(searchDebounceTimer);
  const query = $("#shopSearchInput").val()?.trim() || "";
  $("#categoryTabs a").removeClass("active");
  $("#categoryTabs a[data-category='']").addClass("active");
  if (query.length > 0) {
    $("#clearShopSearchBtn").removeClass("d-none");
    getFilterProducts({ productName: query });
  } else {
    $("#clearShopSearchBtn").addClass("d-none");
    getFilterProducts({});
  }
});

// Trigger search when pressing Enter key in shop search input
$(document).on("keypress", "#shopSearchInput", function (e) {
  if (e.which === 13) {
    e.preventDefault();
    clearTimeout(searchDebounceTimer);
    const query = $(this).val().trim();
    $("#categoryTabs a").removeClass("active");
    $("#categoryTabs a[data-category='']").addClass("active");
    if (query.length > 0) {
      $("#clearShopSearchBtn").removeClass("d-none");
      getFilterProducts({ productName: query });
    } else {
      $("#clearShopSearchBtn").addClass("d-none");
      getFilterProducts({});
    }
  }
});

// Clear shop search button
$(document).on("click", "#clearShopSearchBtn", function () {
  $("#shopSearchInput").val("").focus();
  $(this).addClass("d-none");
  $("#categoryTabs a").removeClass("active");
  $("#categoryTabs a[data-category='']").addClass("active");
  getFilterProducts({});
});

// Reset all filters button
$(document).on("click", "#clearAllFiltersBtn", function () {
  $("#shopSearchInput").val("");
  $("#clearShopSearchBtn").addClass("d-none");
  $("#categoryTabs a").removeClass("active");
  $("#categoryTabs a[data-category='']").addClass("active");
  getFilterProducts({});
});

// Toggle extra mobile filters (Categories, Price slider, Featured)
$(document).on("click", "#toggleMobileFiltersBtn", function () {
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

// Modal search handling (Input & Enter Key)
$(document).on("input", "#modalSearchInput", function () {
  const isShopPage = $("body").hasClass("shop-page") || window.location.pathname.includes("shop.html");
  if (isShopPage) {
    $("#shopSearchInput").val(this.value);
    handleSearch(this.value);
  }
});

$(document).on("keypress", "#modalSearchInput", function (e) {
  if (e.which === 13) {
    e.preventDefault();
    const query = $(this).val().trim();
    const isShopPage = $("body").hasClass("shop-page") || window.location.pathname.includes("shop.html");
    if (isShopPage) {
      $("#shopSearchInput").val(query);
      handleSearch(query);
      const searchModal = bootstrap.Modal.getInstance($("#searchModal")[0]);
      if (searchModal) searchModal.hide();
    } else if (query) {
      window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
    }
  }
});

$(document).on("click", "#search-icon-1", function () {
  const modalVal = $("#modalSearchInput").val()?.trim();
  const shopVal = $("#shopSearchInput").val()?.trim();
  const query = modalVal || shopVal || "";
  const isShopPage = $("body").hasClass("shop-page") || window.location.pathname.includes("shop.html");

  if (isShopPage) {
    if (modalVal) {
      $("#shopSearchInput").val(modalVal);
      handleSearch(modalVal);
      const searchModal = bootstrap.Modal.getInstance($("#searchModal")[0]);
      if (searchModal) searchModal.hide();
    } else {
      handleSearch(query);
    }
  } else if (query) {
    window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
  }
});

$("#rangeInput").on("input", function () {
  getFilterProducts({
    priceUnder: this.value,
  });
});

/* ==========================
     Custom Premium Sorting Dropdown
  ========================== */
$(document).on("click", "#sortDropdownBtn", function (e) {
  e.stopPropagation();
  $(".premium-sort-container").toggleClass("active");
});

$(document).on("click", ".sort-option", function () {
  const value = $(this).data("value");
  const text = $(this).text().trim();

  // UI Updates
  $("#currentSortText").text(text);
  $(".sort-option").removeClass("active");
  $(this).addClass("active");
  $(".premium-sort-container").removeClass("active");

  // Sync Hidden Native Select & Trigger Logic
  $("#fruits").val(value).trigger("change");
});

$(document).on("click", function (e) {
  if (!$(e.target).closest(".premium-sort-container").length) {
    $(".premium-sort-container").removeClass("active");
  }
});

$("#fruits").on("change", function () {
  const value = $(this).val();

  getFilterProducts({
    priceSort: value === "low" ? 1 : value === "high" ? 2 : "",
  });
});



/**
 * 🧴 Custom Icon Mapping for SkinDekho Categories
 */
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
    Tablets: "fa-pills",
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

    // ✅ All category
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

// ✅ Cycles through pastel colors matching the user reference
const pastelBackgrounds = [
  "#ffe8d6", // Peach
  "#e8e8ff", // Lavender
  "#d8f3dc", // Mint Green
  "#ffe5ec", // Soft Pink
  "#d8f3f3", // Light Aqua
  "#ffebd6", // Light Orange
  "#f0e6ff", // Light Purple
  "#ffe5d9"  // Soft Coral
];

async function loadNavbarCategories() {
  try {
    const res = await getAllCategories();
    const categories = res.result || res || [];
    const $dropdowns = $(".navbar-categories-dropdown");
    if ($dropdowns.length === 0) return;

    $dropdowns.each(function () {
      const $dropdown = $(this);
      // Keep "All Products" link, remove other static dropdown links
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
      $container.html('<div class="col-12 text-center py-4 text-muted">No categories found.</div>');
      return;
    }

    categories.forEach((item, index) => {
      if (!item.category || item.category === "string") return;

      const bgColor = pastelBackgrounds[index % pastelBackgrounds.length];
      const relativeImgUrl = item.imageUrl || "";
      const fullImgUrl = relativeImgUrl.startsWith("http")
        ? relativeImgUrl
        : relativeImgUrl
          ? (BASE_URL + relativeImgUrl)
          : "img/product-default.jpg"; // fallback

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

    // Attach horizontal scroll controls
    $(document).off("click", ".category-next-btn").on("click", ".category-next-btn", function () {
      const $wrapper = $(".category-carousel-wrapper");
      const scrollAmount = $wrapper.width() * 0.75;
      $wrapper.animate({ scrollLeft: $wrapper.scrollLeft() + scrollAmount }, 400);
    });

    $(document).off("click", ".category-prev-btn").on("click", ".category-prev-btn", function () {
      const $wrapper = $(".category-carousel-wrapper");
      const scrollAmount = $wrapper.width() * 0.75;
      $wrapper.animate({ scrollLeft: $wrapper.scrollLeft() - scrollAmount }, 400);
    });

  } catch (err) {
    console.error("Failed to load home page categories", err);
    $container.html('<div class="col-12 text-center py-4 text-danger">Failed to load categories.</div>');
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
      $container.html('<div class="col-12 text-center py-4 text-muted">No latest products found.</div>');
      return;
    }

    products.forEach((item) => {
      if (!item.name || item.name === "string") return;

      const relativeImgUrl = item.imageUrl || "";
      const fullImgUrl = relativeImgUrl.startsWith("http")
        ? relativeImgUrl
        : relativeImgUrl
          ? (BASE_URL + relativeImgUrl)
          : "img/product-default.jpg"; // fallback

      const productCard = `
        <div class="latest-product-card">
          <div class="rounded position-relative fruite-item h-100">
            <div class="fruite-img">
              <a href="product-detail.html?id=${item.id}">
                <img src="${fullImgUrl}" class="img-fluid w-100 rounded-top" onerror="this.onerror=null;this.src='img/product-sm-1.jpg'" />
              </a>
            </div>

            <div class="text-white bg-secondary px-3 py-1 rounded position-absolute"
                 style="top:10px; left:10px">
              ${item.category || "skincare"}
            </div>

            <div class="p-4 border border-secondary border-top-0 rounded-bottom">
              <h4><a href="product-detail.html?id=${item.id}" class="text-dark text-decoration-none">${item.name}</a></h4>
              <p class="text-muted small product-desc">${item.description || ""}</p>

              <div class="d-flex justify-content-between align-items-center">
                <p class="text-dark fs-5 fw-bold mb-0">
                  ₹${item.discountPrice ?? item.price}
                </p>

                <div class="d-flex gap-2">
                  <a href="javascript:void(0)" 
                     class="btn border border-secondary rounded-pill px-2 text-primary add-to-cart-btn"
                     data-id="${item.id}"
                     data-name="${item.name}"
                     data-price="${item.discountPrice ?? item.price}"
                     data-img="${fullImgUrl}">
                    <i class="fa fa-shopping-bag me-2"></i>Add to cart
                  </a>

                  <a href="https://wa.me/919461972759?text=${encodeURIComponent(item.name)}"
                     target="_blank"
                     class="border-primary rounded-pill px-2 text-primary whatsapp-btn">
                    <i class="fab fa-whatsapp fs-2"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      $container.append(productCard);
    });

    // Attach horizontal scroll controls
    $(document).off("click", ".latest-next-btn").on("click", ".latest-next-btn", function () {
      const $wrapper = $(".latest-carousel-wrapper");
      const scrollAmount = $wrapper.width() * 0.75;
      $wrapper.animate({ scrollLeft: $wrapper.scrollLeft() + scrollAmount }, 400);
    });

    $(document).off("click", ".latest-prev-btn").on("click", ".latest-prev-btn", function () {
      const $wrapper = $(".latest-carousel-wrapper");
      const scrollAmount = $wrapper.width() * 0.75;
      $wrapper.animate({ scrollLeft: $wrapper.scrollLeft() - scrollAmount }, 400);
    });

  } catch (err) {
    console.error("Failed to load latest products", err);
    $container.html('<div class="col-12 text-center py-4 text-danger">Failed to load latest products.</div>');
  }
}

$(document).on("click", "#categoryTabs a", function (e) {
  const isShopPage =
    $("body").hasClass("shop-page") ||
    window.location.pathname.includes("shop.html");

  if (!isShopPage) {
    // On home page, allow the browser to follow the href link
    return;
  }

  e.preventDefault();

  $("#categoryTabs a").removeClass("active");
  $(this).addClass("active");

  const category = $(this).data("category") || "";

  getFilterProducts({ category });
});

// $(document).ready(function () {
//   loadCategories(); // 👈 categories from API
//   getFilterProducts(); // 👈 all products
// });
async function loadHomeFeaturedProducts() {
  const $container = $("#featuredProductsHomeList");
  if ($container.length === 0) return;

  try {
    const res = await getFeaturedProducts();
    const products = res.result || res || [];
    $container.empty();

    if (products.length === 0) {
      $container.html('<div class="col-12 text-center py-4 text-muted">No featured products found.</div>');
      return;
    }

    products.forEach((item) => {
      if (!item.name || item.name === "string") return;

      const relativeImgUrl = item.imageUrl || "";
      const fullImgUrl = relativeImgUrl.startsWith("http")
        ? relativeImgUrl
        : relativeImgUrl
          ? (BASE_URL + relativeImgUrl)
          : "img/product-default.jpg"; // fallback

      const productCard = `
        <div class="featured-product-card">
          <div class="rounded position-relative fruite-item h-100">
            <div class="fruite-img">
              <a href="product-detail.html?id=${item.id}">
                <img src="${fullImgUrl}" class="img-fluid w-100 rounded-top" onerror="this.onerror=null;this.src='img/product-sm-1.jpg'" />
              </a>
            </div>

            <div class="text-white bg-secondary px-3 py-1 rounded position-absolute"
                 style="top:10px; left:10px">
              ${item.category || "skincare"}
            </div>

            <div class="p-4 border border-secondary border-top-0 rounded-bottom">
              <h4><a href="product-detail.html?id=${item.id}" class="text-dark text-decoration-none">${item.name}</a></h4>
              <p class="text-muted small product-desc">${item.description || ""}</p>

              <div class="d-flex justify-content-between align-items-center">
                <p class="text-dark fs-5 fw-bold mb-0">
                  ₹${item.discountPrice ?? item.price}
                </p>

                <div class="d-flex gap-2">
                  <a href="javascript:void(0)" 
                     class="btn border border-secondary rounded-pill px-2 text-primary add-to-cart-btn"
                     data-id="${item.id}"
                     data-name="${item.name}"
                     data-price="${item.discountPrice ?? item.price}"
                     data-img="${fullImgUrl}">
                    <i class="fa fa-shopping-bag me-2"></i>Add to cart
                  </a>

                  <a href="https://wa.me/919461972759?text=${encodeURIComponent(item.name)}"
                     target="_blank"
                     class="border-primary rounded-pill px-2 text-primary whatsapp-btn">
                    <i class="fab fa-whatsapp fs-2"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      $container.append(productCard);
    });

    // Attach horizontal scroll controls
    $(document).off("click", ".featured-next-btn").on("click", ".featured-next-btn", function () {
      const $wrapper = $(".featured-carousel-wrapper");
      const scrollAmount = $wrapper.width() * 0.75;
      $wrapper.animate({ scrollLeft: $wrapper.scrollLeft() + scrollAmount }, 400);
    });

    $(document).off("click", ".featured-prev-btn").on("click", ".featured-prev-btn", function () {
      const $wrapper = $(".featured-carousel-wrapper");
      const scrollAmount = $wrapper.width() * 0.75;
      $wrapper.animate({ scrollLeft: $wrapper.scrollLeft() - scrollAmount }, 400);
    });

  } catch (err) {
    console.error("Failed to load home page featured products", err);
    $container.html('<div class="col-12 text-center py-4 text-danger">Failed to load featured products.</div>');
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

  const productsToShow = showAllFeatured
    ? allFeaturedProducts
    : allFeaturedProducts.slice(0, 3);

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
            <h5 class="fw-bold me-2">₹${item.discountPrice ?? item.price}</h5>
            ${item.discountPrice
        ? `<h5 class="text-danger text-decoration-line-through">₹${item.price}</h5>`
        : ""
      }
          </div>
        </div>
      </div>
    `;

    $container.append(card);
  });

  // ✅ Show / hide View More button
  if (allFeaturedProducts.length > 3) {
    $viewMoreBtn.show().text(showAllFeatured ? "View Less" : "View More");
  } else {
    $viewMoreBtn.hide();
  }
}

$(document).on("click", "#viewMoreFeatured", function () {
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

$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get("category");
  const searchParam = urlParams.get("search");

  if (
    $("body").hasClass("shop-page") ||
    window.location.pathname.includes("shop.html")
  ) {
    // 1. Trigger product fetching immediately (with search query or category filter)
    if (searchParam && searchParam.trim()) {
      $("#shopSearchInput").val(searchParam.trim());
      $("#clearShopSearchBtn").removeClass("d-none");
      getFilterProducts({ productName: searchParam.trim() });
    } else if (categoryParam && categoryParam.trim()) {
      getFilterProducts({ category: categoryParam.trim() });
    } else {
      getFilterProducts();
    }

    // 2. Load categories list asynchronously and highlight active tab
    loadCategories().then(() => {
      if (categoryParam && categoryParam.trim()) {
        const targetCategory = categoryParam.trim().toLowerCase();
        $("#categoryTabs a").removeClass("active");
        $("#categoryTabs a").each(function () {
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

/* ==========================
   Add to Cart Logic (API Version)
 ========================== */
$(document).on("click", ".add-to-cart-btn", async function (e) {
  e.preventDefault();

  const productId = $(this).data("id");
  const token = sessionStorage.getItem("token");

  if (!token) {
    showToast(
      "Please login to add items to cart",
      "error",
      "Authentication Required",
    );
    $("#authModal").modal("show");
    return;
  }

  const $btn = $(this);
  const originalHtml = $btn.html();
  $btn
    .prop("disabled", true)
    .html(
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Adding...',
    );

  try {
    const res = await addToCartAPI(productId, 1, token);
    console.log("Add to cart success:", res);

    if (res.success) {
      const productName = $btn.data("name") || "Product";
      showToast(
        `<strong>${productName}</strong> has been added to your cart.`,
        "success",
        "Added to Cart",
      );
      syncCartBadge();
    } else {
      throw new Error(res.message || "Failed to add to cart");
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
    $(".fa-shopping-bag").next("span").text("0");
    return;
  }

  try {
    const res = await getCartAPI(token);
    const cartItems = res.result?.items || res.result || [];
    const totalItems = Array.isArray(cartItems)
      ? cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
      : 0;

    $(".fa-shopping-bag").next("span").text(totalItems);
  } catch (err) {
    console.error("Failed to sync cart badge", err);
  }
}

function updateCartBadge() {
  // Legacy function for session storage - kept for compatibility but syncCartBadge is preferred now
  const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  $(".fa-shopping-bag").next("span").text(totalItems);
}

/* ==========================
   Contact Form Logic
========================== */
import { sendContactMessage } from "./contact.js";

$(document).on("submit", "#contactForm", async function (e) {
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

    $messageDiv
      .addClass("text-success")
      .text("Message sent successfully! We will get back to you shortly.");
    setTimeout(() => {
      $messageDiv.text("").removeClass("text-success");
    }, 3000);
    this.reset();
  } catch (err) {
    console.error("Contact Error:", err);
    $messageDiv
      .addClass("text-danger")
      .text(err.message || "Failed to send message. Please try again.");
  } finally {
    $submitBtn.prop("disabled", false);
    $spinner.addClass("d-none");
  }
});

/* ==========================
   Active Navbar Link Logic
========================== */
$(document).ready(function () {
  const currentLocation =
    window.location.pathname.split("/").pop() || "home.html";
  $(".navbar-nav .nav-link").each(function () {
    const $this = $(this);
    const href = $this.attr("href");
    const isProductsPage =
      currentLocation === "shop.html" ||
      currentLocation === "product-detail.html";
    if (
      href === currentLocation ||
      (isProductsPage && $this.text().trim() === "Products")
    ) {
      $(".navbar-nav .nav-link").removeClass("active");
      $this.addClass("active");
    }
  });
});

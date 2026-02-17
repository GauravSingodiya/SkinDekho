import { loginUser, registerUser } from "./auth.js";
import {
  getAllCategories,
  getAllProducts,
  getFeaturedProducts,
  getProductsByFilter,
} from "./products.js";

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

      alert("Login successful ✅");
      $("#authModal").modal("hide");

      sessionStorage.setItem("token", res.token);
      // sessionStorage.setItem("user", JSON.stringify(res.user));
      const token = sessionStorage.getItem("token");
      console.log("Token:", token);
    } catch (err) {
      alert(err.message || "Login failed");
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

      alert("Signup successful 🎉");
      $("#authModal").modal("hide");
      this.reset();
    } catch (err) {
      console.log(err, "err");
      alert(err.message || "Signup failed");
    }
  });
})(jQuery);

async function loadProducts(category = "") {
  try {
    const res = await getAllProducts(category);
    const products = res.result || [];
    const $productList = $("#productList");

    const isShopPage = $("body").hasClass("shop-page");

    if (!isShopPage) {
      products = products.slice(0, 10);
    }

    const colClass = isShopPage
      ? "col-md-6 col-lg-4" // SHOP
      : "col-md-6 col-lg-3"; // HOME

    $productList.empty();

    products.forEach((item) => {
      if (!item.name || item.name === "string") return;

      const productCard = `
        <div class="${colClass}">
          <div class="rounded position-relative fruite-item h-100">
            <div class="fruite-img">
              <img src="${item.imageUrl}" class="img-fluid w-100 rounded-top" />
            </div>

            <div class="text-white bg-secondary px-3 py-1 rounded position-absolute"
                 style="top:10px; left:10px">
              ${item.category}
            </div>

            <div class="p-4 border border-secondary border-top-0 rounded-bottom">
              <h4>${item.name}</h4>
              <p class="text-muted small">${item.description}</p>

              <div class="d-flex justify-content-between align-items-center">
                <p class="text-dark fs-5 fw-bold mb-0">
                  ₹${item.discountPrice ?? item.price}
                </p>

                <div class="d-flex gap-2">
                  <a class="btn border border-secondary rounded-pill px-2 text-primary">
                    <i class="fa fa-shopping-bag me-2"></i>Add to cart
                  </a>

                  <a href="https://wa.me/?text=${encodeURIComponent(item.name)}"
                     target="_blank"
                     class="border-success rounded-pill px-2 text-success">
                    <i class="fab fa-whatsapp fs-4"></i>
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

$(document).on("click", "#categoryTabs a", function () {
  $("#categoryTabs a").removeClass("active");
  $(this).addClass("active");

  const category = $(this).data("category") || "";
  loadProducts(category);
});

$(document).ready(function () {
  loadProducts(); // loads all products
});

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

  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const end = start + PRODUCTS_PER_PAGE;

  const productsToShow = allProducts.slice(start, end);

  productsToShow.forEach((item) => {
    if (!item.name || item.name === "string") return;

    const whatsappMessage = encodeURIComponent(
      `🧴 *${item.name}*\n💰 Price: ₹${item.discountPrice ?? item.price}`,
    );

    const productCard = `
      <div class="col-md-6 col-lg-4">
        <div class="rounded position-relative fruite-item h-100">
          <div class="fruite-img">
            <img src="${item.imageUrl}" class="img-fluid w-100 rounded-top" />
          </div>

          <div class="text-white bg-secondary px-3 py-1 rounded position-absolute"
               style="top:10px; left:10px">
            ${item.category}
          </div>

          <div class="p-4 border border-secondary border-top-0 rounded-bottom">
            <h4>${item.name}</h4>
            <p class="text-muted small">${item.description}</p>

            <div class="d-flex justify-content-between align-items-center">
              <p class="text-dark fs-5 fw-bold mb-0">
                ₹${item.discountPrice ?? item.price}
              </p>

              <div class="d-flex gap-2">
                <a class="btn border border-secondary rounded-pill px-2 text-primary">
                  <i class="fa fa-shopping-bag me-2"></i>Add to cart
                </a>

                <a href="https://wa.me/?text=${whatsappMessage}"
                   target="_blank"
                   class="border-success rounded-pill px-1 text-success">
                  <i class="fab fa-whatsapp"></i>
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

//                   <a href="https://wa.me/?text=${whatsappMessage}"
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

$(document).on("click", "#categoryTabs a", function () {
  const category = $(this).data("category") || "";

  getFilterProducts({
    category,
  });
});

// $("#searchInput").on("input", function () {
//   getFilterProducts({
//     productName: $(this).val().trim(),
//   });
// });
function handleSearch(value) {
  getFilterProducts({
    productName: value.trim(),
  });
}

// Shop search
$(document).on("input", "#shopSearchInput", function () {
  handleSearch(this.value);
});

// Modal search
$(document).on("input", "#modalSearchInput", function () {
  handleSearch(this.value);
});

$("#rangeInput").on("input", function () {
  getFilterProducts({
    priceUnder: this.value,
  });
});

$("#fruits").on("change", function () {
  const value = $(this).val();

  getFilterProducts({
    priceSort: value === "low" ? 1 : value === "high" ? 2 : "",
  });
});

$(document).ready(function () {
  getFilterProducts(); // no filters
});

async function loadCategories() {
  try {
    const res = await getAllCategories();
    const categories = res.result || res || [];
    console.log("categories---", categories);
    const $categoryTabs = $("#categoryTabs");
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

      $categoryTabs.append(`
        <li>
          <div class="d-flex justify-content-between fruite-name">
            <a href="#" data-category="${item.category}">
              <i class="fas ${item.categoryIcon} me-2"></i>
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

$(document).on("click", "#categoryTabs a", function (e) {
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
            ${
              item.discountPrice
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

$(document).ready(function () {
  if ($("body").hasClass("shop-page")) {
    loadCategories();
    getFilterProducts();
    loadFeaturedProducts();
  }
});

import { getProductById, getAllProducts } from "./products.js";
import { addToCartAPI } from "./api/cartService.js";
import { showToast, syncCartBadge } from "./main.js";
import { BASE_URL } from "./api/config.js";

$(document).ready(async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    window.location.href = "home.html";
    return;
  }

  // Spinner logic
  const hideSpinner = () => {
    if ($("#spinner").length > 0) {
      $("#spinner").removeClass("show");
    }
  };

  try {
    const product = await getProductById(productId);
    if (!product) {
      $("#product-name").text("Product Not Found");
      $("#product-description").text(
        "The product you are looking for does not exist or has been removed.",
      );
      hideSpinner();
      return;
    }

    // Populate UI
    renderProductDetails(product);
    loadRelatedProducts(product.category, product.id);

    // Sync cart on load
    syncCartBadge();
  } catch (err) {
    console.error("Failed to load product details", err);
    $("#product-name").text("Error Loading Product");
    showToast("Failed to load product details", "error");
  } finally {
    hideSpinner();
  }

  // Quantity control
  let quantity = 1;
  $("#btn-plus").on("click", function () {
    quantity++;
    $("#quantity").val(quantity);
  });

  $("#btn-minus").on("click", function () {
    if (quantity > 1) {
      quantity--;
      $("#quantity").val(quantity);
    }
  });

  // Add to cart on detail page
  $("#add-to-cart-detail").on("click", async function () {
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
    const originalText = $btn.text();
    $btn.prop("disabled", true).text("Adding...");

    try {
      const res = await addToCartAPI(
        productId,
        parseInt($("#quantity").val()),
        token,
      );
      if (res.success) {
        showToast(
          `<strong>${$("#product-name").text()}</strong> added to cart!`,
          "success",
        );
        syncCartBadge();
      } else {
        throw new Error(res.message || "Failed to add to cart");
      }
    } catch (err) {
      showToast(err.message || "Failed to add to cart", "error");
    } finally {
      $btn.prop("disabled", false).text(originalText);
    }
  });

  // Buy Now on detail page
  $("#buy-now-detail").on("click", async function () {
    const token = sessionStorage.getItem("token");
    if (!token) {
      showToast(
        "Please login to buy items",
        "error",
        "Authentication Required",
      );
      $("#authModal").modal("show");
      return;
    }

    const $btn = $(this);
    const originalText = $btn.text();
    $btn.prop("disabled", true).text("Processing...");

    try {
      const res = await addToCartAPI(
        productId,
        parseInt($("#quantity").val()),
        token,
      );
      if (res.success) {
        window.location.href = "chackout.html";
      } else {
        throw new Error(res.message || "Failed to add to cart");
      }
    } catch (err) {
      showToast(err.message || "Failed to add to cart", "error");
      $btn.prop("disabled", false).text(originalText);
    }
  });



  // Accordion slideToggle toggle logic
  $(document).on("click", ".custom-accordian-title", function () {
    const $content = $(this).next(".collapsible-content");
    const $svg = $(this).find("svg");

    if ($content.length > 0) {
      $content.slideToggle(200);

      setTimeout(() => {
        const isExpanded = $content.is(":visible");
        if (isExpanded) {
          $svg.css("transform", "rotate(180deg)");
        } else {
          $svg.css("transform", "rotate(0deg)");
        }
      }, 210);
    }
  });

  // Add to cart for related products grid
  $(document).on("click", ".add-to-cart-btn-related", async function () {
    const token = sessionStorage.getItem("token");
    if (!token) {
      showToast("Please login to add items to cart", "error", "Authentication Required");
      $("#authModal").modal("show");
      return;
    }

    const productId = $(this).data("id");
    const productName = $(this).data("name");
    const $btn = $(this);
    $btn.prop("disabled", true);

    try {
      const res = await addToCartAPI(productId, 1, token);
      if (res.success) {
        showToast(`<strong>${productName}</strong> added to cart!`, "success");
        syncCartBadge();
      } else {
        throw new Error(res.message || "Failed to add to cart");
      }
    } catch (err) {
      showToast(err.message || "Failed to add to cart", "error");
    } finally {
      $btn.prop("disabled", false);
    }
  });

  // Handle zoom-trigger click to trigger custom premium zoom modal
  $(document).on("click", "#zoom-trigger", function () {
    const imgSrc = $("#product-img").attr("src");
    if (!imgSrc || imgSrc.includes("placeholder.png") || imgSrc.includes("product-default.jpg")) return;

    const modalId = "zoom-modal-" + Date.now();
    const modalHtml = `
      <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true" style="backdrop-filter: blur(8px); background: rgba(10, 11, 15, 0.85); z-index: 10500;">
        <div class="modal-dialog modal-dialog-centered modal-lg" style="max-width: 90%; width: auto;">
          <div class="modal-content border-0 bg-transparent shadow-none position-relative">
            <button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-3" data-bs-dismiss="modal" aria-label="Close" style="z-index: 10510; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));"></button>
            <div class="modal-body p-0 text-center d-flex justify-content-center align-items-center">
              <img src="${imgSrc}" class="img-fluid rounded shadow-lg" style="max-height: 85vh; object-fit: contain; border: 4px solid #fff; animation: zoomIn 0.3s ease;" />
            </div>
          </div>
        </div>
      </div>
    `;
    $("body").append(modalHtml);

    if ($("#zoom-animation-style").length === 0) {
      $("head").append(`
        <style id="zoom-animation-style">
          @keyframes zoomIn {
            from { opacity: 0; transform: scale3d(0.3, 0.3, 0.3); }
            50% { opacity: 1; }
          }
        </style>
      `);
    }

    const $modalEl = $(`#${modalId}`);
    const modalInstance = new bootstrap.Modal($modalEl[0]);
    modalInstance.show();
    $modalEl.on("hidden.bs.modal", function () {
      $modalEl.remove();
    });
  });
});

function renderProductDetails(product) {
  $("#product-name").text(product.name);
  if (product.category) {
    $("#breadcrumb-category")
      .html(`<a href="shop.html?category=${encodeURIComponent(product.category)}" style="color: #969bab; text-decoration: none;">${product.category}</a>`);
  } else {
    $("#breadcrumb-category").text("Product");
  }

  const relativeImgUrl = product.imageUrl || "";
  const fullImgUrl = relativeImgUrl.startsWith("http")
    ? relativeImgUrl
    : relativeImgUrl
      ? BASE_URL + relativeImgUrl
      : "img/product-default.jpg";
  $("#product-img").attr("src", fullImgUrl);
  $("#product-img-zoom").attr("href", fullImgUrl);

  // Populate thumbnails
  const $thumbnails = $("#product-thumbnails");
  $thumbnails.empty();

  if (product.images && product.images.length > 0) {
    const sortedImages = [...product.images].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    sortedImages.forEach((imgObj) => {
      const imgUrl = imgObj.imageUrl;
      const fullThumbUrl = imgUrl.startsWith("http")
        ? imgUrl
        : BASE_URL + imgUrl;

      const isCurrentActive = imgUrl === relativeImgUrl;
      const thumbHtml = `
        <div class="thumb-item ${isCurrentActive ? "active" : ""}" style="width: 70px; height: 70px; cursor: pointer; border: 2px solid ${isCurrentActive ? '#81c408' : '#ddd'}; border-radius: 6px; overflow: hidden; transition: all 0.2s; flex-shrink: 0;">
          <img src="${fullThumbUrl}" class="w-100 h-100" style="object-fit: cover;" onerror="this.onerror=null;this.src='img/product-sm-1.jpg'">
        </div>
      `;

      const $thumb = $(thumbHtml);
      $thumb.on("click", function () {
        $(".thumb-item").css("border-color", "#ddd");
        $(this).css("border-color", "#81c408");

        $("#product-img").fadeOut(150, function () {
          $(this).attr("src", fullThumbUrl).fadeIn(150);
          $("#product-img-zoom").attr("href", fullThumbUrl);
        });
      });

      $thumbnails.append($thumb);
    });
    $thumbnails.show();
  } else {
    $thumbnails.hide();
  }

  // Description content
  const description = product.description || "No description available.";

  const price = product.discountPrice ?? product.price;
  $("#product-price").text(`₹${price}`);

  if (product.discountPrice && product.discountPrice < product.price) {
    $("#product-old-price").text(`₹${product.price}`).show();
    const savePercent = Math.round(((product.price - product.discountPrice) / product.price) * 100);
    $("#product-save-badge").text(`Save ${savePercent}%`).removeClass("d-none").show();
  } else {
    $("#product-old-price").hide();
    $("#product-save-badge").addClass("d-none").hide();
  }

  // Stock status
  const isOutOfStock = product.stockQuantity <= 0;
  const $stock = $("#product-stock");
  if (isOutOfStock) {
    $stock.text("Out of Stock").addClass("out-of-stock");
    $("#buy-now-detail, #add-to-cart-detail").prop("disabled", true);
  } else {
    $stock.text("In Stock").removeClass("out-of-stock");
    $("#buy-now-detail, #add-to-cart-detail").prop("disabled", false);
  }

  // Category Metadata
  $("#product-category-meta").text(product.category || "");

  // Social Share links
  const currentUrl = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(
    `Check out this product on SkinDekho: ${product.name}`,
  );
  $("#share-fb").attr(
    "href",
    `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`,
  );
  $("#share-tw").attr(
    "href",
    `https://twitter.com/intent/tweet?url=${currentUrl}&text=${shareText}`,
  );
  $("#share-pin").attr(
    "href",
    `https://pinterest.com/pin/create/button/?url=${currentUrl}&description=${shareText}`,
  );
  $("#share-ln").attr(
    "href",
    `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`,
  );

  // Set Product Description accordion text
  $("#accordion-desc-text").text(description);

  // Set Key Benefits accordion points
  const $benefitsList = $("#accordion-benefits-list");
  $benefitsList.empty();

  let rawPoints = description.split(/\r?\n/).map((p) => p.trim()).filter(Boolean);
  if (rawPoints.length === 1 && rawPoints[0].includes(".")) {
    rawPoints = rawPoints[0].split(/\.\s+/).map((p) => p.trim()).filter(Boolean);
  }

  rawPoints.forEach((pt) => {
    if (pt) {
      let text = pt;
      if (text.endsWith(".")) text = text.slice(0, -1);
      $benefitsList.append(`<li>${text}</li>`);
    }
  });

  if ($benefitsList.children().length === 0) {
    $benefitsList.append("<li>Provides general skincare and hydration.</li>");
  }

  // Update WhatsApp link
  const whatsappMessage = encodeURIComponent(
    `Hi SkinDekho! I'm interested in *${product.name}* (Price: ₹${price}). Can I get more details?\nLink: ${window.location.href}`,
  );
  $("#whatsapp-inquiry").attr(
    "href",
    `https://wa.me/919461972759?text=${whatsappMessage}`,
  );
}

async function loadRelatedProducts(category, currentId) {
  try {
    const res = await getAllProducts(category);
    const products = res.result || res || [];
    const related = products.filter((p) => p.id != currentId);

    // 1. Populate "Best Used With" (Side column) - 8 items max
    const $sideContainer = $("#related-products");
    $sideContainer.empty();
    const sideRelated = related.slice(0, 8);

    if (sideRelated.length === 0) {
      $sideContainer.append(
        '<div class="col-12 text-center text-muted">No recommendations found.</div>'
      );
    } else {
      sideRelated.forEach((item) => {
        const relativeImgUrl = item.imageUrl || "";
        const fullImgUrl = relativeImgUrl.startsWith("http")
          ? relativeImgUrl
          : relativeImgUrl
            ? BASE_URL + relativeImgUrl
            : "img/product-default.jpg";

        const whatsappMessage = encodeURIComponent(
          `Hi SkinDekho! I'm interested in *${item.name}* (Price: ₹${item.discountPrice ?? item.price}). Can I get more details?\nLink: ${window.location.origin}/product-detail.html?id=${item.id}`
        );

        const card = `
          <div class="best-used-product-card">
            <div class="rounded position-relative fruite-item h-100 border" style="border-color: #f2f9e6 !important;">
              <div class="fruite-img">
                <a href="product-detail.html?id=${item.id}">
                  <img src="${fullImgUrl}" class="img-fluid w-100 rounded-top" onerror="this.onerror=null;this.src='img/product-sm-1.jpg'" />
                </a>
              </div>
              <div class="text-white bg-secondary px-3 py-1 rounded position-absolute" style="top:10px; left:10px">
                ${item.category}
              </div>
              <div class="p-4 border border-top-0 rounded-bottom">
                <h4>
                  <a href="product-detail.html?id=${item.id}" class="text-dark text-decoration-none">${item.name}</a>
                </h4>
                <p class="text-muted small product-desc" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 40px;">
                  ${item.description || 'Clinical skincare product.'}
                </p>
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2">
                  <p class="text-dark fs-5 fw-bold mb-0">₹${item.discountPrice ?? item.price}</p>
                  <div class="d-flex gap-2 align-items-center">
                    <a href="javascript:void(0)" 
                       class="btn border border-secondary rounded-pill px-3 py-1 text-primary add-to-cart-btn-related"
                       data-id="${item.id}"
                       data-name="${item.name}"
                       data-price="${item.discountPrice ?? item.price}"
                       data-img="${fullImgUrl}">
                      <i class="fa fa-shopping-bag me-2"></i>Add to cart
                    </a>
                    <a href="https://wa.me/919461972759?text=${whatsappMessage}"
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
        $sideContainer.append(card);
      });

      // Attach horizontal scroll controls for Best Used With (side column)
      $(document).off("click", ".best-used-next-btn").on("click", ".best-used-next-btn", function () {
        const $wrapper = $(".frequently_bought_together .featured-carousel-wrapper");
        const scrollAmount = $wrapper.width() * 0.75;
        $wrapper.animate({ scrollLeft: $wrapper.scrollLeft() + scrollAmount }, 400);
      });

      $(document).off("click", ".best-used-prev-btn").on("click", ".best-used-prev-btn", function () {
        const $wrapper = $(".frequently_bought_together .featured-carousel-wrapper");
        const scrollAmount = $wrapper.width() * 0.75;
        $wrapper.animate({ scrollLeft: $wrapper.scrollLeft() - scrollAmount }, 400);
      });
    }

    // 2. Populate "Related Products" Grid (Bottom section) - 8 items max
    const $bottomContainer = $("#related-category-products");
    $bottomContainer.empty();
    const bottomRelated = related.slice(0, 8);

    if (bottomRelated.length === 0) {
      $bottomContainer.append(
        '<div class="col-12 text-center text-muted">No related products found.</div>'
      );
    } else {
      bottomRelated.forEach((item) => {
        const relativeImgUrl = item.imageUrl || "";
        const fullImgUrl = relativeImgUrl.startsWith("http")
          ? relativeImgUrl
          : relativeImgUrl
            ? BASE_URL + relativeImgUrl
            : "img/product-default.jpg";

        const whatsappMessage = encodeURIComponent(
          `Hi SkinDekho! I'm interested in *${item.name}* (Price: ₹${item.discountPrice ?? item.price}). Can I get more details?\nLink: ${window.location.origin}/product-detail.html?id=${item.id}`
        );

        const card = `
          <div class="featured-product-card">
            <div class="rounded position-relative fruite-item h-100 border" style="border-color: #f2f9e6 !important;">
              <div class="fruite-img">
                <a href="product-detail.html?id=${item.id}">
                  <img src="${fullImgUrl}" class="img-fluid w-100 rounded-top" onerror="this.onerror=null;this.src='img/product-sm-1.jpg'" />
                </a>
              </div>
              <div class="text-white bg-secondary px-3 py-1 rounded position-absolute" style="top:10px; left:10px">
                ${item.category}
              </div>
              <div class="p-4 border border-top-0 rounded-bottom">
                <h4>
                  <a href="product-detail.html?id=${item.id}" class="text-dark text-decoration-none">${item.name}</a>
                </h4>
                <p class="text-muted small product-desc" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 40px;">
                  ${item.description || 'Clinical skincare product.'}
                </p>
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2">
                  <p class="text-dark fs-5 fw-bold mb-0">₹${item.discountPrice ?? item.price}</p>
                  <div class="d-flex gap-2 align-items-center">
                    <a href="javascript:void(0)" 
                       class="btn border border-secondary rounded-pill px-3 py-1 text-primary add-to-cart-btn-related"
                       data-id="${item.id}"
                       data-name="${item.name}"
                       data-price="${item.discountPrice ?? item.price}"
                       data-img="${fullImgUrl}">
                      <i class="fa fa-shopping-bag me-2 text-primary"></i>Add to cart
                    </a>
                    <a href="https://wa.me/919461972759?text=${whatsappMessage}"
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
        $bottomContainer.append(card);
      });

      // Attach horizontal scroll controls for next/prev buttons (matching home page)
      $(document).off("click", ".related-next-btn").on("click", ".related-next-btn", function () {
        const $wrapper = $(".related-products-section .featured-carousel-wrapper");
        const scrollAmount = $wrapper.width() * 0.75;
        $wrapper.animate({ scrollLeft: $wrapper.scrollLeft() + scrollAmount }, 400);
      });

      $(document).off("click", ".related-prev-btn").on("click", ".related-prev-btn", function () {
        const $wrapper = $(".related-products-section .featured-carousel-wrapper");
        const scrollAmount = $wrapper.width() * 0.75;
        $wrapper.animate({ scrollLeft: $wrapper.scrollLeft() - scrollAmount }, 400);
      });
    }
  } catch (err) {
    console.error("Related products error", err);
  }
}


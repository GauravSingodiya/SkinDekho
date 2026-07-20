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

  // Toggle Show More/Less for description
  $(document).on("click", ".toggle-desc-btn", function (e) {
    e.preventDefault();
    const showAll = $(this).attr("data-state") === "more";
    const fullDesc = $("#product-description-list").data("full-description");
    renderDescription(fullDesc, showAll);
  });
});

function renderProductDetails(product) {
  $("#product-name").text(product.name);

  const relativeImgUrl = product.imageUrl || "";
  const fullImgUrl = relativeImgUrl.startsWith("http")
    ? relativeImgUrl
    : relativeImgUrl
      ? BASE_URL + relativeImgUrl
      : "img/product-default.jpg";
  $("#product-img").attr("src", fullImgUrl);

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
      $thumb.on("click", function() {
        $(".thumb-item").css("border-color", "#ddd");
        $(this).css("border-color", "#81c408");
        
        $("#product-img").fadeOut(150, function() {
          $(this).attr("src", fullThumbUrl).fadeIn(150);
        });
      });
      
      $thumbnails.append($thumb);
    });
    $thumbnails.show();
  } else {
    $thumbnails.hide();
  }

  // Parse description to bullet points
  const description = product.description || "No description available.";
  $("#product-description-list").data("full-description", description);
  renderDescription(description, false);

  const price = product.discountPrice ?? product.price;
  $("#product-price").text(`₹${price}`);

  if (product.discountPrice && product.discountPrice < product.price) {
    $("#product-old-price").text(`₹${product.price}`).show();
  } else {
    $("#product-old-price").hide();
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
    const related = products.filter((p) => p.id != currentId).slice(0, 4);

    const $container = $("#related-products");
    $container.empty();

    if (related.length === 0) {
      $container.append(
        '<div class="col-12 text-center text-muted">No related products found.</div>',
      );
      return;
    }

    related.forEach((item) => {
      const relativeImgUrl = item.imageUrl || "";
      const fullImgUrl = relativeImgUrl.startsWith("http")
        ? relativeImgUrl
        : relativeImgUrl
          ? BASE_URL + relativeImgUrl
          : "img/product-default.jpg";

      const card = `
                <div class="col-md-6 col-lg-3">
                    <div class="rounded position-relative fruite-item h-100 border">
                        <div class="fruite-img">
                            <a href="product-detail.html?id=${item.id}">
                                <img src="${fullImgUrl}" class="img-fluid w-100 rounded-top" style="height: 200px; object-fit: cover;" onerror="this.onerror=null;this.src='img/product-sm-1.jpg'">
                            </a>
                        </div>
                        <div class="p-3">
                            <h6 class="mb-2"><a href="product-detail.html?id=${item.id}" class="text-dark text-decoration-none">${item.name}</a></h6>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="fw-bold text-primary">₹${item.discountPrice ?? item.price}</span>
                                <a href="product-detail.html?id=${item.id}" class="btn btn-sm btn-outline-primary rounded-pill">View</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
      $container.append(card);
    });
  } catch (err) {
    console.error("Related products error", err);
  }
}

function renderDescription(descText, showAll) {
  const $descList = $("#product-description-list");
  const words = descText.split(/\s+/).filter(Boolean);

  let displayText = descText;

  if (words.length > 100 && !showAll) {
    displayText = words.slice(0, 100).join(" ") + "...";
  }

  let points = displayText
    .split(/\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (points.length === 1 && points[0].includes(".")) {
    points = points[0]
      .split(/\.\s+/)
      .map((p) => p.trim())
      .filter(Boolean);
  }

  $descList.empty();
  points.forEach((pt) => {
    if (pt) {
      let text = pt;
      if (text.endsWith(".")) text = text.slice(0, -1);
      $descList.append(`<li>${text}</li>`);
    }
  });

  if (words.length > 100) {
    const btnText = showAll ? "Show Less" : "Show More";
    const btnState = showAll ? "less" : "more";
    $descList.append(`
      <li class="no-bullet" style="margin-top: 10px;">
        <a href="javascript:void(0)" class="toggle-desc-btn text-primary fw-bold" data-state="${btnState}" style="text-decoration: none;">
          ${btnText} <i class="fas fa-chevron-${showAll ? "up" : "down"} ms-1" style="font-size: 0.8rem;"></i>
        </a>
      </li>
    `);
  }
}

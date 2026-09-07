import { getProductById, getAllProducts } from "./products.js";
import { addToCartAPI } from "./api/cartService.js";
import { showToast, syncCartBadge } from "./main.js";
import { BASE_URL } from "./api/config.js";

// State for current product and selected variant
let currentProduct = null;
let currentSelectedVariant = null;
let currentParsedVariants = [];

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
    console.log("🧴 Product Detail API Response:", product);
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
    const qty = parseInt($("#quantity").val()) || 1;
    const token = sessionStorage.getItem("token");

    const $btn = $(this);
    const originalText = $btn.text();
    $btn.prop("disabled", true).text("Adding...");

    try {
      // Save selected variant to cartVariants in localStorage so cart and checkout always display it accurately
      if (currentSelectedVariant) {
        const cartVariants = JSON.parse(localStorage.getItem("cartVariants") || "{}");
        const vSize = currentSelectedVariant.size || currentSelectedVariant.Size || currentSelectedVariant.name || currentSelectedVariant.Name || "";
        const vRegPrice = currentSelectedVariant.price ?? currentSelectedVariant.Price ?? null;
        const vDiscPrice = currentSelectedVariant.discountPrice ?? currentSelectedVariant.DiscountPrice ?? null;
        const vEffPrice = (vDiscPrice !== null && vDiscPrice !== "" && vDiscPrice !== undefined && (!vRegPrice || parseFloat(vDiscPrice) < parseFloat(vRegPrice)))
          ? parseFloat(vDiscPrice)
          : (vRegPrice ? parseFloat(vRegPrice) : null);

        cartVariants[productId] = {
          productId: productId,
          variantId: currentSelectedVariant.id ?? currentSelectedVariant.Id ?? null,
          size: vSize,
          name: vSize,
          price: vEffPrice,
          regularPrice: vRegPrice,
          discountPrice: vDiscPrice,
          productName: currentProduct ? currentProduct.name : $("#product-name").text(),
        };
        localStorage.setItem("cartVariants", JSON.stringify(cartVariants));
      }

      if (token) {
        const res = await addToCartAPI(
          productId,
          qty,
          token,
          currentSelectedVariant,
        );
        if (res.success) {
          const vText = currentSelectedVariant ? ` (${currentSelectedVariant.size || currentSelectedVariant.name})` : "";
          showToast(
            `<strong>${$("#product-name").text()}${vText}</strong> added to cart!`,
            "success",
          );
          syncCartBadge();
        } else {
          throw new Error(res.message || "Failed to add to cart");
        }
      } else {
        // Guest cart in localStorage
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        const effectivePrice = currentSelectedVariant
          ? (currentSelectedVariant.discountPrice || currentSelectedVariant.price || (currentProduct ? (currentProduct.discountPrice || currentProduct.price) : 0))
          : (currentProduct ? (currentProduct.discountPrice || currentProduct.price) : 0);

        const vName = currentSelectedVariant ? (currentSelectedVariant.size || currentSelectedVariant.name) : null;
        const itemKey = vName ? `${productId}_${vName}` : productId;

        const existing = guestCart.find((item) => (item.variant ? `${item.id}_${item.variant}` : item.id) == itemKey);
        if (existing) {
          existing.quantity += qty;
        } else {
          guestCart.push({
            id: productId,
            name: (currentProduct ? currentProduct.name : $("#product-name").text()) + (vName ? ` (${vName})` : ""),
            price: effectivePrice,
            variant: vName,
            variantDetails: currentSelectedVariant || null,
            imageUrl: currentProduct ? (currentProduct.imageUrl || "") : "",
            quantity: qty,
          });
        }
        localStorage.setItem("guestCart", JSON.stringify(guestCart));
        syncCartBadge();
        showToast(
          `<strong>${$("#product-name").text()}${vName ? ` (${vName})` : ""}</strong> added to cart. <a href="cart.html" class="text-white fw-bold">View Cart</a>`,
          "success",
        );
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
        "Please login to continue to checkout",
        "error",
        "Authentication Required",
      );
      $("#authModal").modal("show");
      return;
    }

    const qty = parseInt($("#quantity").val()) || 1;
    const $btn = $(this);
    const originalText = $btn.text();
    $btn.prop("disabled", true).text("Processing...");

    try {
      if (currentSelectedVariant) {
        const cartVariants = JSON.parse(localStorage.getItem("cartVariants") || "{}");
        const vSize = currentSelectedVariant.size || currentSelectedVariant.Size || currentSelectedVariant.name || currentSelectedVariant.Name || "";
        const vRegPrice = currentSelectedVariant.price ?? currentSelectedVariant.Price ?? null;
        const vDiscPrice = currentSelectedVariant.discountPrice ?? currentSelectedVariant.DiscountPrice ?? null;
        const vEffPrice = (vDiscPrice !== null && vDiscPrice !== "" && vDiscPrice !== undefined && (!vRegPrice || parseFloat(vDiscPrice) < parseFloat(vRegPrice)))
          ? parseFloat(vDiscPrice)
          : (vRegPrice ? parseFloat(vRegPrice) : null);

        cartVariants[productId] = {
          productId: productId,
          variantId: currentSelectedVariant.id ?? currentSelectedVariant.Id ?? null,
          size: vSize,
          name: vSize,
          price: vEffPrice,
          regularPrice: vRegPrice,
          discountPrice: vDiscPrice,
          productName: currentProduct ? currentProduct.name : $("#product-name").text(),
        };
        localStorage.setItem("cartVariants", JSON.stringify(cartVariants));
      }

      const res = await addToCartAPI(
        productId,
        qty,
        token,
        currentSelectedVariant,
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
  currentProduct = product;
  $("#product-name").text(product.name);
  if (product.category) {
    $("#breadcrumb-category")
      .html(`<a href="shop.html?category=${encodeURIComponent(product.category)}" style="color: #969bab; text-decoration: none;">${product.category}</a>`);
  } else {
    $("#breadcrumb-category").text("Product");
  }

  // --- Product Images & Gallery Slider Logic ---
  const extractUrl = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item.trim().replace(/\\/g, "/");
    const candidate =
      item.imageUrl ||
      item.ImageUrl ||
      item.url ||
      item.Url ||
      item.imagePath ||
      item.ImagePath ||
      item.path ||
      item.Path ||
      item.fileName ||
      item.FileName ||
      item.imageName ||
      item.ImageName ||
      item.src ||
      "";
    return typeof candidate === "string" ? candidate.trim().replace(/\\/g, "/") : "";
  };

  const formatUrl = (rawPath) => {
    if (!rawPath) return "img/MOISTURING_LOTION.png";
    let cleaned = rawPath.trim().replace(/\\/g, "/");
    if (!cleaned) return "img/MOISTURING_LOTION.png";
    if (cleaned.startsWith("http://") || cleaned.startsWith("https://") || cleaned.startsWith("data:")) {
      return cleaned;
    }
    if (!cleaned.includes("/") && !cleaned.startsWith("img/")) {
      cleaned = "uploads/products/" + cleaned;
    }
    const leadingSlash = cleaned.startsWith("/") ? "" : "/";
    return BASE_URL + leadingSlash + cleaned;
  };

  let galleryUrls = [];

  // Add primary image if available
  const primaryRaw = extractUrl(product.imageUrl || product.ImageUrl);
  if (primaryRaw) {
    galleryUrls.push(formatUrl(primaryRaw));
  }

  // Add all images from images array
  const rawImgs = product.images || product.Images || [];
  if (Array.isArray(rawImgs) && rawImgs.length > 0) {
    const sorted = [...rawImgs].sort((a, b) => {
      const orderA = a.displayOrder ?? a.DisplayOrder ?? 0;
      const orderB = b.displayOrder ?? b.DisplayOrder ?? 0;
      return orderA - orderB;
    });

    sorted.forEach((imgObj) => {
      const raw = extractUrl(imgObj);
      if (raw) {
        const full = formatUrl(raw);
        if (!galleryUrls.includes(full)) {
          galleryUrls.push(full);
        }
      }
    });
  }

  // Fallback if no images found
  if (galleryUrls.length === 0) {
    galleryUrls.push("img/MOISTURING_LOTION.png");
  }

  let currentGalleryIndex = 0;

  const updateGalleryView = (index) => {
    if (index < 0) index = galleryUrls.length - 1;
    if (index >= galleryUrls.length) index = 0;
    currentGalleryIndex = index;

    const activeUrl = galleryUrls[currentGalleryIndex];

    $("#product-img").fadeOut(120, function () {
      $(this).attr("src", activeUrl).fadeIn(120);
      $("#product-img-zoom").attr("href", activeUrl);
    });

    // Update Counter Badge
    if (galleryUrls.length > 1) {
      $("#product-img-counter").text(`${currentGalleryIndex + 1} / ${galleryUrls.length}`).show();
    } else {
      $("#product-img-counter").hide();
    }

    // Update Thumbnail Active State
    $(".thumb-item").each(function (i) {
      if (i === currentGalleryIndex) {
        $(this).addClass("active").css("border-color", "#81c408").css("box-shadow", "0 0 6px rgba(129, 196, 8, 0.4)");
      } else {
        $(this).removeClass("active").css("border-color", "#ddd").css("box-shadow", "none");
      }
    });
  };

  // Render Thumbnails & Bind Controls
  const $thumbnails = $("#product-thumbnails");
  $thumbnails.empty();

  if (galleryUrls.length > 1) {
    $("#main-img-prev, #main-img-next, #product-thumbnails-container").show();

    galleryUrls.forEach((imgUrl, i) => {
      const isCurrentActive = i === 0;
      const thumbHtml = `
        <div class="thumb-item ${isCurrentActive ? "active" : ""}" data-index="${i}" style="width: 72px; height: 72px; cursor: pointer; border: 2px solid ${isCurrentActive ? '#81c408' : '#ddd'}; border-radius: 8px; overflow: hidden; transition: all 0.2s; flex-shrink: 0;">
          <img src="${imgUrl}" class="w-100 h-100" style="object-fit: cover;" onerror="this.onerror=null;this.src='img/MOISTURING_LOTION.png'">
        </div>
      `;

      const $thumb = $(thumbHtml);
      $thumb.on("click", function () {
        const idx = parseInt($(this).attr("data-index"), 10);
        updateGalleryView(idx);
      });

      $thumbnails.append($thumb);
    });
  } else {
    $("#main-img-prev, #main-img-next, #product-thumbnails-container").hide();
  }

  // Set initial image view
  updateGalleryView(0);

  // Next / Prev Navigation Buttons
  $("#main-img-prev").off("click").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    updateGalleryView(currentGalleryIndex - 1);
  });

  $("#main-img-next").off("click").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    updateGalleryView(currentGalleryIndex + 1);
  });

  // Thumbnail Horizontal Scroll Buttons
  $("#thumb-scroll-left").off("click").on("click", function () {
    $thumbnails.animate({ scrollLeft: "-=180" }, 200);
  });

  $("#thumb-scroll-right").off("click").on("click", function () {
    $thumbnails.animate({ scrollLeft: "+=180" }, 200);
  });

  // Touch & Mouse Drag Swipe Gesture Logic on Main Product Image
  const $imgCard = $(".product-img-card");
  let startX = 0;
  let startY = 0;
  let isSwiping = false;

  $imgCard.off("touchstart.gallery").on("touchstart.gallery", function (e) {
    if (galleryUrls.length <= 1) return;
    const touch = e.originalEvent.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    isSwiping = true;
  });

  $imgCard.off("touchend.gallery").on("touchend.gallery", function (e) {
    if (!isSwiping || galleryUrls.length <= 1) return;
    const touch = e.originalEvent.changedTouches[0];
    const diffX = touch.clientX - startX;
    const diffY = touch.clientY - startY;

    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        updateGalleryView(currentGalleryIndex + 1);
      } else {
        updateGalleryView(currentGalleryIndex - 1);
      }
    }
    isSwiping = false;
  });

  let isMouseDown = false;
  $imgCard.off("mousedown.gallery").on("mousedown.gallery", function (e) {
    if (galleryUrls.length <= 1) return;
    startX = e.clientX;
    startY = e.clientY;
    isMouseDown = true;
  });

  $(document).off("mouseup.gallery").on("mouseup.gallery", function (e) {
    if (!isMouseDown || galleryUrls.length <= 1) return;
    const diffX = e.clientX - startX;
    const diffY = e.clientY - startY;

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        updateGalleryView(currentGalleryIndex + 1);
      } else {
        updateGalleryView(currentGalleryIndex - 1);
      }
    }
    isMouseDown = false;
  });

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

  // Helper to dynamically update displayed price based on selected variant
  function updateDisplayedPrice(variant = null) {
    if (!currentProduct) return;

    let basePrice = currentProduct.price;
    let discountPrice = currentProduct.discountPrice;

    if (variant && variant.price !== null && variant.price !== undefined && variant.price !== "") {
      basePrice = parseFloat(variant.price);
      discountPrice = (variant.discountPrice !== null && variant.discountPrice !== undefined && variant.discountPrice !== "")
        ? parseFloat(variant.discountPrice)
        : null;
    }

    const effectivePrice = (discountPrice !== null && discountPrice < basePrice) ? discountPrice : basePrice;
    $("#product-price").text(`₹${effectivePrice}`);

    if (discountPrice !== null && discountPrice < basePrice) {
      $("#product-old-price").text(`₹${basePrice}`).show();
      const savePercent = Math.round(((basePrice - discountPrice) / basePrice) * 100);
      $("#product-save-badge").text(`Save ${savePercent}%`).removeClass("d-none").show();
    } else {
      $("#product-old-price").hide();
      $("#product-save-badge").addClass("d-none").hide();
    }

    // Update WhatsApp link with variant and current price
    const variantText = variant && variant.name ? ` (Variant: ${variant.name})` : "";
    const whatsappMessage = encodeURIComponent(
      `Hi SkinDekho! I'm interested in *${currentProduct.name}*${variantText} (Price: ₹${effectivePrice}). Can I get more details?\nLink: ${window.location.href}`,
    );
    $("#whatsapp-inquiry").attr(
      "href",
      `https://wa.me/919461972759?text=${whatsappMessage}`,
    );
  }

  // ✅ Parse & Render Variants (Size/Pack selector buttons with prices)
  const rawVariants = product.variants || product.Variants || product.variantsJson || product.VariantsJson || [];
  currentParsedVariants = [];

  if (Array.isArray(rawVariants)) {
    currentParsedVariants = rawVariants.map((item) => {
      if (typeof item === "string") {
        try {
          const parsed = JSON.parse(item);
          if (typeof parsed === "object" && parsed !== null) {
            const sizeVal = parsed.size || parsed.Size || parsed.name || parsed.Name || "";
            return {
              id: parsed.id ?? parsed.Id ?? null,
              size: sizeVal,
              name: sizeVal,
              price: parsed.price ?? parsed.Price ?? product.price,
              discountPrice: parsed.discountPrice ?? parsed.DiscountPrice ?? product.discountPrice,
              stockQuantity: parsed.stockQuantity ?? parsed.StockQuantity ?? product.stockQuantity,
              sku: parsed.sku ?? parsed.Sku ?? "",
            };
          }
        } catch (e) {}
        return { size: item, name: item, price: product.price, discountPrice: product.discountPrice };
      }
      const sizeVal = item.size || item.Size || item.name || item.Name || "";
      return {
        id: item.id ?? item.Id ?? null,
        size: sizeVal,
        name: sizeVal,
        price: item.price ?? item.Price ?? product.price,
        discountPrice: item.discountPrice ?? item.DiscountPrice ?? product.discountPrice,
        stockQuantity: item.stockQuantity ?? item.StockQuantity ?? product.stockQuantity,
        sku: item.sku ?? item.Sku ?? "",
      };
    });
  } else if (typeof rawVariants === "string" && rawVariants.trim()) {
    try {
      const parsed = JSON.parse(rawVariants);
      if (Array.isArray(parsed)) {
        currentParsedVariants = parsed.map((item) => {
          if (typeof item === "string") {
            return { size: item, name: item, price: product.price, discountPrice: product.discountPrice };
          }
          const sizeVal = item.size || item.Size || item.name || item.Name || "";
          return {
            id: item.id ?? item.Id ?? null,
            size: sizeVal,
            name: sizeVal,
            price: item.price ?? item.Price ?? product.price,
            discountPrice: item.discountPrice ?? item.DiscountPrice ?? product.discountPrice,
            stockQuantity: item.stockQuantity ?? item.StockQuantity ?? product.stockQuantity,
            sku: item.sku ?? item.Sku ?? "",
          };
        });
      }
    } catch (e) {
      currentParsedVariants = rawVariants
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
        .map((name) => ({ size: name, name: name, price: product.price, discountPrice: product.discountPrice }));
    }
  }

  const $variantsContainer = $("#product-variants-container");

  if ($variantsContainer.length && currentParsedVariants.length > 0) {
    $variantsContainer.removeClass("d-none");
    const $btns = $("#product-variants-btns");
    $btns.empty();

    // Default select first variant
    currentSelectedVariant = currentParsedVariants[0];
    updateDisplayedPrice(currentSelectedVariant);

    currentParsedVariants.forEach((v, i) => {
      const isFirst = i === 0;
      const vName = typeof v === "object" ? (v.name || v.Name || "") : v;
      const vPrice = typeof v === "object" ? (v.price ?? v.Price ?? "") : "";
      const vDisc = typeof v === "object" ? (v.discountPrice ?? v.DiscountPrice ?? "") : "";

      let saveBadgeHtml = "";
      if (vDisc && vPrice && parseFloat(vDisc) < parseFloat(vPrice)) {
        saveBadgeHtml = `<span style="font-size:0.68rem; background:#28a745; color:#fff; padding:1px 6px; border-radius:8px; margin-top:2px; font-weight:600;">Save More</span>`;
      } else if (i > 0) {
        saveBadgeHtml = `<span style="font-size:0.68rem; background:#28a745; color:#fff; padding:1px 6px; border-radius:8px; margin-top:2px; font-weight:600;">Save More</span>`;
      }

      $btns.append(`
        <button type="button"
          class="variant-btn d-inline-flex flex-column align-items-center justify-content-center ${isFirst ? "active" : ""}"
          data-index="${i}"
          style="
            min-width: 90px;
            padding: 8px 16px;
            border-radius: 12px;
            border: 2px solid ${isFirst ? "#7c5cfc" : "#e0e0e0"};
            background: ${isFirst ? "#f3f0ff" : "#ffffff"};
            color: ${isFirst ? "#5a32a3" : "#333333"};
            font-weight: 600;
            font-size: 0.92rem;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: ${isFirst ? "0 2px 8px rgba(124, 92, 252, 0.15)" : "none"};
          ">
          <span>${vName}</span>
          ${saveBadgeHtml}
        </button>
      `);
    });

    // Click handler to select variant and update price
    $(document).off("click.variant").on("click.variant", ".variant-btn", function () {
      const idx = parseInt($(this).data("index"), 10);
      currentSelectedVariant = currentParsedVariants[idx] || null;

      $(".variant-btn").each(function () {
        $(this).css({
          background: "#ffffff",
          color: "#333333",
          "border-color": "#e0e0e0",
          "box-shadow": "none",
        }).removeClass("active");
      });

      $(this).css({
        background: "#f3f0ff",
        color: "#5a32a3",
        "border-color": "#7c5cfc",
        "box-shadow": "0 2px 8px rgba(124, 92, 252, 0.15)",
      }).addClass("active");

      // Update price according to selected variant!
      updateDisplayedPrice(currentSelectedVariant);
    });

  } else {
    currentSelectedVariant = null;
    if ($variantsContainer.length) {
      $variantsContainer.addClass("d-none");
    }
    updateDisplayedPrice(null);
  }
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
        const getDisplayProductImage = (p) => {
          if (p.imageUrl && p.imageUrl.trim()) return p.imageUrl.trim();
          const imgs = p.images || p.Images || [];
          if (imgs.length > 0) {
            const first = imgs[0];
            const url = typeof first === "string" ? first : (first?.imageUrl || first?.ImageUrl || "");
            if (url && url.trim()) return url.trim();
          }
          return "";
        };

        const relativeImgUrl = getDisplayProductImage(item);
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
        const getDisplayProductImage = (p) => {
          if (p.imageUrl && p.imageUrl.trim()) return p.imageUrl.trim();
          const imgs = p.images || p.Images || [];
          if (imgs.length > 0) {
            const first = imgs[0];
            const url = typeof first === "string" ? first : (first?.imageUrl || first?.ImageUrl || "");
            if (url && url.trim()) return url.trim();
          }
          return "";
        };

        const relativeImgUrl = getDisplayProductImage(item);
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


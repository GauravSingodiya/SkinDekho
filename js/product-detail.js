import { getProductById, getAllProducts } from "./products.js";
import { addToCartAPI } from "./api/cartService.js";
import { showToast, syncCartBadge } from "./main.js";

$(document).ready(async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    window.location.href = "index.html";
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
        $("#product-description").text("The product you are looking for does not exist or has been removed.");
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
  $("#btn-plus").on("click", function() {
    quantity++;
    $("#quantity").val(quantity);
  });

  $("#btn-minus").on("click", function() {
    if (quantity > 1) {
        quantity--;
        $("#quantity").val(quantity);
    }
  });

  // Add to cart on detail page
  $("#add-to-cart-detail").on("click", async function() {
    const token = sessionStorage.getItem("token");
    if (!token) {
        showToast("Please login to add items to cart", "error", "Authentication Required");
        $("#authModal").modal("show");
        return;
    }

    const $btn = $(this);
    const originalHtml = $btn.html();
    $btn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Adding...');

    try {
        const res = await addToCartAPI(productId, parseInt($("#quantity").val()), token);
        if (res.success) {
            showToast(`<strong>${$("#product-name").text()}</strong> added to cart!`, "success");
            syncCartBadge();
        } else {
            throw new Error(res.message || "Failed to add to cart");
        }
    } catch (err) {
        showToast(err.message || "Failed to add to cart", "error");
    } finally {
        $btn.prop("disabled", false).html(originalHtml);
    }
  });
});

function renderProductDetails(product) {
  $("#product-name").text(product.name);
  $("#breadcrumb-product-name").text(product.name);
  $("#product-img").attr("src", product.imageUrl);
  $("#product-description").text(product.description || "No description available.");
  $("#product-category span").text(product.category);
  
  const price = product.discountPrice ?? product.price;
  $("#product-price").text(`₹${price}`);
  
  if (product.discountPrice && product.discountPrice < product.price) {
    $("#product-old-price").text(`₹${product.price}`);
  } else {
    $("#product-old-price").hide();
  }

  // Update WhatsApp link
  const whatsappMessage = encodeURIComponent(
    `Hi SkinDekho! I'm interested in *${product.name}* (Price: ₹${price}). Can I get more details?\nLink: ${window.location.href}`
  );
  $("#whatsapp-inquiry").attr("href", `https://wa.me/?text=${whatsappMessage}`);
}

async function loadRelatedProducts(category, currentId) {
    try {
        const res = await getAllProducts(category);
        const products = res.result || res || [];
        const related = products.filter(p => p.id != currentId).slice(0, 4);
        
        const $container = $("#related-products");
        $container.empty();

        if (related.length === 0) {
            $container.append('<div class="col-12 text-center text-muted">No related products found.</div>');
            return;
        }

        related.forEach(item => {
            const card = `
                <div class="col-md-6 col-lg-3">
                    <div class="rounded position-relative fruite-item h-100 border">
                        <div class="fruite-img">
                            <a href="product-detail.html?id=${item.id}">
                                <img src="${item.imageUrl}" class="img-fluid w-100 rounded-top" style="height: 200px; object-fit: cover;">
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


$(document).ready(function () {
  loadCartItems();
  updateCartBadge(); // Ensure badge is correct on load
});

function loadCartItems() {
  const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
  const $cartTableBody = $("#cart-items");
  $cartTableBody.empty();

  if (cart.length === 0) {
    $cartTableBody.html('<tr><td colspan="6" class="text-center">Your cart is empty.</td></tr>');
    updateCartTotals();
    return;
  }

  cart.forEach((item, index) => {
    const total = (item.price * item.quantity).toFixed(2);
    
    const row = `
      <tr data-index="${index}">
        <th scope="row">
          <div class="d-flex align-items-center">
            <img src="${item.imageUrl}" class="img-fluid me-5 rounded-circle" style="width: 80px; height: 80px;" alt="${item.name}">
          </div>
        </th>
        <td>
          <p class="mb-0 mt-4">${item.name}</p>
        </td>
        <td>
          <p class="mb-0 mt-4">₹${item.price}</p>
        </td>
        <td>
          <div class="input-group quantity mt-4" style="width: 100px;">
            <div class="input-group-btn">
              <button class="btn btn-sm btn-minus rounded-circle bg-light border" >
                <i class="fa fa-minus"></i>
              </button>
            </div>
            <input type="text" class="form-control form-control-sm text-center border-0" value="${item.quantity}" readonly>
            <div class="input-group-btn">
              <button class="btn btn-sm btn-plus rounded-circle bg-light border">
                <i class="fa fa-plus"></i>
              </button>
            </div>
          </div>
        </td>
        <td>
          <p class="mb-0 mt-4 item-total">₹${total}</p>
        </td>
        <td>
          <button class="btn btn-md rounded-circle bg-light border mt-4 btn-remove" >
            <i class="fa fa-times text-danger"></i>
          </button>
        </td>
      </tr>
    `;
    $cartTableBody.append(row);
  });
  
  updateCartTotals();
}

function updateCartTotals() {
  const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
  let subtotal = 0;
  
  cart.forEach(item => {
    subtotal += item.price * item.quantity;
  });
  
  const shipping = 3.00; // Flat rate from HTML 
  // You might want to make shipping dynamic or 0 if empty
  const finalShipping = cart.length > 0 ? shipping : 0;
  
  const total = subtotal + finalShipping;
  
  // Assuming these IDs exist in cart.html or need to be added
  $("#cart-subtotal").text(`₹${subtotal.toFixed(2)}`);
  $("#cart-shipping").text(`₹${finalShipping.toFixed(2)}`);
  $("#cart-total").text(`₹${total.toFixed(2)}`);
}

// Increment Quantity
$(document).on("click", ".btn-plus", function () {
  const index = $(this).closest("tr").data("index");
  let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
  
  cart[index].quantity += 1;
  sessionStorage.setItem("cart", JSON.stringify(cart));
  
  loadCartItems();
  updateCartBadge();
});

// Decrement Quantity
$(document).on("click", ".btn-minus", function () {
  const index = $(this).closest("tr").data("index");
  let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
  
  if (cart[index].quantity > 1) {
    cart[index].quantity -= 1;
  } else {
    // Optional: Remove if quantity goes to 0? Or just stay at 1?
    // Let's stay at 1 for now, user has 'remove' button
  }
  
  sessionStorage.setItem("cart", JSON.stringify(cart));
  loadCartItems();
  updateCartBadge();
});

// Remove Item
$(document).on("click", ".btn-remove", function () {
  const index = $(this).closest("tr").data("index");
  let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
  
  cart.splice(index, 1);
  
  sessionStorage.setItem("cart", JSON.stringify(cart));
  loadCartItems();
  updateCartBadge();
});

function updateCartBadge() {
  const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  $(".fa-shopping-bag").next("span").text(totalItems);
}

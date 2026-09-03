// endpoints.js
export const API = {
  AUTH: {
    LOGIN: "/api/auth/login",
    SIGNUP: "/api/auth/signup",
    GET_CURRENT_USER: "/api/auth/CurrentUser",
    GET_MY_ADDRESSES: "/api/auth/GetMyAddresses",
    UPDATE_ADDRESS: (id) => `/api/auth/UpdateAddress/${id}`,
    DELETE_ADDRESS: (id) => `/api/auth/DeleteAddress/${id}`,
    ADD_ADDRESS: "/api/auth/AddAddress",
  },

  PRODUCTS: {
    GET_ALL: "/api/Products/GetAllProducts",
    FILTER: "/api/Products/GetProductsbyFilter",
    CATEGORIES: "/api/Products/GetAllCategories",
    FEATURED: "/api/Products/GetFeaturedProducts",
    LATEST: "/api/Products/LatestProducts",
    GET_BY_ID: (id) => `/api/Products/GetProductById/${id}`,
    ADD: "/api/Products/AddProduct",
    UPDATE: (id) => `/api/Products/UpdateProduct/${id}`,
    DELETE: (id) => `/api/Products/DeleteProduct/${id}`,
    SAVE_DETAILS: (id) => `/api/Products/SaveProductDetails/${id}`,
    ADD_CATEGORY: "/api/Products/AddCategory",
    UPDATE_CATEGORY: (id) => `/api/Products/UpdateCategory/${id}`,
    DELETE_CATEGORY: (id) => `/api/Products/DeleteCategory/${id}`,
    DELETE_PRODUCT_IMAGE: (productId, imageId) => `/api/Products/DeleteProductImage/${productId}/${imageId}`,
    SET_PRIMARY_IMAGE: (productId, imageId) => `/api/Products/SetPrimaryImage/${productId}/${imageId}`,
    REORDER_PRODUCT_IMAGES: (productId) => `/api/Products/ReorderProductImages/${productId}`,
  },

  CART: {
    ADD: "/api/Orders/cart/add",
    LIST: "/api/Orders/cart",
    REMOVE: (id) => `/api/Orders/cart/remove/${id}`,
  },

  CONTACT: {
    SEND_MESSAGE: "/api/Contact/SendMessage",
    UPDATE_USER: (id) => `/api/Contact/update-user/${id}`,
  },
  ORDERS: {
    CHECKOUT: "/api/Orders/checkout",
    VERIFY_PAYMENT: "/api/Orders/verify-payment",
    PAY_PENDING: (id) => `/api/Orders/pay-pending/${id}`,
    GET_MY_ORDERS: "/api/Orders/my-orders",
    GET_ALL_ADMIN: "/api/Orders/admin/all",
    UPDATE_ADMIN: (id) => `/api/Orders/admin/update/${id}`,
  },
  DASHBOARD: {
    STATS: "/api/dashboard/stats",
  },
};

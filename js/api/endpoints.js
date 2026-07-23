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
    GET_MY_ORDERS: "/api/Orders/my-orders",
    GET_ALL_ADMIN: "/api/Orders/admin/all",
    UPDATE_ADMIN: (id) => `/api/Orders/admin/update/${id}`,
  },
  DASHBOARD: {
    STATS: "/api/dashboard/stats",
  },
};

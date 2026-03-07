// endpoints.js
export const API = {
  AUTH: {
    LOGIN: "/api/auth/login",
    SIGNUP: "/api/auth/signup",
    GET_CURRENT_USER: "/api/auth/CurrentUser",
  },

  PRODUCTS: {
    GET_ALL: "/api/Products/GetAllProducts",
    FILTER: "/api/Products/GetProductsbyFilter",
    CATEGORIES: "/api/Products/GetAllCategories",
    FEATURED: "/api/Products/GetFeaturedProducts",
  },

  CART: {
    ADD: "/cart/add",
    LIST: "/cart",
    REMOVE: (id) => `/cart/remove/${id}`,
  },

  CONTACT: {
    SEND_MESSAGE: "/api/Contact/SendMessage",
    UPDATE_USER: (id) => `/api/Contact/update-user/${id}`,
  },
};

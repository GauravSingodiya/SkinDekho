// endpoints.js
export const API = {
  AUTH: {
    LOGIN: "/api/auth/login",
    SIGNUP: "/api/auth/signup",
  },

  PRODUCTS: {
    GET_ALL: "/api/Products/GetAllProducts",
    FILTER: "/api/Products/GetProductsbyFilter",
    CATEGORIES: "/api/Products/GetAllCategories",
  },

  CART: {
    ADD: "/cart/add",
    LIST: "/cart",
    REMOVE: (id) => `/cart/remove/${id}`,
  },
};

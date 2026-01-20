// endpoints.js
export const API = {
  AUTH: {
    LOGIN: "/api/auth/login",
    SIGNUP: "/api/auth/signup",
  },

  PRODUCTS: {
    GET_ALL: "/Products/GetAllProducts",
  },

  CART: {
    ADD: "/cart/add",
    LIST: "/cart",
    REMOVE: (id) => `/cart/remove/${id}`,
  },
};

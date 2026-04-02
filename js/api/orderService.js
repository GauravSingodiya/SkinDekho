import apiRequest from "./apiClient.js";
import { API } from "./endpoints.js";

export async function getAddressesAPI(token) {
  return await apiRequest(API.AUTH.GET_MY_ADDRESSES, "GET", null, token);
}

export async function checkoutAPI(payload, token) {
  return await apiRequest(API.ORDERS.CHECKOUT, "POST", payload, token);
}

export async function getMyOrdersAPI(token) {
  return await apiRequest(API.ORDERS.GET_MY_ORDERS, "GET", null, token);
}

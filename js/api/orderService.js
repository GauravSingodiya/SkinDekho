import apiRequest from "./apiClient.js";
import { API } from "./endpoints.js";

export async function getAddressesAPI(token) {
  return await apiRequest(API.AUTH.GET_MY_ADDRESSES, "GET", null, token);
}

export async function updateAddressAPI(id, payload, token) {
  return await apiRequest(API.AUTH.UPDATE_ADDRESS(id), "PUT", payload, token);
}

export async function deleteAddressAPI(id, token) {
  return await apiRequest(API.AUTH.DELETE_ADDRESS(id), "DELETE", null, token);
}

export async function addAddressAPI(payload, token) {
  return await apiRequest(API.AUTH.ADD_ADDRESS, "POST", payload, token);
}

export async function checkoutAPI(payload, token) {
  return await apiRequest(API.ORDERS.CHECKOUT, "POST", payload, token);
}

export async function getMyOrdersAPI(token) {
  return await apiRequest(API.ORDERS.GET_MY_ORDERS, "GET", null, token);
}

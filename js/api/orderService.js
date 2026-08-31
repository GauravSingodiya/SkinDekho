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

export async function verifyPaymentAPI(payload, token) {
  return await apiRequest(API.ORDERS.VERIFY_PAYMENT, "POST", payload, token);
}

export async function payPendingOrderAPI(orderId, token) {
  return await apiRequest(API.ORDERS.PAY_PENDING(orderId), "POST", null, token);
}

export async function getMyOrdersAPI(token) {
  return await apiRequest(API.ORDERS.GET_MY_ORDERS, "GET", null, token);
}

export async function getAllAdminOrdersAPI(token) {
  return await apiRequest(API.ORDERS.GET_ALL_ADMIN, "GET", null, token);
}

export async function updateAdminOrderAPI(id, payload, token) {
  return await apiRequest(API.ORDERS.UPDATE_ADMIN(id), "PUT", payload, token);
}

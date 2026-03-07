import apiRequest from "./api/apiClient.js";
import { API } from "./api/endpoints.js";

// ✅ LOGIN (email + password)
export function loginUser(email, password) {
  return apiRequest(API.AUTH.LOGIN, "POST", {
    email,
    password,
  });
}

// ✅ SIGNUP (matches backend curl exactly)
export function registerUser({
  firstName,
  lastName,
  email,
  phoneNumber,
  password,
}) {
  return apiRequest(API.AUTH.SIGNUP, "POST", {
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
  });
}

// ✅ GET CURRENT USER
export function getCurrentUser(token) {
  return apiRequest(API.AUTH.GET_CURRENT_USER, "GET", null, token);
}

// ✅ UPDATE USER
export function updateUser(id, userData, token) {
  return apiRequest(API.CONTACT.UPDATE_USER(id), "PUT", userData, token);
}

import apiRequest from "./api/apiClient.js";
import { API } from "./api/endpoints.js";

export const sendContactMessage = async (payload) => {
  try {
    const data = await apiRequest(API.CONTACT.SEND_MESSAGE, "POST", payload);
    console.log("data:::", data);

    return data;
  } catch (error) {
    throw error;
  }
};

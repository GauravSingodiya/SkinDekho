import apiRequest from "./apiClient.js";
import { API } from "./endpoints.js";

/**
 * Fetches dashboard statistics (satisfied customers, quality of service, etc.)
 * @returns {Promise<Object>} The stats object
 */
export async function getDashboardStats() {
  try {
    return await apiRequest(API.DASHBOARD.STATS);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}

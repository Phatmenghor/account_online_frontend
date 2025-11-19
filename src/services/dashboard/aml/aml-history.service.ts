import { AllHistoryRequest } from "@/models/aml/history/history.request";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getAllAmlHistoryService(request: AllHistoryRequest) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/aml/all-history",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch AML history.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching AML history.",
        rawError: error,
      };
    }
  }
}


export async function UpdateHistoryService(request: AllHistoryRequest) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/aml/history-by/${id}",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch AML history.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching AML history.",
        rawError: error,
      };
    }
  }
}

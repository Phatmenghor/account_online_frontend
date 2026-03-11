import { CreateOpenAccountReq } from "@/models/open-account/openAccount.request";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function createOpenAccountService(request: CreateOpenAccountReq) {
  try {
    const response = await axiosClientWithAuth.post("/api/v1/public/open-account", request);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to create open account.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw, status: error.response?.status };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while creating open account.",
        rawError: error,
      };
    }
  }
}
import { CreateOpenAccountReq } from "@/models/open-account/openAccount.request";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function createOpenAccountService(request: CreateOpenAccountReq) {
  try {
    // Set longer timeout for account creation (120 seconds) due to multiple backend operations:
    // - Customer matching, validation, AML processing, customer creation,
    // - KHR/USD account creation, validation, mobile banking activation
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/open-account",
      request,
      { timeout: 120000 } // 120 seconds timeout for long-running account creation
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message;
      console.error("Axios error:", message);

      throw {
        errorMessage: message,
        rawError: raw,
        status: error.response?.status,
      };
    } else {
      console.error("Unexpected error:", error);
      throw {
        rawError: error,
      };
    }
  }
}

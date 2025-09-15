import { LoginCredentials } from "@/models/auth/auth.request";
import { axiosClient } from "@/utils/axios";
import { storeRole } from "@/utils/local-storage/roles";
import { storeToken } from "@/utils/local-storage/token";

export async function loginService(credentials: LoginCredentials) {
  try {
    // Simulate async call and delay
    const response = await axiosClient.post("/api/v1/auth/login", credentials);

    // On success, store token and role (simulate your original behavior)
    storeToken(response.data.data.accessToken);
    storeRole(response.data.data.userRole.userRole);

    return response.data.data;
  } catch (error) {
    console.error("Login service error:", error);

    // Re-throw or transform error if needed
    throw {
      errorMessage: "An unexpected error occurred during login.",
      rawError: error,
    };
  }
}

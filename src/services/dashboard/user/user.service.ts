import {
  AllUserReq,
  CreateUserReq,
  UpdateUserReq,
} from "@/models/user/user.request";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getUsersService(request: AllUserReq) {
  try {
    // Simulate API delay
    const response = await axiosClientWithAuth.post("/api/v1/user", request);

    return response.data.data;
  } catch (error) {
    // Axios error handling (optional for mock)
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch users.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetching users.",
        rawError: error,
      };
    }
  }
}

export async function getUserByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/user/getById/${id}`
    );
    return response.data.data;
  } catch (error: any) {
    // Axios error handling (optional for mock)
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch user by id.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetching user by id.",
        rawError: error,
      };
    }
  }
}

export async function createUserService(newUser: CreateUserReq) {
  try {
    // Simulate API delay
    const response = await axiosClientWithAuth.post(
      "/api/v1/user/create-user",
      newUser
    );

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to create user.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while creating user.",
        rawError: error,
      };
    }
  }
}

export async function updateUserService(id: number, updates: UpdateUserReq) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/user/updateById/${id}`,
      updates
    );

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to update user.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while updating user.",
        rawError: error,
      };
    }
  }
}

// 🗑️ delete user
export async function deleteUserService(id: number) {
  try {
    // Simulate API delay
    const response = await axiosClientWithAuth.post(
      `/api/v1/user/deleteById/${id}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to delete user.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while deleting user.",
        rawError: error,
      };
    }
  }
}

export async function getUserProfileService() {
  try {
    // Simulate API delay
    const response = await axiosClientWithAuth.post(`/api/v1/user/token`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch user.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetch user.",
        rawError: error,
      };
    }
  }
}

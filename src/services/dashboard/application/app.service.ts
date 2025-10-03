import { AllAppReq, CreateAppReq, UpdateAppReq } from "@/models/application/app.request";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getAppService(request: AllAppReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/application/all",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch applications.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching applications.",
        rawError: error,
      };
    }
  }
}

export async function getAppByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.get(`/api/application/${id}`);
    return response.data.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch application by id.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching application by id.",
        rawError: error,
      };
    }
  }
}

export async function createAppService(request: CreateAppReq) {
    try {
        const response = await axiosClientWithAuth.post("/api/application", request);
        return response.data.data;
    } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to create application.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while creating application.",
        rawError: error,
      };
    }
  }
}

export async function updateAppService(
    id: number,
    update: UpdateAppReq
) {
    try {
        const response = await axiosClientWithAuth.put(`/api/application/${id}`, update);
        return response.data.data;
    } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to update application.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while updating application.",
        rawError: error,
      };
    }
  }
}

export async function deleteAppService(id: number) {
    try {
        const response = await axiosClientWithAuth.delete(`/api/application/${id}`);
        return response.data.data;
    } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to delete application.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while deleting application.",
        rawError: error,
      };
    }
  }
}
import { AllTraineeReq, CreateTraineeReq, UpdateTraineeReq } from "@/models/trainee/trainee.request";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getTraineeService(request: AllTraineeReq) {
    try {
        const response = await axiosClientWithAuth.post(
            "/api/report-trainee/all",
            request
        );
        return response.data.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const raw = error.response?.data;
            const message = raw?.message || "Failed to fetch trainees.";
            console.error("Axios error:", message);

            throw { errorMessage: message, rawError: raw };
        } else {
            console.error("Unexpected error:", error);
            throw {
                errorMessage:
                    "An unexpected error occurred while fetching trainees.",
                rawError: error,
            };
        }
    }
}

export async function getTraineeByIdService(id: number) {
    try {
        const response = await axiosClientWithAuth.get(`/api/report-trainee/${id}`);
        return response.data.data;
    } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch trainee by id.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching trainee by id.",
        rawError: error,
      };
    }
  }
}

export async function createTraineeService(request: CreateTraineeReq) {
    try {
        const response = await axiosClientWithAuth.post("/api/report-trainee", request);
        return response.data.data;
    } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to create trainee.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while creating trainee.",
        rawError: error,
      };
    }
  }
}

export async function updateTraineeService(
    id: number,
    update: UpdateTraineeReq
) {
    try {
        const response = await axiosClientWithAuth.put(`/api/report-trainee/${id}`, update);
        return response.data.data;
    } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to update trainee.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while updating trainee.",
        rawError: error,
      };
    }
  }
}

export async function deleteTraineeService(id: number) {
    try {
        const response = await axiosClientWithAuth.delete(`/api/report-trainee/${id}`);
        return response.data.data;
    } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to delete trainee.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while deleting trainee.",
        rawError: error,
      };
    }
  }
}
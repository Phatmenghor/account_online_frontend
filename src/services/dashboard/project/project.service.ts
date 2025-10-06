import {
  AllProjectReq,
  CreateProjectReq,
  UpdateProjectReq,
} from "@/models/project/project.request";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getProjectService(request: AllProjectReq) {
  try {
    // Simulate API delay
    const response = await axiosClientWithAuth.post(
      "/api/projects/all",
      request
    );

    return response.data.data;
  } catch (error) {
    // Axios error handling (optional for mock)
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch projects.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetching projects.",
        rawError: error,
      };
    }
  }
}

export async function getAllExcelProjectService(request: AllProjectReq) {
  try {
    // Simulate API delay
    const response = await axiosClientWithAuth.post(
      "/api/projects/all-list",
      request
    );
    return response.data;
  } catch (error) {
    // Axios error handling (optional for mock)
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch projects.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetching projects.",
        rawError: error,
      };
    }
  }
}

export async function getProjectByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.get(`/api/projects/${id}`);
    return response.data.data;
  } catch (error: any) {
    // Axios error handling (optional for mock)
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch project by id.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching project by id.",
        rawError: error,
      };
    }
  }
}

export async function createProjectService(newProj: CreateProjectReq) {
  try {
    // Simulate API delay
    const response = await axiosClientWithAuth.post("/api/projects", newProj);

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to create project.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while creating project.",
        rawError: error,
      };
    }
  }
}

export async function updateProjectService(
  id: number,
  updates: UpdateProjectReq
) {
  try {
    const response = await axiosClientWithAuth.put(
      `/api/projects/${id}`,
      updates
    );

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to update project.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while updating project.",
        rawError: error,
      };
    }
  }
}

// 🗑️ delete user
export async function deleteProjectService(id: number) {
  try {
    // Simulate API delay
    const response = await axiosClientWithAuth.delete(`/api/projects/${id}`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to delete project.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while deleting project.",
        rawError: error,
      };
    }
  }
}

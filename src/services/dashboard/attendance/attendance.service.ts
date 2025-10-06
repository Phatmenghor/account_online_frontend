import {
  AllAttendancesReq,
  AttendanceApproveReq,
  AttendanceReq,
} from "@/models/attendance/attendances.request";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getAttendanceService(request: AllAttendancesReq) {
  try {
    // Simulate API delay
    const response = await axiosClientWithAuth.post(
      "/api/v1/attendance/all",
      request
    );

    return response.data.data;
  } catch (error) {
    // Axios error handling (optional for mock)
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch attendances.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching attendances.",
        rawError: error,
      };
    }
  }
}

export async function getAllListingAttendanceService(
  request: AllAttendancesReq
) {
  try {
    // Simulate API delay
    const response = await axiosClientWithAuth.post(
      "/api/v1/attendance/all-list",
      request
    );

    return response.data.data;
  } catch (error) {
    // Axios error handling (optional for mock)
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch attendances.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching attendances.",
        rawError: error,
      };
    }
  }
}

export async function getAttendancesByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.get(`/api/v1/attendance/${id}`);
    return response.data.data;
  } catch (error: any) {
    // Axios error handling (optional for mock)
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch attendance by id.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching attendance by id.",
        rawError: error,
      };
    }
  }
}

export async function createAttendanceService(newProj: AttendanceReq) {
  try {
    // Simulate API delay
    const response = await axiosClientWithAuth.post(
      "/api/v1/attendance/request",
      newProj
    );

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to create attendance.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while creating attendance.",
        rawError: error,
      };
    }
  }
}

export async function updateAttendanceService(
  id: number,
  updates: Partial<AttendanceReq>
) {
  try {
    const response = await axiosClientWithAuth.put(
      `/api/v1/attendance/${id}`,
      updates
    );

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to update attendance.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while updating attendance.",
        rawError: error,
      };
    }
  }
}

export async function approvalAttendanceService(
  id: number,
  updates: AttendanceApproveReq
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/attendance/${id}/approve`,
      updates
    );

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to approve attendance.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while approve attendance.",
        rawError: error,
      };
    }
  }
}

export async function cancelAttendanceService(id: number) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/attendance/${id}/cancel`
    );

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to cancel attendance.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while cancel attendance.",
        rawError: error,
      };
    }
  }
}

export async function getMyAttendanceService(updates: AllAttendancesReq) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/attendance/my`,
      updates
    );

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to get my attendance.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while get my attendance.",
        rawError: error,
      };
    }
  }
}

// 🗑️ delete user
export async function deleteAttendanceService(id: number) {
  try {
    // Simulate API delay
    const response = await axiosClientWithAuth.delete(
      `/api/v1/attendance/${id}`
    );
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

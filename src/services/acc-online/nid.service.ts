import { RequestIdImage, RequestValidModel } from "@/models/acc-online/nid.request.model";
import { axiosClientWithAuth} from "@/utils/axios";
import { AxiosError } from "axios";

// export async function extractNIDService(data: RequestIdImage) {
//   try {
//     const response = await createAxiosCamdx.post("/api/v1/ocr-idcard", {
//       idImage: data.idImage,
//     });

//     return response.data;
//   } catch (error: any) {
//     // Don't return null - throw the error so it can be handled properly
//     throw error;
//   }
// }
export async function extractNIDService(data: RequestIdImage) {
  try {
    const response = await axiosClientWithAuth.post("/api/v1/public/nid/extract", {
      applicationName: data.applicationName,
      idImage: data.idImage,
    });

    return response.data.data.data;
  } catch (error: any) {
    // Don't return null - throw the error so it can be handled properly
    throw error;
  }
}

// export async function extractNIDService(data: RequestIdImage) {
//   try {
//     console.log("=== SENDING REQUEST ===");
//     console.log("Application Name:", data.applicationName);
//     console.log("Image length:", data.idImage?.length);
//     console.log("Request payload:", {
//       applicationName: data.applicationName,
//       idImage: data.idImage?.substring(0, 50) + "..." // First 50 chars
//     });

//     const response = await axiosClientWithAuth.post("/api/v1/public/nid/extract", {
//       applicationName: data.applicationName,
//       idImage: data.idImage,
//     });

//     console.log("=== RESPONSE RECEIVED ===");
//     console.log("Full response:", response);
//     console.log("Response data:", response.data);

//     return response.data.data.data;
//   } catch (error: any) {
//     console.error("=== ERROR DETAILS ===");
//     console.error("Error:", error);
//     console.error("Error response:", error.response);
//     console.error("Error status:", error.response?.status);
//     console.error("Error data:", error.response?.data);
//     throw error;
//   }
// }

interface ErrorResponse {
  error: number;
  message: string;
}

interface CustomError {
  error: number;
  apiMessage: string;
  uiMessage: string;
  statusCode: string;
}

export async function validateNIDService(data: RequestValidModel) {
  try {
    const response = await axiosClientWithAuth.post(`/api/v1/public/nid/validate`, {
      applicationName: data.applicationName,
      data
    });
    return response.data.data.data;
  } catch (err) {
    const error = err as AxiosError<ErrorResponse>;
    const statusCode = error.response?.status ?? 500;
    const apiMessage =
      error.response?.data?.message ?? error.message ?? "Unknown error";
    let uiMessage = apiMessage;

    switch (statusCode) {
      case 400:
        uiMessage = `ID card not recognized by our system. Please contact management for alternative verification solution.`;
        break;
      case 420:
        uiMessage = `Request limit exceeded. Please contact technical team for assistance.`;
        break;
      case 500:
        uiMessage = `No face detected in your photo. Please take a clear photo and try again.`;
        break;
      case 501:
        uiMessage = `Unable to detect face on ID card. Please upload a clearer image of your ID.`;
        break;
      case 502:
        uiMessage = `System error occurred. Please check your NID and try again in a few minutes or contact support.`;
        break;
      case 503:
        uiMessage = `Connection issue with verification service. Please try again.`;
        break;
      case 504:
        uiMessage = `NID verification failed with CAMDX provider. Please try again later.`;
        break;
    }

    throw {
      error: error.response?.data?.error ?? 1,
      apiMessage,
      uiMessage,
      statusCode: statusCode.toString(),
    } as CustomError;
  }
}

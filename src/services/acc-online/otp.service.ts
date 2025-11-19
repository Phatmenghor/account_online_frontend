import {
  OtpSendReq,
  OtpVerifyReq,
} from "@/models/acc-online/otp/otp.request.model";
import { axiosClientWithAuth } from "@/utils/axios";

export async function sendOtpService(data: OtpSendReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/otp/send",
      data
    );

    return response.data.data;
  } catch (error: any) {
    // Don't return null - throw the error so it can be handled properly
    throw error;
  }
}

export async function verifiedOtpService(data: OtpVerifyReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/otp/verify",
      data
    );

    return response.data.data;
  } catch (error: any) {
    // Don't return null - throw the error so it can be handled properly
    throw error;
  }
}

export interface OtpSendReq {
  phone: string;
}

export interface OtpVerifyReq {
  phone: string;
  otpCode: string;
}

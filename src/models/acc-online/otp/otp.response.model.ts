export interface OtpSendModel {
  phone: string;
  message: string;
  expiresAt: string;
}

export interface OtpVerifiedModel {
  verified: boolean;
  phone: string;
  message: string;
}

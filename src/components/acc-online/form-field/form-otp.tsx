"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle } from "lucide-react";
import { AppToast } from "@/components/shared/toast/app-toast";
import { SendOtpService, VerifyOtpService } from "@/services/otp/otp.service";
import { SendOtpReq, VerifyOtpReq } from "@/models/otp/otp.request";

interface OTPInputProps {
  phoneNumber: string;
  onPhoneChange: (value: string) => void;
  onVerificationSuccess?: () => void;
  disabled?: boolean;
  phoneLabel?: string;
  otpLabel?: string;
  phonePlaceholder?: string;
  otpPlaceholder?: string;
  sendOtpText?: string;
}

export default function OTPInput({
  phoneNumber,
  onPhoneChange,
  onVerificationSuccess,
  disabled = false,
  phoneLabel = "Contact Number",
  otpLabel = "OTP Code",
  phonePlaceholder = "Contact Number",
  otpPlaceholder = "Enter 6-digit OTP",
  sendOtpText = "Send OTP",
}: OTPInputProps) {
  const [otpCode, setOtpCode] = useState<string>("");
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(false);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(0);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Auto-verify when OTP reaches 6 digits
  useEffect(() => {
    if (otpCode.length === 6 && /^\d{6}$/.test(otpCode) && !isOtpVerified) {
      handleVerifyOtp();
    }
  }, [otpCode]);

  // Validate phone number format (9-15 digits)
  const isValidPhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{9,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  // Handle phone number change
  const handlePhoneChange = (value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/\D/g, "");
    onPhoneChange(numericValue);

    // Reset OTP states when phone number changes
    if (numericValue !== phoneNumber) {
      setIsOtpSent(false);
      setIsOtpVerified(false);
      setOtpCode("");
      setOtpExpiresAt("");
      setCountdown(0);
    }
  };

  // Auto-send OTP when user leaves phone input (blur)
  const handlePhoneBlur = async () => {
    if (!phoneNumber.trim()) return;
    
    if (isOtpVerified) return; // Don't send if already verified
    
    if (countdown > 0) return; // Don't send if countdown is active

    if (isValidPhoneNumber(phoneNumber)) {
      await handleSendOtp();
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      AppToast({
        type: "error",
        message: "Phone Number Required",
        description: "Please enter a phone number first",
      });
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      AppToast({
        type: "error",
        message: "Invalid Phone Number",
        description: "Please enter a valid phone number (9-15 digits)",
      });
      return;
    }

    if (countdown > 0) {
      AppToast({
        type: "warning",
        message: "Please Wait",
        description: `You can resend OTP in ${countdown} seconds`,
      });
      return;
    }

    setIsSendingOtp(true);
    try {
      const requestData: SendOtpReq = {
        phone: phoneNumber.replace(/\s/g, ""),
      };

      const response = await SendOtpService(requestData);

      setIsOtpSent(true);
      setOtpExpiresAt(response.expiresAt);
      setCountdown(60); // Set countdown to 60 seconds
      setOtpCode(""); // Clear previous OTP

      AppToast({
        type: "success",
        message: "OTP Sent Successfully",
        description: `OTP has been sent to ${phoneNumber}`,
      });
    } catch (error: any) {
      console.error("Failed to send OTP:", error);
      AppToast({
        type: "error",
        message: "Failed to Send OTP",
        description:
          error.response?.data?.message ||
          error.message ||
          "Please try again",
      });
      setIsOtpSent(false);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (value: string) => {
    // Only allow numeric input and max 6 digits
    const numericValue = value.replace(/\D/g, "").slice(0, 6);
    setOtpCode(numericValue);
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      AppToast({
        type: "error",
        message: "OTP Required",
        description: "Please enter the OTP code",
      });
      return;
    }

    if (otpCode.length !== 6) {
      AppToast({
        type: "error",
        message: "Invalid OTP",
        description: "OTP must be 6 digits",
      });
      return;
    }

    if (!isOtpSent) {
      AppToast({
        type: "error",
        message: "OTP Not Sent",
        description: "Please request an OTP first",
      });
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const requestData: VerifyOtpReq = {
        phone: phoneNumber.replace(/\s/g, ""),
        otpCode: otpCode,
      };

      const response = await VerifyOtpService(requestData);

      if (response.verified) {
        setIsOtpVerified(true);
        setCountdown(0); // Stop countdown on success
        AppToast({
          type: "success",
          message: "OTP Verified Successfully",
          description: "Your phone number has been verified",
        });

        // Call success callback if provided
        if (onVerificationSuccess) {
          onVerificationSuccess();
        }
      } else {
        AppToast({
          type: "error",
          message: "Verification Failed",
          description: response.message || "Invalid OTP code",
        });
        setOtpCode(""); // Clear invalid OTP
      }
    } catch (error: any) {
      console.error("Failed to verify OTP:", error);
      AppToast({
        type: "error",
        message: "Verification Failed",
        description:
          error.response?.data?.message ||
          error.message ||
          "Invalid OTP code",
      });
      setIsOtpVerified(false);
      setOtpCode(""); // Clear invalid OTP
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Reset function (can be called from parent)
  const reset = () => {
    setOtpCode("");
    setIsOtpSent(false);
    setIsOtpVerified(false);
    setOtpExpiresAt("");
    setCountdown(0);
  };

  // Expose reset method
  useEffect(() => {
    (window as any).otpInputReset = reset;
  }, []);

  return (
    <>
      {/* Contact Number */}
      <div>
        <label className="text-base font-medium text-gray-700 block mb-1">
          {phoneLabel}
          {isOtpVerified && (
            <span className="float-right text-green-600 text-sm flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Verified
            </span>
          )}
        </label>
        <div className="relative">
          <Input
            placeholder={phonePlaceholder}
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onBlur={handlePhoneBlur}
            className="w-full h-10"
            disabled={disabled || isSendingOtp}
            maxLength={15}
          />
          {isSendingOtp && (
            <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-blue-600" />
          )}
          {isOtpVerified && !isSendingOtp && (
            <CheckCircle className="absolute right-3 top-2.5 h-5 w-5 text-green-600" />
          )}
        </div>
      </div>

      {/* OTP Code */}
      <div>
        <label className="text-base font-medium text-gray-700 block mb-1">
          {otpLabel}
          <button
            type="button"
            onClick={handleSendOtp}
            className={`float-right text-sm border-b-2 ${
              countdown > 0 || disabled || isSendingOtp || isOtpVerified || !phoneNumber
                ? "text-gray-400 border-gray-400 cursor-not-allowed"
                : "text-blue-600 border-blue-600 hover:text-blue-700 cursor-pointer"
            }`}
            disabled={countdown > 0 || disabled || isSendingOtp || !phoneNumber}
          >
            {countdown > 0 
              ? `${isOtpSent ? "Resend" : sendOtpText} (${countdown}s)` 
              : isOtpSent 
                ? "Resend OTP" 
                : sendOtpText
            }
          </button>
        </label>
        <div className="relative">
          <Input
            placeholder={otpPlaceholder}
            value={otpCode}
            onChange={(e) => handleOtpChange(e.target.value)}
            maxLength={6}
            className="w-full h-10"
            disabled={disabled || !isOtpSent || isVerifyingOtp}
          />
          {isVerifyingOtp && (
            <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-blue-600" />
          )}
          {isOtpVerified && !isVerifyingOtp && (
            <CheckCircle className="absolute right-3 top-2.5 h-5 w-5 text-green-600" />
          )}
        </div>
        {/* {isOtpSent && !isOtpVerified && otpExpiresAt && (
          <p className="text-xs text-gray-500 mt-1">
            OTP expires at: {new Date(otpExpiresAt).toLocaleTimeString()}
          </p>
        )} */}
      </div>
    </>
  );
}
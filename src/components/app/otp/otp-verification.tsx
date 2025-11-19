import {
  RequestOtpFn,
  useOtpVerification,
  VerifyOtpFn,
} from "@/hooks/use-otp-verification";
import React from "react";

interface Props {
  requestOtp: RequestOtpFn;
  verifyOtp: VerifyOtpFn;
}

export const OtpVerification: React.FC<Props> = ({ requestOtp, verifyOtp }) => {
  const {
    phone,
    updatePhone,
    isPhoneValid,
    isSending,
    otp,
    handleOtpChange,
    resendOtp,
    expiresIn,
    error,
  } = useOtpVerification(requestOtp, verifyOtp, {
    otpLength: 6,
    otpValiditySec: 120,
    autoSendOnce: true,
  });

  const formatTime = (s: number) => {
    if (!s || s <= 0) return "";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* Phone Field */}
      <div>
        <label className="text-base font-medium text-gray-700 mb-1 block">
          លេខទូរស័ព្ទប្រើប្រាស់
        </label>
        <div className="relative">
          <input
            value={phone}
            onChange={(e) => updatePhone(e.target.value)}
            placeholder="0885716301"
            className={`w-full border rounded-md p-3 ${
              isPhoneValid ? "border-green-500" : "border-gray-300"
            }`}
            maxLength={13}
            disabled={isSending}
          />
          {isPhoneValid && (
            <span className="absolute right-3 top-3 text-green-600">✔︎</span>
          )}
        </div>
      </div>

      {/* OTP Field */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-base font-medium text-gray-700">
            លេខ PIN សម្ងាត់
          </label>
          <button
            type="button"
            onClick={resendOtp}
            disabled={!isPhoneValid || isSending || expiresIn > 0}
            className="text-blue-600 text-sm disabled:opacity-50"
          >
            ផ្ញើសារម្ដងទៀត {expiresIn > 0 ? `(${formatTime(expiresIn)})` : ""}
          </button>
        </div>

        <input
          value={otp.join("")}
          onChange={(e) => handleOtpChange(e.target.value, 0)}
          maxLength={6}
          placeholder="បញ្ចូលលេខកូដ OTP"
          className={`w-full border rounded-md p-3 text-lg tracking-widest ${
            error ? "border-red-400" : "border-gray-300"
          }`}
          inputMode="numeric"
        />

        {error && (
          <p className="mt-2 text-red-600 text-sm">
            សូមបញ្ចូលលេខកូដ OTP ដែលបានផ្ញើទៅអ្នក។
            <br />
            <span className="font-semibold">❗ {error}</span>
          </p>
        )}
      </div>
    </>
  );
};

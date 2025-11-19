import { useEffect, useRef, useState } from "react";

export type RequestOtpFn = (
  phone: string
) => Promise<{ success: boolean; expiresInSec?: number; message?: string }>;
export type VerifyOtpFn = (
  phone: string,
  otp: string
) => Promise<{ success: boolean; message?: string }>;

interface UseOtpOptions {
  otpLength?: number;
  otpValiditySec?: number; // default server expiry fallback
  autoSendOnce?: boolean; // true = send only once when reaching 10 digits
}

export const useOtpVerification = (
  requestOtp: RequestOtpFn,
  verifyOtp: VerifyOtpFn,
  options: UseOtpOptions = {}
) => {
  const { otpLength = 6, otpValiditySec = 120, autoSendOnce = true } = options;

  const [phone, setPhone] = useState("");
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  const [otp, setOtp] = useState<string[]>(Array(otpLength).fill(""));
  const inputsRef = useRef<HTMLInputElement[]>([]);
  const [attempts, setAttempts] = useState<Record<string, number>>({});

  const [sentOnceForPhone, setSentOnceForPhone] = useState<
    Record<string, boolean>
  >({}); // track sent per phone
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [expiresIn, setExpiresIn] = useState(0); // seconds left until OTP expiry
  const expiresRef = useRef<number>(0);

  const [error, setError] = useState<string | null>(null); // show error messages (expired, invalid, etc.)
  const [success, setSuccess] = useState(false);

  // validate Cambodia phone: 0######### (10 digits) or +855######## (9+? but requirement was 10 digits)
  const validatePhone = (val: string) => {
    const cleaned = val.replace(/\s|-/g, "");
    // accept 10 digits starting with 0 (e.g. 0885716301)
    return /^\d{10}$/.test(cleaned) || /^\+855\d{8}$/.test(cleaned);
  };

  // Update phone (only numeric allowed except leading +)
  const updatePhone = (raw: string) => {
    let cleaned = raw.trim();
    // allow leading + then digits OR digits only
    if (cleaned.startsWith("+")) {
      cleaned = "+" + cleaned.slice(1).replace(/\D/g, "");
    } else {
      cleaned = cleaned.replace(/\D/g, "");
    }
    setPhone(cleaned);
    setIsPhoneValid(validatePhone(cleaned));
  };

  // auto-send OTP once when phone reaches 10 digits
  useEffect(() => {
    const cleaned = phone.replace(/\D/g, "");
    const shouldTrigger = cleaned.length === 10; // the condition you specified
    if (!shouldTrigger) return;

    // if autoSendOnce is true, check sentOnceForPhone
    if (autoSendOnce && sentOnceForPhone[phone]) return;

    // send OTP
    const doSend = async () => {
      setIsSending(true);
      setError(null);
      try {
        const res = await requestOtp(phone);
        if (res.success) {
          // set expiry: prefer server reported expiry, fallback to otpValiditySec
          const expiry = res.expiresInSec ?? otpValiditySec;
          setExpiresIn(expiry);
          expiresRef.current = expiry;
          setSentOnceForPhone((prev) => ({ ...prev, [phone]: true }));
        } else {
          setError(res.message ?? "Failed to send OTP");
        }
      } catch (e) {
        setError((e as Error).message || "Failed to send OTP");
      } finally {
        setIsSending(false);
      }
    };

    doSend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]); // only depends on phone; auto-send once guarded internally

  // expiry countdown
  useEffect(() => {
    let t: NodeJS.Timeout | null = null;
    if (expiresIn > 0) {
      t = setInterval(() => {
        expiresRef.current -= 1;
        setExpiresIn(expiresRef.current);
        if (expiresRef.current <= 0) {
          if (t) clearInterval(t);
          setError("OTP code has expired");
        }
      }, 1000);
    }
    return () => {
      if (t) clearInterval(t);
    };
  }, [expiresIn]);

  // OTP inputs helpers
  const handleOtpChange = (value: string, idx: number) => {
    if (!/^\d*$/.test(value)) return;
    const copy = [...otp];
    copy[idx] = value;
    setOtp(copy);
    // focus next
    if (value && idx < otpLength - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Backspace" && otp[idx] === "" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) inputsRef.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < otpLength - 1)
      inputsRef.current[idx + 1]?.focus();
  };

  const clearOtp = () => {
    setOtp(Array(otpLength).fill(""));
    setError(null);
    setSuccess(false);
  };

  const getOtpValue = () => otp.join("");

  // verify OTP
  const submitOtp = async () => {
    const value = getOtpValue();
    if (value.length < otpLength) {
      setError("Please enter full OTP");
      return;
    }

    setIsVerifying(true);
    setError(null);
    try {
      const res = await verifyOtp(phone, value);
      if (res.success) {
        setSuccess(true);
        setAttempts((prev) => ({ ...prev, [phone]: 0 }));
      } else {
        setError(res.message ?? "Invalid OTP");
        setAttempts((prev) => ({
          ...prev,
          [phone]: (prev[phone] ?? 0) + 1,
        }));
        if ((attempts[phone] ?? 0) + 1 >= 3) {
          setError("Too many attempts. Please wait 5 minutes.");
        }
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // resend logic (user clicks blue link)
  const resendOtp = async () => {
    // allow resend even if expired; reset otp inputs
    clearOtp();
    setIsSending(true);
    setError(null);
    try {
      const res = await requestOtp(phone);
      if (res.success) {
        const expiry = res.expiresInSec ?? otpValiditySec;
        setExpiresIn(expiry);
        expiresRef.current = expiry;
        // mark sent
        setSentOnceForPhone((prev) => ({ ...prev, [phone]: true }));
      } else {
        setError(res.message ?? "Failed to resend OTP");
      }
    } catch (e) {
      setError((e as Error).message || "Failed to resend OTP");
    } finally {
      setIsSending(false);
    }
  };

  return {
    phone,
    updatePhone,
    isPhoneValid,
    isSending,
    sentOnceForPhone,
    otp,
    inputsRef,
    handleOtpChange,
    handleOtpKeyDown,
    submitOtp,
    resendOtp,
    expiresIn,
    error,
    success,
    clearOtp,
    getOtpValue,
    isVerifying,
  };
};

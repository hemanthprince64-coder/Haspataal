'use client';

import { useState, useEffect, useActionState, startTransition } from 'react';

export type ActionResult = {
  success?: boolean;
  message?: string;
  data?: unknown;
  error?: string;
};

export interface UseOtpVerificationOptions {
  requestAction: (prevState: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  verifyAction: (prevState: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  initialState?: ActionResult;
  initialPhone?: string;
  onPhoneChange?: (phone: string) => void;
}

export function useOtpVerification({
  requestAction,
  verifyAction,
  initialState = { message: '' },
  initialPhone = '',
  onPhoneChange,
}: UseOtpVerificationOptions) {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhoneState] = useState(initialPhone);
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  // We use useActionState for the verify step
  const [verifyState, verifyFormAction, isVerifying] = useActionState(verifyAction, initialState);

  // For the request step, we can use a custom state
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestError, setRequestError] = useState('');

  useEffect(() => {
    if (phone) {
      const storedTime = localStorage.getItem(`otp_cooldown_${phone}`);
      if (storedTime) {
        const remaining = Math.floor((parseInt(storedTime) - Date.now()) / 1000);
        if (remaining > 0) setCountdown(remaining);
      }
    }
  }, [phone]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (countdown > 0) return;

    setIsRequesting(true);
    setRequestError('');

    const fd = new FormData();
    fd.append('mobile', phone);

    try {
      const res = await requestAction(null, fd);
      if (res.success) {
        const newExpiry = Date.now() + 60 * 1000;
        localStorage.setItem(`otp_cooldown_${phone}`, newExpiry.toString());
        setCountdown(60);
        setStep(2);
      } else {
        setRequestError(res.message || 'Failed to request OTP');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setRequestError(err.message || 'An unexpected error occurred');
      } else {
        setRequestError('An unexpected error occurred');
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const setPhone = (newPhone: string) => {
    setPhoneState(newPhone);
    if (onPhoneChange) onPhoneChange(newPhone);
  };

  const handleOtpChange = (code: string) => {
    setOtp(code);
    if (code.length === 6) {
      // Auto-submit when 6 digits are reached
      const fd = new FormData();
      fd.append('mobile', phone);
      fd.append('otp', code);
      startTransition(() => {
        verifyFormAction(fd);
      });
    }
  };

  const changePhone = () => {
    setStep(1);
    setOtp('');
    // Optionally clear any errors
    setRequestError('');
  };

  return {
    step,
    phone,
    setPhone,
    otp,
    handleOtpChange,
    countdown,
    isRequesting,
    requestError,
    handleRequestOtp,
    verifyState,
    verifyFormAction,
    isVerifying,
    changePhone,
  };
}

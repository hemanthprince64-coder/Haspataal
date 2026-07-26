import { z } from 'zod';

export const OtpRequestSchema = z.object({
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
});

export const OtpVerifySchema = z.object({
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

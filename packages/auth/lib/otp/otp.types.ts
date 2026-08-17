export enum OtpPurpose {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  PASSWORD_RESET = 'PASSWORD_RESET',
  CHANGE_PHONE = 'CHANGE_PHONE',
  PATIENT_LOGIN = 'PATIENT_LOGIN',
  DOCTOR_LOGIN = 'DOCTOR_LOGIN',
  HOSPITAL_LOGIN = 'HOSPITAL_LOGIN',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  CONSENT = 'CONSENT',
  PRESCRIPTION_SIGN = 'PRESCRIPTION_SIGN',
  HIGH_RISK_ACTION = 'HIGH_RISK_ACTION',
  APPOINTMENT_CONFIRMATION = 'APPOINTMENT_CONFIRMATION',
}

export interface SendOtpRequest {
  phone: string;
  purpose: OtpPurpose;
  tenantId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
  purpose: OtpPurpose;
  tenantId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface OtpResult {
  success: boolean;
  message?: string;
  code?: string; // Only returned in dev environments
  expiresAt?: Date;
  user?: any; // To be mapped by calling services
}

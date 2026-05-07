'use server';

import { z } from 'zod';
import { services } from '@/lib/services';
import { createSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { UserRole } from '@/types';
import logger from '@/lib/logger';

// ── Types ────────────────────────────────────────────────────

type ActionResponse<T = any> = 
  | { success: true; data: T }
  | { success: false; error: string; code: string };

// ── Validation Schemas ────────────────────────────────────────

export const IndianMobileRegex = /^[6-9]\d{9}$/;

export const RegisterHospitalSchema = z.object({
  name: z.string().min(2, "Hospital name too short"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(IndianMobileRegex, "Invalid Indian mobile number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
});

export const RegisterAgentSchema = z.object({
  name: z.string().min(2, "Name too short"),
  mobile: z.string().regex(IndianMobileRegex, "Invalid Indian mobile number"),
  email: z.string().email("Invalid email address"),
  referralCode: z.string().optional(),
});

export const LoginSchema = z.object({
  identifier: z.string().min(1, "Identifier is required"),
  password: z.string().min(1, "Password is required"),
});

export const BookAppointmentSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
  doctorId: z.string().uuid("Invalid doctor ID"),
  date: z.coerce.date().refine((d) => d > new Date(), "Date must be in the future"),
  slot: z.string().min(1, "Slot is required"),
  hospitalId: z.string().uuid("Invalid hospital ID"),
});

export const AffiliationActionSchema = z.object({
  affiliationId: z.string().uuid("Invalid affiliation ID"),
  reason: z.string().optional(),
});

// ── Server Actions ───────────────────────────────────────────

/** Register a new hospital and its primary admin */
export async function registerHospital(input: unknown): Promise<ActionResponse> {
  const result = RegisterHospitalSchema.safeParse(input);
  if (!result.success) {
    return { 
      success: false, 
      error: result.error.errors[0]?.message || "Validation failed", 
      code: "VALIDATION_ERROR" 
    };
  }

  try {
    const data = result.data;
    const hospital = await services.hospital.register({
      hospitalName: data.name,
      city: data.city,
      adminName: "Primary Admin", // Default placeholder for primary admin name
      mobile: data.phone,
      password: data.password,
    });

    await createSession('session_user', {
      user: {
        id: hospital.id,
        name: hospital.legalName,
        role: UserRole.HOSPITAL_ADMIN,
        hospitalId: hospital.id,
      }
    });

    return { success: true, data: hospital };
  } catch (e: any) {
    logger.error({ action: 'registerHospital', error: e.message });
    return { success: false, error: e.message, code: "REGISTRATION_FAILED" };
  }
}

/** Register a new referral agent */
export async function registerAgent(input: unknown): Promise<ActionResponse> {
  const result = RegisterAgentSchema.safeParse(input);
  if (!result.success) {
    return { 
      success: false, 
      error: result.error.errors[0]?.message || "Validation failed", 
      code: "VALIDATION_ERROR" 
    };
  }

  try {
    const agent = await services.agent.register(result.data);
    return { success: true, data: agent };
  } catch (e: any) {
    logger.error({ action: 'registerAgent', error: e.message });
    return { success: false, error: e.message, code: "AGENT_REGISTRATION_FAILED" };
  }
}

/** Generic login handler for different roles */
async function performLogin(input: unknown, role: UserRole, sessionKey: string): Promise<ActionResponse> {
  const result = LoginSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }

  try {
    const { identifier, password } = result.data;
    let loginResult;

    if (role === UserRole.HOSPITAL_ADMIN) {
      loginResult = await services.hospital.login(identifier, password);
    } else if (role === UserRole.AGENT) {
      loginResult = await services.agent.login(identifier, password);
    } else {
      loginResult = await services.patient.login(identifier, password);
    }

    if (!loginResult) {
      return { success: false, error: "Invalid credentials", code: "AUTH_FAILED" };
    }

    await createSession(sessionKey, loginResult);
    return { success: true, data: loginResult };
  } catch (e: any) {
    return { success: false, error: e.message, code: "LOGIN_ERROR" };
  }
}

export const hospitalLogin = (input: unknown) => performLogin(input, UserRole.HOSPITAL_ADMIN, 'session_user');
export const agentLogin = (input: unknown) => performLogin(input, UserRole.AGENT, 'session_agent');
export const patientLogin = (input: unknown) => performLogin(input, UserRole.PATIENT, 'session_patient');

/** Book a new appointment */
export async function bookAppointment(input: unknown): Promise<ActionResponse> {
  const result = BookAppointmentSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message || "Validation failed", code: "VALIDATION_ERROR" };
  }

  try {
    const data = result.data;
    const appointment = await services.patient.createVisit(data.hospitalId, {
      patientMobile: "", // Injected from session in real impl
      patientName: "",
      doctorId: data.doctorId,
      date: data.date.toISOString(),
      slot: data.slot,
    });

    return { success: true, data: appointment };
  } catch (e: any) {
    return { success: false, error: e.message, code: "BOOKING_FAILED" };
  }
}

/** Approve a doctor's affiliation request */
export async function approveDoctorAffiliation(input: unknown): Promise<ActionResponse> {
  const result = AffiliationActionSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message || "Validation failed", code: "VALIDATION_ERROR" };
  }

  try {
    const affiliation = await services.hospital.approveDoctorAffiliation(result.data.affiliationId);
    return { success: true, data: affiliation };
  } catch (e: any) {
    return { success: false, error: e.message, code: "APPROVAL_FAILED" };
  }
}

/** Reject a doctor's affiliation request with a reason */
export async function rejectDoctorAffiliation(input: unknown): Promise<ActionResponse> {
  const result = AffiliationActionSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message || "Validation failed", code: "VALIDATION_ERROR" };
  }

  try {
    const affiliation = await services.hospital.rejectDoctorAffiliation(
      result.data.affiliationId, 
      result.data.reason
    );
    return { success: true, data: affiliation };
  } catch (e: any) {
    return { success: false, error: e.message, code: "REJECTION_FAILED" };
  }
}

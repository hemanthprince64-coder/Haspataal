import { z } from 'zod';

export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  HOSPITAL_ADMIN = 'HOSPITAL_ADMIN',
  AGENT = 'AGENT',
  PLATFORM_ADMIN = 'SUPER_ADMIN',
}

export interface SessionUser {
  id: string;
  name: string;
  role: UserRole;
  hospitalId?: string;
  patientId?: string;
  mobile?: string;
}

export enum BookingStatus {
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  BOOKED = 'BOOKED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Allowed state-machine transitions for appointments.
 * Exported here so use-cases and services share one source of truth.
 */
export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  [BookingStatus.BOOKED]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  [BookingStatus.CANCELLED]: [],
  [BookingStatus.COMPLETED]: [],
};

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

// ── Interfaces ───────────────────────────────────────────────

export interface HospitalsMaster {
  id: string;
  legalName: string;
  displayName?: string | null;
  registrationNumber: string;
  hospitalType?: string | null;
  city?: string | null;
  state?: string | null;
  contactNumber?: string | null;
  verificationStatus: string;
  accountStatus: string;
  facilities?: HospitalFacilities | null;
  // added for frontend convenience
  name?: string;
  addressLine1?: string | null;
  area?: string;
  rating?: string;
  avgRating?: string;
  doctorCount?: number;
  reviews?: any[];
}
export type Hospital = HospitalsMaster;
export type HospitalPublic = Omit<Hospital, 'password'>;

export interface HospitalFacilities {
  icuAvailable: boolean;
  emergency24x7: boolean;
  ambulanceAvailable: boolean;
  pharmacyAvailable: boolean;
}

export interface Doctor {
  id: string;
  fullName: string;
  gender?: string | null;
  mobile: string;
  email: string;
  profilePhotoUrl?: string | null;
  kycStatus: string;
  accountStatus: string;
  // Computed/Frontend properties
  name?: string;
  speciality?: string;
  hospitalId?: string;
  fee?: number;
  experience?: number;
  hospital?: any;
  affiliations?: any[];
  reviews?: any[];
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  slot: string;
  status: BookingStatus;
  notes?: string | null;
}

export interface Review {
  id: string;
  patientId: string;
  doctorId?: string | null;
  hospitalId?: string | null;
  rating: number;
  comment?: string | null;
  createdAt: Date;
}

import { z } from 'zod';

export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  HOSPITAL_ADMIN = 'HOSPITAL_ADMIN',
  AGENT = 'AGENT',
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  RECEPTIONIST = 'RECEPTIONIST',
  BILLING = 'BILLING',
  PHARMACIST = 'PHARMACIST',
  LAB_TECH = 'LAB_TECH',
  NURSE = 'NURSE',
  STAFF = 'STAFF',
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
  name: z.string().min(2, 'Hospital name too short'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(IndianMobileRegex, 'Invalid Indian mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
});

export const RegisterAgentSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  mobile: z.string().regex(IndianMobileRegex, 'Invalid Indian mobile number'),
  email: z.string().email('Invalid email address'),
  referralCode: z.string().optional(),
});

export const LoginSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  password: z.string().min(1, 'Password is required'),
});

export const BookAppointmentSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  doctorId: z.string().uuid('Invalid doctor ID'),
  date: z.coerce.date().refine((d) => d > new Date(), 'Date must be in the future'),
  slot: z.string().min(1, 'Slot is required'),
  hospitalId: z.string().uuid('Invalid hospital ID'),
});

export const AffiliationActionSchema = z.object({
  affiliationId: z.string().uuid('Invalid affiliation ID'),
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

// ============================================================
// PHASE 1 FOUNDATION TYPES
// ============================================================

// Doctor Identity Types
export interface DoctorProfile {
  id: string;
  doctorId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender?: string;
  dob?: Date;
  photoUrl?: string;
  languages: string[];
  bio?: string;
  designation?: string;
}

export interface DoctorEducation {
  id: string;
  doctorId: string;
  degreeType: 'MBBS' | 'MD' | 'MS' | 'DM' | 'MCH' | 'DNB_SS' | 'DIPLOMA';
  degreeName: string;
  collegeName: string;
  universityName?: string;
  country?: string;
  year?: number;
  registrationNumber?: string;
}

export interface DoctorCertification {
  id: string;
  doctorId: string;
  courseName: string;
  authority?: string;
  certificateNo?: string;
  expiryDate?: Date;
}

export interface DoctorSkill {
  id: string;
  doctorId: string;
  skillName: string;
  skillLevel?: string;
  certifiedDate?: Date;
}

export interface DoctorVerification {
  id: string;
  doctorId: string;
  status: 'DOCUMENT_PENDING' | 'UNDER_VERIFICATION' | 'VERIFIED' | 'REJECTED';
  verifiedBy?: string;
  verifiedAt?: Date;
  rejectionReason?: string;
  notes?: string;
}

// Patient Clinical Data Types
export interface TimelineEvent {
  id: string;
  hospitalId?: string;
  patientId: string;
  eventType: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  actorType?: string;
  actorId?: string;
}

export interface PatientSummary {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  allergies: string[];
  chronicDiseases: string[];
  currentMedications: string[];
  recentVisits: any[];
  alerts: string[];
}

export interface Consent {
  id: string;
  patientGlobalId: string;
  hospitalId: string;
  consentType:
    | 'CLINICAL_CARE'
    | 'AI_ASSISTANT'
    | 'RECORD_SHARING'
    | 'RESEARCH'
    | 'NOTIFICATIONS'
    | 'EMERGENCY_OVERRIDE';
  version: number;
  isActive: boolean;
  createdAt: Date;
  withdrawnAt?: Date;
}

// Hospital Onboarding Types
export interface HospitalSetup {
  legalName: string;
  displayName?: string;
  registrationNumber: string;
  gstNumber?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
  };
  branding?: {
    logoUrl?: string;
    brandColor?: string;
  };
  admin?: {
    fullName: string;
    email: string;
    mobile: string;
    password: string;
  };
}

// Doctor Discovery Types
export interface DoctorSearchIndex {
  id: string;
  doctorId: string;
  fullName: string;
  specialties: string[];
  departments: string[];
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  avgRating: number;
  reviewCount: number;
  experienceYears?: number;
  isActive: boolean;
  lastIndexedAt: Date;
}

export interface DoctorPublicProfile {
  id: string;
  doctorId: string;
  fullName: string;
  qualifications: string[];
  specialties: string[];
  superSpecialties: string[];
  yearsExperience?: number;
  languages: string[];
  consultationFee?: number;
  availableToday: boolean;
  nextAvailableSlot?: Date;
  availabilityStatus:
    | 'AVAILABLE'
    | 'LIMITED_SLOTS'
    | 'FULLY_BOOKED'
    | 'ON_LEAVE'
    | 'OFFLINE'
    | 'EMERGENCY_ONLY';
  verificationStatus: string;
  hospitalCount: number;
}

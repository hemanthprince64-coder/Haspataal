// ============================================================
// @haspataal/types — Shared type definitions for all Haspataal apps
// ============================================================

// ── Enums ────────────────────────────────────────────────────

export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  HOSPITAL_ADMIN = 'HOSPITAL_ADMIN',
  AGENT = 'AGENT',
  SUPER_ADMIN = 'SUPER_ADMIN',
  RECEPTIONIST = 'RECEPTIONIST',
  BILLING = 'BILLING',
  PHARMACIST = 'PHARMACIST',
  LAB_TECH = 'LAB_TECH',
  NURSE = 'NURSE',
  STAFF = 'STAFF',
}

export enum BookingStatus {
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  BOOKED = 'BOOKED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum KycStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// ── Domain Interfaces ────────────────────────────────────────

export interface HospitalFacilities {
  icuAvailable: boolean;
  emergency24x7: boolean;
  ambulanceAvailable: boolean;
  pharmacyAvailable: boolean;
}

export interface Hospital {
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
  // Computed/frontend convenience
  name?: string;
  addressLine1?: string | null;
  area?: string;
  rating?: string;
  avgRating?: string;
  doctorCount?: number;
  reviews?: Review[];
}

/** @deprecated Use Hospital instead */
export type HospitalsMaster = Hospital;

export interface Doctor {
  id: string;
  fullName: string;
  gender?: string | null;
  mobile: string;
  email: string;
  profilePhotoUrl?: string | null;
  kycStatus: string;
  accountStatus: string;
  // Computed/frontend properties
  name?: string;
  speciality?: string;
  hospitalId?: string;
  fee?: number;
  experience?: number;
  hospital?: unknown;
  affiliations?: unknown[];
  reviews?: Review[];
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  hospitalId?: string | null;
  date: Date;
  slot: string;
  status: BookingStatus;
  notes?: string | null;
  createdAt?: Date;
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

export interface Patient {
  id: string;
  name: string | null;
  phone: string;
  email?: string | null;
  gender?: string | null;
  dob?: Date | null;
  bloodGroup?: string | null;
  city?: string | null;
}

// ── API Response Types ───────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  meta?: {
    cursor?: string | null;
    hasMore?: boolean;
    total?: number;
  };
}

// ── Auth Types ───────────────────────────────────────────────

export interface SessionUser {
  id: string;
  name: string;
  role: UserRole | string;
  mobile?: string;
  hospitalId?: string;
  status?: string;
}

export interface SessionPayload {
  user: SessionUser;
  exp?: number;
  iat?: number;
}

// ── Booking State Machine ────────────────────────────────────

export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  [BookingStatus.BOOKED]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  [BookingStatus.CANCELLED]: [],
  [BookingStatus.COMPLETED]: [],
};

// ── City Metadata ────────────────────────────────────────────

export interface City {
  id: string;
  name: string;
  state: string;
}

export const CITIES: City[] = [
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra' },
  { id: 'delhi', name: 'Delhi', state: 'Delhi NCR' },
  { id: 'bangalore', name: 'Bangalore', state: 'Karnataka' },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana' },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu' },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal' },
  { id: 'pune', name: 'Pune', state: 'Maharashtra' },
  { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat' },
];
export * from './authorization';

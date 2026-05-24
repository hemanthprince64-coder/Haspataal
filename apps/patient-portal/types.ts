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

export interface Hospital {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface HospitalPublic {
  id: string;
  name?: string;
  legalName?: string;
  displayName?: string;
  city?: string;
  state?: string;
  verificationStatus?: string;
  accountStatus?: string;
  registrationNumber?: string;
  medicalCouncilNumber?: string;
  googleLocationUrl?: string;
  approvalDocumentUrl?: string;
}

export interface Doctor {
  id: string;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  specialization?: string;
  experience?: number;
  hospitalId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  affiliations?: unknown[];
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  hospitalId: string;
  date: Date;
  time: string;
  status: BookingStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  patientId: string;
  doctorId: string;
  hospitalId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

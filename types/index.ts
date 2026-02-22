export enum UserRole {
    PATIENT = 'PATIENT',
    DOCTOR = 'DOCTOR',
    HOSPITAL_ADMIN = 'HOSPITAL_ADMIN',
    PLATFORM_ADMIN = 'SUPER_ADMIN'
}

export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
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
    // added for frontend convenience
    name?: string;
    addressLine1?: string | null;
    area?: string;
    rating?: string;
    avgRating?: string;
    doctorCount?: number;
    reviews?: any[];
}

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

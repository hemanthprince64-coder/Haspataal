import { HospitalPublic } from '../types';

export function toHospitalPublic(hospital: Record<string, unknown>): HospitalPublic {
  return {
    id: hospital.id as string,
    name: (hospital.name || hospital.displayName || hospital.legalName) as string,
    legalName: hospital.legalName as string,
    displayName: hospital.displayName as string,
    city: hospital.city as string,
    state: hospital.state as string,
    verificationStatus: hospital.verificationStatus as 'verified' | 'unverified' | 'pending',
    accountStatus: hospital.accountStatus as 'active' | 'suspended' | 'pending',
    registrationNumber: hospital.registrationNumber as string | undefined,
    medicalCouncilNumber: hospital.medicalCouncilNumber as string | undefined,
    googleLocationUrl: hospital.googleLocationUrl as string | undefined,
    approvalDocumentUrl: hospital.approvalDocumentUrl as string | undefined,
  };
}

export function cn(...inputs: (string | undefined | null | boolean)[]): string {
  return inputs.filter(Boolean).join(' ');
}

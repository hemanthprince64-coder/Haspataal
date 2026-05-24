import { Hospital, HospitalPublic } from '../types';

export function toHospitalPublic(hospital: any): HospitalPublic {
  return {
    id: hospital.id,
    name: hospital.name || hospital.displayName || hospital.legalName,
    legalName: hospital.legalName,
    displayName: hospital.displayName,
    city: hospital.city,
    state: hospital.state,
    verificationStatus: hospital.verificationStatus,
    accountStatus: hospital.accountStatus,
    registrationNumber: hospital.registrationNumber,
    medicalCouncilNumber: hospital.medicalCouncilNumber,
    googleLocationUrl: hospital.googleLocationUrl,
    approvalDocumentUrl: hospital.approvalDocumentUrl,
  };
}

export function cn(...inputs: (string | undefined | null | boolean)[]): string {
  return inputs.filter(Boolean).join(' ');
}

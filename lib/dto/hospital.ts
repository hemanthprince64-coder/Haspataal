// ============================================================
// Hospital Safe DTO — Strips password and sensitive fields
// ============================================================
// EVERY function that returns hospital data to the client MUST
// use toHospitalSafeDto() to prevent password hash leakage.
// ============================================================

export interface HospitalSafeDto {
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
  addressLine1?: string | null;
  officialEmail?: string | null;
  logoUrl?: string | null;
  createdAt?: Date;
}

/**
 * Strips password, internal IDs, and sensitive fields from a Hospital object.
 * Use this before returning ANY hospital data to API responses or client components.
 */
export function toHospitalSafeDto<T extends Record<string, any>>(hospital: T): HospitalSafeDto {
  const { password, adminUserId, ...safe } = hospital;
  return safe as unknown as HospitalSafeDto;
}

/**
 * Batch version of toHospitalSafeDto for arrays.
 */
export function toHospitalSafeDtoArray<T extends Record<string, any>>(
  hospitals: T[],
): HospitalSafeDto[] {
  return hospitals.map(toHospitalSafeDto);
}

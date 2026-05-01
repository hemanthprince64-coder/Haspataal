// ============================================================
// IHospitalRepository — Contract for hospital data access
// ============================================================

export interface HospitalRecord {
  id: string;
  legalName: string;
  displayName?: string | null;
  registrationNumber: string;
  city?: string | null;
  contactNumber?: string | null;
  verificationStatus: string;
  accountStatus: string;
  password?: string;
}

export interface RegisterHospitalInput {
  hospitalName: string;
  city: string;
  adminName: string;
  mobile: string;
  hashedPassword: string;
  registrationNumber?: string;
  type?: string;
}

export interface IHospitalRepository {
  findById(id: string): Promise<HospitalRecord | null>;
  findByContactNumber(mobile: string): Promise<HospitalRecord | null>;
  findAll(filters?: { city?: string; accountStatus?: string }): Promise<HospitalRecord[]>;
  findPending(): Promise<HospitalRecord[]>;

  /**
   * Register a new hospital with primary admin in a transaction.
   */
  registerWithAdmin(input: RegisterHospitalInput): Promise<HospitalRecord>;

  /**
   * Update hospital verification/account status.
   */
  updateStatus(
    id: string,
    data: { verificationStatus?: string; accountStatus?: string }
  ): Promise<HospitalRecord>;

  /**
   * Check if admin with given mobile already exists.
   */
  adminExistsByMobile(mobile: string): Promise<boolean>;
}

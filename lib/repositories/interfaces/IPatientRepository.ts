// ============================================================
// IPatientRepository — Contract for patient data access
// ============================================================

export interface PatientRecord {
  id: string;
  phone: string;
  name: string | null;
  email?: string | null;
  gender?: string | null;
  password?: string;
}

export interface EnsurePatientInput {
  mobile: string;
  name: string;
}

export interface RegisterPatientInput {
  mobile: string;
  name: string;
  password: string;
  email?: string;
  gender?: string;
  bloodGroup?: string;
  city?: string;
}

export interface IPatientRepository {
  /**
   * Find or create a patient by mobile number.
   * Used during booking flow — upserts with a random password if new.
   */
  ensureExists(input: EnsurePatientInput): Promise<PatientRecord>;

  /**
   * Find a patient by phone number.
   */
  findByPhone(phone: string): Promise<PatientRecord | null>;

  /**
   * Find a patient by ID.
   */
  findById(id: string): Promise<PatientRecord | null>;

  /**
   * Create a new patient with full registration data.
   */
  register(input: RegisterPatientInput): Promise<PatientRecord>;

  /**
   * Update a patient profile.
   */
  updateProfile(id: string, updates: Partial<PatientRecord>): Promise<PatientRecord>;
}

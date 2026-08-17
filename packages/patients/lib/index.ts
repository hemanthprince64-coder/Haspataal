export interface PatientProfileInput {
  userId: string;
  mrn: string;
  dateOfBirth: Date;
  gender: string;
  bloodGroup?: string;
}

export class PatientProfileService {
  async createProfile(input: PatientProfileInput): Promise<unknown> {
    return null;
  }
}

export class PatientDemographicsService {
  async updateDemographics(patientId: string, demographics: Record<string, unknown>): Promise<void> {}
}

export class PatientIdentifierService {
  async addIdentifier(patientId: string, identifierType: string, value: string): Promise<void> {}
}

export class GuardianService {
  async addGuardian(patientId: string, guardian: Record<string, unknown>): Promise<void> {}
}

export class RelationshipService {
  async addRelationship(patientId: string, relatedPatientId: string, relationshipType: string): Promise<void> {}
}

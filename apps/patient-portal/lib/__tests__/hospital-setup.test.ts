import { describe, it, expect } from 'vitest';

import {
  ClinicOperationalProfileSchema,
  InternalReferralSchema,
  ConsultantSettlementSchema,
} from '../validations';

describe('Haspataal Onboarding & Operations Schemas', () => {
  describe('ClinicOperationalProfileSchema', () => {
    it('should validate a complete operational questionnaire payload', () => {
      const validPayload = {
        isSingleDoctor: true,
        hasConsultants: false,
        dailyStaffCount: 2,
        hasReceptionist: true,
        hasNursingStaff: true,
        hasPharmacy: true,
        hasOwnLab: false,
        admitsPatients: false,
        avgDailyPatients: 25,
        opdOnly: true,
        currentWorkflow: {
          appointments: 'both',
          records: 'paper',
          billing: 'both',
          followups: 'none',
          biggestProblem: 'Long patient wait times',
        },
        digitalMaturity: {
          prevSoftware: 'none',
          whyStopped: '',
          comfortLevel: 'Medium',
          preferredDevice: 'PC',
          internetReliability: 'Stable',
        },
        retentionLeaks: {
          remindersMethod: 'none',
          chronicLost: 'false',
          whatsappOptIn: true,
        },
        pharmacyConfig: {
          stockManual: true,
          expiryTracked: false,
        },
        labConfig: {
          ownLab: false,
          digitalUpload: false,
        },
        communicationPrefs: {
          whatsappNumber: '9876543210',
          smsRequired: true,
          preferredLanguage: 'English',
          onlineBooking: true,
        },
      };

      const result = ClinicOperationalProfileSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should reject payload with negative staff counts', () => {
      const invalidPayload = {
        isSingleDoctor: true,
        hasConsultants: false,
        dailyStaffCount: -5,
        avgDailyPatients: 20,
      };
      const result = ClinicOperationalProfileSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('InternalReferralSchema', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';

    it('should validate correct internal doctor referral', () => {
      const validReferral = {
        patientId: validUuid,
        fromDoctorId: validUuid,
        toDoctorId: validUuid,
        reason: 'Referral for pediatric consult',
        priority: 'ROUTINE',
        notes: 'Needs chest auscultation',
      };
      const result = InternalReferralSchema.safeParse(validReferral);
      expect(result.success).toBe(true);
    });

    it('should reject invalid priorities', () => {
      const invalidReferral = {
        patientId: validUuid,
        fromDoctorId: validUuid,
        toDoctorId: validUuid,
        priority: 'IMMEDIATE', // not in ROUTINE, URGENT, EMERGENCY
      };
      const result = InternalReferralSchema.safeParse(invalidReferral);
      expect(result.success).toBe(false);
    });
  });

  describe('ConsultantSettlementSchema', () => {
    it('should validate a correct period payout configuration', () => {
      const validPayout = {
        doctorId: 'doc-101',
        settlementPeriodStart: '2026-05-01T00:00:00.000Z',
        settlementPeriodEnd: '2026-05-31T23:59:59.000Z',
      };
      const result = ConsultantSettlementSchema.safeParse(validPayout);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date strings', () => {
      const invalidPayout = {
        doctorId: 'doc-101',
        settlementPeriodStart: 'not-a-date',
        settlementPeriodEnd: '2026-05-31',
      };
      const result = ConsultantSettlementSchema.safeParse(invalidPayout);
      expect(result.success).toBe(false);
    });
  });
});

import { describe, it, expect } from 'vitest';

import {
  RegisterDoctorSchema,
  RegisterAgentSchema,
  RegisterHospitalSchema,
  RegisterLabSchema,
  BookAppointmentSchema,
} from '../../apps/patient-portal/lib/validations';

describe('Zod Validation Schemas', () => {
  describe('RegisterDoctorSchema', () => {
    it('should pass with valid data', () => {
      const result = RegisterDoctorSchema.safeParse({
        fullName: 'Dr. John Doe',
        mobile: '1234567890',
        email: 'john@example.com',
        password: 'securepassword',
        registrationNumber: 'REG123',
        councilName: 'Medical Council',
      });
      expect(result.success).toBe(true);
    });

    it('should fail with invalid email', () => {
      const result = RegisterDoctorSchema.safeParse({
        fullName: 'Dr. John',
        mobile: '1234567890',
        email: 'invalid-email',
        password: 'securepassword',
        registrationNumber: 'REG123',
        councilName: 'Medical Council',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address.');
      }
    });

    it('should fail with short password', () => {
      const result = RegisterDoctorSchema.safeParse({
        fullName: 'Dr. John',
        mobile: '1234567890',
        email: 'john@example.com',
        password: 'short',
        registrationNumber: 'REG123',
        councilName: 'Medical Council',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must be at least 6 characters long.');
      }
    });
  });

  describe('RegisterAgentSchema', () => {
    it('should pass with valid data', () => {
      const result = RegisterAgentSchema.safeParse({
        fullName: 'Agent Smith',
        mobile: '0987654321',
        email: 'smith@example.com',
        password: 'securepassword',
        city: 'Mumbai',
      });
      expect(result.success).toBe(true);
    });

    it('should fail if mobile is missing or short', () => {
      const result = RegisterAgentSchema.safeParse({
        fullName: 'Agent Smith',
        mobile: '123',
        email: 'smith@example.com',
        password: 'securepassword',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('RegisterHospitalSchema', () => {
    it('should pass with valid data', () => {
      const result = RegisterHospitalSchema.safeParse({
        hospitalName: 'City Hospital',
        city: 'Delhi',
        adminName: 'Admin',
        mobile: '1122334455',
        password: 'securepassword',
        registrationNumber: 'REG-HOSP-01',
        approvalDocumentUrl: 'https://example.com/doc.pdf',
      });
      expect(result.success).toBe(true);
    });

    it('should fail if hospitalName is missing', () => {
      const result = RegisterHospitalSchema.safeParse({
        hospitalName: '',
        city: 'Delhi',
        adminName: 'Admin',
        mobile: '1122334455',
        password: 'securepassword',
        registrationNumber: 'REG-HOSP-01',
        approvalDocumentUrl: 'https://example.com/doc.pdf',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('RegisterLabSchema', () => {
    it('should pass with valid data', () => {
      const result = RegisterLabSchema.safeParse({
        labName: 'Central Lab',
        city: 'Pune',
        adminName: 'Admin',
        mobile: '5544332211',
        password: 'securepassword',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('BookAppointmentSchema', () => {
    it('should pass with valid data', () => {
      const result = BookAppointmentSchema.safeParse({
        doctorId: 'doc-123',
        hospitalId: 'hosp-123',
        date: '2030-01-01',
        slot: '09:00',
      });
      expect(result.success).toBe(true);
    });

    it('should fail if slot is missing', () => {
      const result = BookAppointmentSchema.safeParse({
        doctorId: 'doc-123',
        hospitalId: 'hosp-123',
        date: '2030-01-01',
        slot: '',
      });
      expect(result.success).toBe(false);
    });
  });
});

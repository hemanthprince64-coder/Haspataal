import { describe, it, expect } from 'vitest';
import { 
  RegisterHospitalSchema, 
  RegisterAgentSchema, 
  BookAppointmentSchema, 
  IndianMobileRegex 
} from '../../app/actions';
import { BookingStatus } from '../../types';

describe('Zod Schema & Regex Validation', () => {
  describe('Indian Mobile Number Regex', () => {
    it('should pass for valid 10-digit Indian numbers starting with 6-9', () => {
      expect(IndianMobileRegex.test('9876543210')).toBe(true);
      expect(IndianMobileRegex.test('8888888888')).toBe(true);
      expect(IndianMobileRegex.test('7777777777')).toBe(true);
      expect(IndianMobileRegex.test('6666666666')).toBe(true);
    });

    it('should fail for numbers starting with 0-5', () => {
      expect(IndianMobileRegex.test('5555555555')).toBe(false);
      expect(IndianMobileRegex.test('0123456789')).toBe(false);
    });

    it('should fail for numbers longer or shorter than 10 digits', () => {
      expect(IndianMobileRegex.test('987654321')).toBe(false);
      expect(IndianMobileRegex.test('98765432100')).toBe(false);
    });
  });

  describe('RegisterHospitalSchema', () => {
    it('should validate a correct hospital registration input', () => {
      const input = {
        name: 'City Hospital',
        email: 'admin@cityhosp.com',
        phone: '9999988888',
        password: 'securepassword123',
        city: 'Mumbai',
        state: 'Maharashtra'
      };
      const result = RegisterHospitalSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject invalid emails', () => {
      const input = {
        name: 'City Hospital',
        email: 'not-an-email',
        phone: '9999988888',
        password: 'securepassword123',
        city: 'Mumbai',
        state: 'Maharashtra'
      };
      const result = RegisterHospitalSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('BookAppointmentSchema', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';
    
    it('should reject past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      const input = {
        patientId: validUuid,
        doctorId: validUuid,
        hospitalId: validUuid,
        date: pastDate.toISOString(),
        slot: '10:00'
      };
      
      const result = BookAppointmentSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Date must be in the future');
      }
    });

    it('should accept future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      
      const input = {
        patientId: validUuid,
        doctorId: validUuid,
        hospitalId: validUuid,
        date: futureDate.toISOString(),
        slot: '10:00'
      };
      
      const result = BookAppointmentSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('BookingStatus Enum Integrity', () => {
    it('should contain expected statuses and NOT contain legacy PENDING', () => {
      const statuses = Object.values(BookingStatus);
      
      expect(statuses).toContain('AWAITING_PAYMENT');
      expect(statuses).toContain('BOOKED');
      expect(statuses).not.toContain('PENDING');
    });
  });
});

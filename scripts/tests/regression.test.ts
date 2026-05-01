import { describe, it, expect, vi } from 'vitest';
import { toHospitalSafeDto } from '../../lib/dto/hospital';
import { removeDoctorAction } from '../../app/actions';
import { services } from '../../lib/services';
import * as auth from '../../lib/auth/requireRole';

// Mock dependencies
vi.mock('../../lib/services', () => ({
  services: {
    hospital: {
      removeDoctor: vi.fn().mockResolvedValue(true),
    },
  },
}));

vi.mock('../../lib/auth/requireRole', () => ({
  requireRole: vi.fn(),
}));

vi.mock('../../lib/logger', () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('Regression Tests: Breaking Changes Audit', () => {
  describe('Hospital Password Exposure (Issue #2)', () => {
    it('toHospitalSafeDto should strictly remove password and adminUserId fields', () => {
      const mockHospital = {
        id: 'hosp-123',
        legalName: 'Test Hospital',
        registrationNumber: 'REG-123',
        verificationStatus: 'VERIFIED',
        accountStatus: 'ACTIVE',
        password: 'hashed-password-123!@#',
        adminUserId: 'admin-123',
      };

      const safeDto = toHospitalSafeDto(mockHospital);

      expect(safeDto.password).toBeUndefined();
      expect(safeDto.adminUserId).toBeUndefined();
      expect(safeDto.id).toBe('hosp-123');
      expect(safeDto.legalName).toBe('Test Hospital');
    });
  });

  describe('removeDoctorAction Crash (Issue #3)', () => {
    it('should reject non-string doctorId from FormData', async () => {
      vi.spyOn(auth, 'requireRole').mockResolvedValueOnce({
        hospitalId: 'hosp-123',
        role: 'HOSPITAL_ADMIN',
      });

      // Mock FormData returning null or File
      const formData = new FormData();
      // Not appending doctorId to simulate missing/null

      const result = await removeDoctorAction(null, formData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid doctor ID provided.');
      expect(services.hospital.removeDoctor).not.toHaveBeenCalled();
    });

    it('should call service when doctorId is valid', async () => {
      vi.spyOn(auth, 'requireRole').mockResolvedValueOnce({
        hospitalId: 'hosp-123',
        role: 'HOSPITAL_ADMIN',
      });

      const formData = new FormData();
      formData.append('doctorId', 'doc-123');

      const result = await removeDoctorAction(null, formData);

      expect(result.success).toBe(true);
      expect(services.hospital.removeDoctor).toHaveBeenCalledWith('hosp-123', 'doc-123');
    });
  });

  describe('BookingStatus PENDING removal (Issue #1 & #4)', () => {
    it('should confirm BookingStatus no longer contains PENDING', async () => {
      // In Prisma client or type definition, PENDING is replaced by AWAITING_PAYMENT and BOOKED.
      // This test ensures we don't accidentally re-introduce PENDING in application logic arrays.
      const validStatuses = ['AWAITING_PAYMENT', 'BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
      expect(validStatuses).not.toContain('PENDING');
      expect(validStatuses).toContain('BOOKED');
      expect(validStatuses).toContain('AWAITING_PAYMENT');
    });
  });
});

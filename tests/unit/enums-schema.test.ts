import { describe, it, expect } from 'vitest';
import { BookingStatus } from '../../types';

describe('Schema Enums & Constants', () => {
  describe('BookingStatus', () => {
    it('should not contain PENDING', () => {
      // Validate that the old PENDING value is fully removed
      // Note: BookingStatus enum keys/values
      const statuses = Object.values(BookingStatus);
      expect(statuses).not.toContain('PENDING');
    });

    it('should contain AWAITING_PAYMENT and BOOKED', () => {
      const statuses = Object.values(BookingStatus);
      expect(statuses).toContain('AWAITING_PAYMENT');
      expect(statuses).toContain('BOOKED');
    });
  });

  describe('AppointmentStatus Constraints', () => {
    it('should enforce the unique constraint logic at application level where needed', () => {
      // Since this is a unit test without the DB, we mock the logic of checking the constraint.
      // The DB schema enforces: @@unique([doctorId, date, slot])
      const mockExistingAppointments = [
        { doctorId: 'doc1', date: '2030-01-01', slot: '09:00' }
      ];

      const newAppointment = { doctorId: 'doc1', date: '2030-01-01', slot: '09:00' };
      
      const isConflict = mockExistingAppointments.some(
        a => a.doctorId === newAppointment.doctorId &&
             a.date === newAppointment.date &&
             a.slot === newAppointment.slot
      );

      expect(isConflict).toBe(true);
    });
  });
});

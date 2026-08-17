import { describe, it, expect } from 'vitest';

import {
  computeAvailableSlots,
  calculateAgentCommission,
  isAppointmentConflict,
} from '../../apps/patient-portal/lib/utils/pure-functions';

describe('Pure Functions', () => {
  describe('computeAvailableSlots', () => {
    it('should return all slots as available if none are booked and date is in future', () => {
      const allSlots = ['09:00', '09:30'];
      const targetDate = new Date(2030, 0, 2, 0, 0, 0);
      const now = new Date(2030, 0, 1, 0, 0, 0);

      const result = computeAvailableSlots(targetDate, new Set(), allSlots, now);

      expect(result).toEqual([
        { time: '09:00', available: true },
        { time: '09:30', available: true },
      ]);
    });

    it('should mark booked slots as unavailable', () => {
      const allSlots = ['09:00', '09:30', '10:00'];
      const targetDate = new Date(2030, 0, 2, 0, 0, 0);
      const now = new Date(2030, 0, 1, 0, 0, 0);
      const booked = new Set(['09:30']);

      const result = computeAvailableSlots(targetDate, booked, allSlots, now);

      expect(result).toEqual([
        { time: '09:00', available: true },
        { time: '09:30', available: false },
        { time: '10:00', available: true },
      ]);
    });

    it('should mark past slots as unavailable if targetDate is today', () => {
      const allSlots = ['09:00', '10:00', '11:00'];
      const targetDate = new Date(2030, 0, 1, 0, 0, 0);
      const now = new Date(2030, 0, 1, 9, 50, 0); // 9:50 AM

      const result = computeAvailableSlots(targetDate, new Set(), allSlots, now);

      expect(result).toEqual([
        { time: '09:00', available: false }, // Past
        { time: '10:00', available: false }, // Within 15 min buffer (10:00 - 15m = 9:45 < 9:50)
        { time: '11:00', available: true }, // Future
      ]);
    });
  });

  describe('calculateAgentCommission', () => {
    it('should calculate 10% for SILVER', () => {
      expect(calculateAgentCommission(1000, 'SILVER')).toBe(100);
    });

    it('should calculate 15% for GOLD', () => {
      expect(calculateAgentCommission(1000, 'GOLD')).toBe(150);
    });

    it('should calculate 20% for PLATINUM', () => {
      expect(calculateAgentCommission(1000, 'PLATINUM')).toBe(200);
    });
  });

  describe('isAppointmentConflict', () => {
    it('should return true if slot is booked', () => {
      expect(isAppointmentConflict('10:00', ['09:00', '10:00'])).toBe(true);
    });

    it('should return false if slot is free', () => {
      expect(isAppointmentConflict('11:00', ['09:00', '10:00'])).toBe(false);
    });
  });
});

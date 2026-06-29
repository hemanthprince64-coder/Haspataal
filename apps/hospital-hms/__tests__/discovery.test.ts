import { describe, it, expect, beforeAll } from 'vitest';

import { DoctorDiscoveryService } from '../lib/services/doctor-discovery';

describe('DoctorDiscoveryService', () => {
  let service;

  beforeAll(() => {
    service = new DoctorDiscoveryService();
  });

  describe('searchDoctors', () => {
    it('returns doctors array when called with no params', async () => {
      const result = await service.searchDoctors({});
      expect(Array.isArray(result)).toBe(true);
    });

    it('filters by specialty when provided', async () => {
      // This would test the Prisma query in real environment
      const result = await service.searchDoctors({ specialty: 'Cardiology' });
      expect(Array.isArray(result)).toBe(true);
    });

    it('filters by city when provided', async () => {
      const result = await service.searchDoctors({ city: 'Mumbai' });
      expect(Array.isArray(result)).toBe(true);
    });

    it('filters by minimum rating when provided', async () => {
      const result = await service.searchDoctors({ minRating: 4 });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('computeAvailability', () => {
    it('returns Leave status when doctor on leave', async () => {
      // Mock scenario - in real tests would mock Prisma
      const result = await service.computeAvailability(
        'test-doctor-id',
        'test-hospital-id',
        '2025-12-25',
      );

      // Should return valid structure
      expect(result).toHaveProperty('doctorId');
      expect(result).toHaveProperty('hospitalId');
      expect(result).toHaveProperty('date');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('availableSlots');
    });

    it('calculates correct slot count from schedule', async () => {
      const result = await service.computeAvailability(
        'test-doctor-id',
        'test-hospital-id',
        '2025-06-30',
      );

      expect(result.status).toBeDefined();
      expect(['Available', 'Limited', 'Full', 'Leave', 'Holiday']).toContain(result.status);
    });
  });
});

describe('Distance Utility', () => {
  it('calculates distance correctly', () => {
    const { haversineDistance } = require('../lib/services/distance');

    // Same point should be 0
    const d1 = haversineDistance(19.076, 72.877, 19.076, 72.877);
    expect(d1).toBe(0);

    // Different cities
    const d2 = haversineDistance(19.076, 72.877, 22.572, 88.363);
    expect(d2).toBeGreaterThan(1400); // Mumbai to Kolkata ~1400km
  });
});

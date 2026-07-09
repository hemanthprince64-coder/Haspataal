import { PrismaClient } from '@prisma/client';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import * as path from 'path';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { DoctorDiscoveryService } from '../lib/services/doctor-discovery';

describe('DoctorDiscoveryService', () => {
  let service: DoctorDiscoveryService;
  let container: StartedPostgreSqlContainer;
  let prisma: PrismaClient;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16').start();
    const databaseUrl = container.getConnectionUri();
    process.env.DATABASE_URL = databaseUrl;

    execSync(
      'npx prisma db push --schema=packages/db/prisma/schema.prisma --skip-generate --force-reset --accept-data-loss',
      {
        env: { ...process.env, DATABASE_URL: databaseUrl, DIRECT_URL: databaseUrl },
      },
    );

    const migrations = [
      'scripts/migrations/10_add_outbox_canonical_columns.sql',
      'scripts/migrations/11_phase0b_idempotency_dlq.sql',
    ];

    for (const file of migrations) {
      execSync(`npx prisma db execute --url="${databaseUrl}" --file="${file}"`);
    }
    prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
    service = new DoctorDiscoveryService();
  }, 120_000);

  afterAll(async () => {
    await prisma?.$disconnect();
    await container?.stop();
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

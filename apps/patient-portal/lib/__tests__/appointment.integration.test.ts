import { PrismaClient } from '@prisma/client';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import bcrypt from 'bcryptjs';
import { execSync } from 'child_process';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { UserRole, BookingStatus } from '../../types';

describe('Appointment Booking Integration (Real PostgreSQL)', () => {
  let container: StartedPostgreSqlContainer;
  let prisma: PrismaClient;
  let hospitalId: string;
  let doctorId: string;
  let patientId: string;

  beforeAll(async () => {
    // 1. Start PostgreSQL 16 Container
    container = await new PostgreSqlContainer('postgres:16').start();
    const dbUrl = container.getConnectionUri();
    process.env.DATABASE_URL = dbUrl;

    // 2. Run Prisma Migrations
    execSync(
      'npx prisma db push --schema=packages/db/prisma/schema.prisma --skip-generate --force-reset --accept-data-loss',
      {
        env: { ...process.env, DATABASE_URL: dbUrl, DIRECT_URL: dbUrl },
        stdio: 'inherit',
      },
    );

    const migrations = [
      'scripts/migrations/10_add_outbox_canonical_columns.sql',
      'scripts/migrations/11_phase0b_idempotency_dlq.sql',
    ];

    for (const file of migrations) {
      execSync(`npx prisma db execute --url="${dbUrl}" --file="${file}"`);
    }

    prisma = new PrismaClient({
      datasources: { db: { url: dbUrl } },
    });

    // 3. Seed Minimum Data
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create Hospital
    const hospital = await prisma.hospitalsMaster.create({
      data: {
        legalName: 'Integration Test Hospital',
        registrationNumber: 'INT-001',
        city: 'Mumbai',
        contactNumber: '9999999999',
        verificationStatus: 'verified',
        accountStatus: 'active',
      },
    });
    hospitalId = hospital.id;

    // Create Doctor
    const doctor = await prisma.doctorMaster.create({
      data: {
        fullName: 'Dr. Integration',
        mobile: '8888888888',
        email: 'dr@integration.com',
        password: hashedPassword,
        kycStatus: 'VERIFIED',
        accountStatus: 'ACTIVE',
      },
    });
    doctorId = doctor.id;

    // Create Patient
    const patient = await prisma.patient.create({
      data: {
        phone: '7777777777',
        name: 'Integration Patient',
        password: hashedPassword,
      },
    });
    patientId = patient.id;

    // Create Verified Affiliation
    await prisma.doctorHospitalAffiliation.create({
      data: {
        doctorId,
        hospitalId,
        verificationStatus: 'VERIFIED',
        isCurrent: true,
        role: 'DOCTOR',
        department: 'General',
      },
    });
  }, 120000); // 2 minute timeout for full setup

  afterAll(async () => {
    if (prisma) await prisma.$disconnect();
    if (container) await container.stop();
  });

  it('Happy Path: should successfully book an appointment', async () => {
    const { services } = await import('../services');

    const date = new Date();
    date.setDate(date.getDate() + 1); // Tomorrow
    const slot = '10:00';

    const result = await services.patient.createVisit(hospitalId, {
      patientMobile: '7777777777',
      patientName: 'Integration Patient',
      doctorId,
      date: date.toISOString(),
      slot,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe(BookingStatus.AWAITING_PAYMENT);

      // Verify in DB
      const dbRecord = await prisma.appointment.findUnique({
        where: { id: result.value.id },
      });
      expect(dbRecord).not.toBeNull();
      expect(dbRecord?.slot).toBe(slot);
    }
  });

  it('Double Booking Prevention: should return SLOT_TAKEN on second attempt', async () => {
    const { services } = await import('../services');

    const date = new Date();
    date.setDate(date.getDate() + 2); // Day after tomorrow
    const slot = '11:00';

    // First booking
    const res1 = await services.patient.createVisit(hospitalId, {
      patientMobile: '7777777777',
      patientName: 'Integration Patient',
      doctorId,
      date: date.toISOString(),
      slot,
    });
    expect(res1.ok).toBe(true);

    // Second booking (collision)
    const res2 = await services.patient.createVisit(hospitalId, {
      patientMobile: '7777777777',
      patientName: 'Another Patient',
      doctorId,
      date: date.toISOString(),
      slot,
    });

    expect(res2.ok).toBe(false);
    if (!res2.ok) {
      expect(res2.code).toBe('SLOT_TAKEN');
    }
  });

  it('Doctor Not Affiliated: should return DOCTOR_NOT_AFFILIATED if no approved affiliation', async () => {
    const { services } = await import('../services');

    // Create another hospital with no affiliation for this doctor
    const otherHosp = await prisma.hospitalsMaster.create({
      data: {
        legalName: 'Unconnected Hospital',
        registrationNumber: 'INT-002',
        city: 'Mumbai',
        contactNumber: '1111111111',
      },
    });

    const date = new Date();
    date.setDate(date.getDate() + 3);

    const result = await services.patient.createVisit(otherHosp.id, {
      patientMobile: '7777777777',
      patientName: 'Integration Patient',
      doctorId,
      date: date.toISOString(),
      slot: '12:00',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('DOCTOR_NOT_AFFILIATED');
    }
  });

  it('Full Slice: Patient books -> Hospital Admin marks as BOOKED (payment approved)', async () => {
    const { services } = await import('../services');

    const date = new Date();
    date.setDate(date.getDate() + 4);
    const slot = '14:00';

    // 1. Patient Books
    const bookRes = await services.patient.createVisit(hospitalId, {
      patientMobile: '7777777777',
      patientName: 'Integration Patient',
      doctorId,
      date: date.toISOString(),
      slot,
    });
    expect(bookRes.ok).toBe(true);

    if (bookRes.ok) {
      const appointmentId = bookRes.value.id;

      // 2. Hospital Admin updates status to BOOKED (simulating payment verification)
      const updateRes = await services.patient.updateVisitStatus(
        appointmentId,
        patientId,
        BookingStatus.BOOKED,
      );

      expect(updateRes.status).toBe(BookingStatus.BOOKED);

      // 3. Verify in DB
      const dbRecord = await prisma.appointment.findUnique({
        where: { id: appointmentId },
      });
      expect(dbRecord?.status).toBe(BookingStatus.BOOKED);
    }
  });
});

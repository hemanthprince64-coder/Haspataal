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

    const migrations = [];

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
    const integrationPatient = await prisma.patient.upsert({ where: { phone: '7777777777' }, update: {}, create: { name: 'Integration Patient', phone: '7777777777' } });
    await prisma.consent.create({ data: { patientId: integrationPatient.id, purpose: 'APPOINTMENT_BOOKING', version: 1, givenAt: new Date() } });
    const p2 = await prisma.patient.upsert({ where: { phone: '9999999999' }, update: {}, create: { name: 'Another Patient', phone: '9999999999' } });
    await prisma.consent.create({ data: { patientId: p2.id, purpose: 'APPOINTMENT_BOOKING', version: 1, givenAt: new Date() } });
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

    expect(result).toBeDefined();
    expect(result.status).toBe(BookingStatus.AWAITING_PAYMENT);

    // Verify in DB
    const dbRecord = await prisma.appointment.findUnique({
      where: { id: result.id },
    });
    expect(dbRecord).not.toBeNull();
    expect(dbRecord?.slot).toBe(slot);
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
    expect(res1).toBeDefined();

    // Second booking (collision)
    await expect(services.patient.createVisit(hospitalId, {
      patientMobile: '7777777777',
      patientName: 'Another Patient',
      doctorId,
      date: date.toISOString(),
      slot,
    })).rejects.toThrow('just booked by someone else');
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

    await expect(services.patient.createVisit(otherHosp.id, {
      patientMobile: '7777777777',
      patientName: 'Integration Patient',
      doctorId,
      date: date.toISOString(),
      slot: '12:00',
    })).rejects.toThrow('Doctor is not approved for this hospital');
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
    expect(bookRes).toBeDefined();

    const appointmentId = bookRes.id;
    const patientId = bookRes.patientId;

    // Wait for async events
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 2. Hospital Admin updates status to BOOKED (simulating payment verification)
    await services.patient.updateVisitStatus(
      appointmentId,
      patientId,
      BookingStatus.BOOKED,
    );

    // 3. Verify in DB
    const finalState = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });
    expect(finalState?.status).toBe(BookingStatus.BOOKED);
  });
});

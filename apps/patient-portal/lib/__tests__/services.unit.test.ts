import bcrypt from 'bcryptjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { UserRole, BookingStatus } from '../../types';
import prisma from '../prisma';
import { services } from '../services';

// Mock Prisma
vi.mock('../prisma', () => ({
  __esModule: true,
  default: {
    hospitalsMaster: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    hospitalAdmin: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    appointment: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    patient: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
    consent: {
      findUnique: vi.fn(),
    },
    doctorHospitalAffiliation: {
      findFirst: vi.fn(),
    },
    staff: {
      create: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(prisma)),
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
  },
}));

// Mock Bcrypt
vi.mock('bcryptjs', () => ({
  __esModule: true,
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn(),
  },
}));

describe('Service Layer Unit Tests (Mocked Prisma)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Hospital Registration', () => {
    it('should hash the password and update via raw SQL during registration', async () => {
      const hospitalData = {
        hospitalName: 'Apollo',
        city: 'Delhi',
        adminName: 'Dr. Smith',
        mobile: '9876543210',
        password: 'plain_password',
      };

      // Mock unique checks to pass
      vi.mocked(prisma.hospitalAdmin.findUnique).mockResolvedValue(null);

      // Mock creation results
      const mockHospital = {
        id: 'hosp-123',
        legalName: 'Apollo',
        city: 'Delhi',
        contactNumber: '9876543210',
      };
      vi.mocked(prisma.hospitalsMaster.create).mockResolvedValue(mockHospital as any);

      await services.hospital.register(hospitalData);

      // Verify bcrypt was called
      expect(bcrypt.hash).toHaveBeenCalledWith('plain_password', 12);

      // Verify transaction used $executeRaw to update the password with the hash
      // The implementation uses: UPDATE hospitals_master SET password = ${hashedPassword} WHERE id = ${hospital.id}
      expect(prisma.$executeRaw).toHaveBeenCalled();

      // Verify hospital master was created
      expect(prisma.hospitalsMaster.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            legalName: 'Apollo',
          }),
        }),
      );
    });
  });

  describe('Hospital Login', () => {
    it('should return null if password comparison fails', async () => {
      const mobile = '9876543210';
      const password = 'wrong_password';

      // Mock raw query finding the hospital
      vi.mocked(prisma.$queryRaw).mockResolvedValue([
        {
          id: 'hosp-1',
          legalName: 'Apollo',
          password: 'correct_hash',
        },
      ]);

      // Mock bcrypt comparison failure
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const result = await services.hospital.login(mobile, password);

      expect(result).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith('wrong_password', 'correct_hash');
    });

    it('should return user session if password comparison succeeds', async () => {
      const mobile = '9876543210';
      const password = 'correct_password';

      vi.mocked(prisma.$queryRaw).mockResolvedValue([
        {
          id: 'hosp-1',
          legalName: 'Apollo',
          password: 'correct_hash',
        },
      ]);

      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await services.hospital.login(mobile, password);

      expect(result).not.toBeNull();
      expect(result?.user?.id).toBe('hosp-1');
      expect(result?.user?.role).toBe(UserRole.HOSPITAL_ADMIN);
    });
  });

  describe('Appointment Booking', () => {
    it('should check for existing appointments before creating a new one', async () => {
      const bookingData = {
        patientMobile: '9999999999',
        patientName: 'John Doe',
        doctorId: 'doc-1',
        date: '2026-06-01',
        slot: '10:00',
      };

      // Mock affiliation check (success)
      vi.mocked(prisma.doctorHospitalAffiliation.findFirst).mockResolvedValue({
        id: 'aff-1',
      } as any);

      // Mock patient upsert
      vi.mocked(prisma.patient.upsert).mockResolvedValue({ id: 'pat-1', name: 'John Doe' } as any);
      vi.mocked(prisma.patient.findUnique).mockResolvedValue({
        id: 'pat-1',
        name: 'John Doe',
        phone: '9999999999',
      } as any);
      vi.mocked(prisma.consent.findUnique).mockResolvedValue({
        patientId: 'pat-1',
        purpose: 'APPOINTMENT_BOOKING',
        version: 1,
        withdrawnAt: null,
      } as any);

      // Mock existing appointment check (finds nothing)
      vi.mocked(prisma.appointment.findFirst).mockResolvedValue(null);

      // Mock creation
      vi.mocked(prisma.appointment.create).mockResolvedValue({
        id: 'app-1',
        patientId: 'pat-1',
        doctorId: 'doc-1',
        date: new Date('2026-06-01'),
        slot: '10:00',
        status: BookingStatus.AWAITING_PAYMENT,
      } as any);

      const result = await services.patient.createVisit('hosp-1', bookingData);

      expect(result.id).toBe('app-1');

      // Verify the check was performed
      expect(prisma.appointment.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            doctorId: 'doc-1',
            slot: '10:00',
          }),
        }),
      );

      // Verify the appointment was created
      expect(prisma.appointment.create).toHaveBeenCalled();
    });

    it('should return SLOT_TAKEN if the slot is already occupied', async () => {
      const bookingData = {
        patientMobile: '9999999999',
        patientName: 'John Doe',
        doctorId: 'doc-1',
        date: '2026-06-01',
        slot: '10:00',
      };

      // Mock affiliation check (success)
      vi.mocked(prisma.doctorHospitalAffiliation.findFirst).mockResolvedValue({
        id: 'aff-1',
      } as any);

      vi.mocked(prisma.patient.upsert).mockResolvedValue({ id: 'pat-1', name: 'John Doe' } as any);
      vi.mocked(prisma.patient.findUnique).mockResolvedValue({
        id: 'pat-1',
        name: 'John Doe',
        phone: '9999999999',
      } as any);
      vi.mocked(prisma.consent.findUnique).mockResolvedValue({
        patientId: 'pat-1',
        purpose: 'APPOINTMENT_BOOKING',
        version: 1,
        withdrawnAt: null,
      } as any);

      // Mock existing appointment check (finds a collision)
      vi.mocked(prisma.appointment.findFirst).mockResolvedValue({ id: 'existing-app' } as any);

      await expect(services.patient.createVisit('hosp-1', bookingData)).rejects.toThrow(
        /SLOT_UNAVAILABLE/,
      );

      // Verify creation was NOT called
      expect(prisma.appointment.create).not.toHaveBeenCalled();
    });
  });
});

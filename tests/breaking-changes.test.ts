import { services } from '../lib/services';
import { prisma } from '../lib/prisma';
import { BookingStatus } from '@haspataal/types';

describe('Breaking Changes Audit', () => {
  const hospitalId = 'test-hospital-id';
  const doctorId = 'test-doctor-id';
  const patientId = 'test-patient-id';

  beforeAll(async () => {
    // Setup test data if needed
  });

  describe('Hospital Service - removeDoctor (Breaking Change 3)', () => {
    it('should successfully remove a doctor-hospital affiliation', async () => {
      // Mock or create affiliation
      const spy = jest
        .spyOn(prisma.doctorHospitalAffiliation, 'deleteMany')
        .mockResolvedValue({ count: 1 } as any);

      const result = await services.hospital.removeDoctor(hospitalId, doctorId);

      expect(spy).toHaveBeenCalledWith({
        where: { hospitalId, doctorId },
      });
      expect(result.count).toBe(1);

      spy.mockRestore();
    });
  });

  describe('Appointment Creation (Breaking Change 4)', () => {
    it('should initialize new appointments with AWAITING_PAYMENT status', async () => {
      // Mock prisma.appointment.create
      const spy = jest.spyOn(prisma.appointment, 'create').mockImplementation((args: any) => {
        return Promise.resolve({ ...args.data, id: 'new-appt-id' }) as any;
      });

      const appt = await services.patient.createVisit(hospitalId, {
        patientMobile: '1234567890',
        patientName: 'Test Patient',
        doctorId,
        date: new Date().toISOString(),
        slot: '10:00',
      });

      expect(appt.status).toBe(BookingStatus.AWAITING_PAYMENT);

      spy.mockRestore();
    });
  });

  describe('Data Sanitization (Breaking Change 1)', () => {
    it('should strip password from Hospital objects', async () => {
      const mockHospital = {
        id: 'h1',
        legalName: 'Test Hospital',
        password: 'hashed_password_should_be_removed',
        contactNumber: '1234567890',
      };

      jest.spyOn(prisma.hospitalsMaster, 'findUnique').mockResolvedValue(mockHospital as any);

      const hospital = await services.platform.getHospitalById('h1');

      expect(hospital).not.toHaveProperty('password');
      expect(hospital?.legalName).toBe('Test Hospital');
    });
  });
});

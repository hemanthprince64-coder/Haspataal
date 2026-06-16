import { describe, it, expect, vi, beforeEach } from 'vitest';

import { BookingStatus } from '../../../types';
import { prisma } from '../../util/prisma-singleton';
import { SmsUssdService } from '../sms-ussd';

vi.mock('../../util/prisma-singleton', () => ({
  __esModule: true,
  prisma: {
    patient: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    appointment: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    doctorMaster: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    careJourney: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    careCheckIn: {
      create: vi.fn(),
    },
    consent: {
      upsert: vi.fn(),
    },
  },
}));

describe('SmsUssdService Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SMS Flows', () => {
    it('should confirm an appointment when receiving 1 or CONFIRM', async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValue({
        id: 'pat-1',
        phone: '9876543210',
      } as any);
      vi.mocked(prisma.appointment.findFirst).mockResolvedValue({
        id: 'appt-1',
        doctor: { fullName: 'Kumar' },
      } as any);

      const reply = await SmsUssdService.handleIncomingSMS('9876543210', 'CONFIRM');

      expect(prisma.appointment.update).toHaveBeenCalledWith({
        where: { id: 'appt-1' },
        data: { status: BookingStatus.CONFIRMED },
      });
      expect(reply).toContain('CONFIRMED');
      expect(reply).toContain('Dr. Kumar');
    });

    it('should cancel an appointment when receiving CANCEL', async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValue({
        id: 'pat-1',
        phone: '9876543210',
      } as any);
      vi.mocked(prisma.appointment.findFirst).mockResolvedValue({
        id: 'appt-1',
      } as any);

      const reply = await SmsUssdService.handleIncomingSMS('9876543210', 'CANCEL');

      expect(prisma.appointment.update).toHaveBeenCalledWith({
        where: { id: 'appt-1' },
        data: { status: BookingStatus.CANCELLED },
      });
      expect(reply).toContain('cancelled');
    });

    it('should triage fever and cough as suspected TB', async () => {
      const reply = await SmsUssdService.handleIncomingSMS(
        '9876543210',
        'TRIAGE fever and persistent cough for 3 weeks',
      );
      expect(reply).toContain('Suspected Tuberculosis');
      expect(reply).toContain('Urgent');
    });

    it('should triage fever and chills as suspected Malaria', async () => {
      const reply = await SmsUssdService.handleIncomingSMS('9876543210', 'TRIAGE fever and chills');
      expect(reply).toContain('Suspected Malaria');
      expect(reply).toContain('Urgent');
    });

    it('should book an appointment from a structured SMS', async () => {
      vi.mocked(prisma.doctorMaster.findFirst).mockResolvedValue({
        id: 'doc-1',
        fullName: 'Rajesh',
        affiliations: [{ hospitalId: 'hosp-1' }],
      } as any);
      vi.mocked(prisma.patient.findUnique).mockResolvedValue({
        id: 'pat-1',
        phone: '9876543210',
      } as any);
      vi.mocked(prisma.appointment.create).mockResolvedValue({
        id: 'appt-new-id-xyz',
      } as any);

      const reply = await SmsUssdService.handleIncomingSMS(
        '9876543210',
        'BOOK Rajesh Tomorrow 10:30',
      );

      expect(prisma.appointment.create).toHaveBeenCalled();
      expect(reply).toContain('SUCCESS');
      expect(reply).toContain('Dr. Rajesh');
    });
  });

  describe('USSD Flows', () => {
    it('should return the root menu for empty text', async () => {
      const response = await SmsUssdService.handleUSSDRequest('session-1', '9876543210', '');
      expect(response).toContain('CON Welcome to Haspataal');
      expect(response).toContain('Book Appointment');
    });

    it('should list doctors for path "1"', async () => {
      vi.mocked(prisma.doctorMaster.findMany).mockResolvedValue([
        { id: 'doc-1', fullName: 'Rajesh' },
        { id: 'doc-2', fullName: 'Sharma' },
      ] as any);

      const response = await SmsUssdService.handleUSSDRequest('session-1', '9876543210', '1');
      expect(response).toContain('CON Select Doctor');
      expect(response).toContain('Dr. Rajesh');
      expect(response).toContain('Dr. Sharma');
    });

    it('should request date selection for path "1*1"', async () => {
      vi.mocked(prisma.doctorMaster.findMany).mockResolvedValue([
        { id: 'doc-1', fullName: 'Rajesh', affiliations: [{ hospitalId: 'hosp-1' }] },
      ] as any);

      const response = await SmsUssdService.handleUSSDRequest('session-1', '9876543210', '1*1');
      expect(response).toContain('CON Select Date for Dr. Rajesh');
      expect(response).toContain('Today');
      expect(response).toContain('Tomorrow');
    });

    it('should complete booking for path "1*1*2*1*1"', async () => {
      vi.mocked(prisma.doctorMaster.findMany).mockResolvedValue([
        { id: 'doc-1', fullName: 'Rajesh', affiliations: [{ hospitalId: 'hosp-1' }] },
      ] as any);
      vi.mocked(prisma.patient.findUnique).mockResolvedValue({
        id: 'pat-1',
        phone: '9876543210',
      } as any);
      vi.mocked(prisma.appointment.create).mockResolvedValue({
        id: '1234-appt-id',
      } as any);

      const response = await SmsUssdService.handleUSSDRequest(
        'session-1',
        '9876543210',
        '1*1*2*1*1',
      );
      expect(prisma.appointment.create).toHaveBeenCalled();
      expect(response).toContain('END Success!');
      expect(response).toContain('Token: USD-1234');
    });

    it('should run symptom triage: yes fever, yes cough', async () => {
      const response = await SmsUssdService.handleUSSDRequest('session-1', '9876543210', '2*1*1');
      expect(response).toContain('END Alert: Suspected Tuberculosis');
    });
  });
});

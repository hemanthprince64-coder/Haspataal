import { BookingStatus } from '@haspataal/types';
import { describe, it, expect, vi } from 'vitest';

import { Appointment } from '../Appointment';
import { BookAppointmentUseCase } from '../BookAppointmentUseCase';
import { IAppointmentRepository } from '../IAppointmentRepository';

describe('BookAppointmentUseCase (Pure Logic Test)', () => {
  const mockRepo: IAppointmentRepository = {
    findById: vi.fn(),
    findBySlot: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
  };

  const useCase = new BookAppointmentUseCase(mockRepo);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully book an appointment when slot is available', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const request = {
      patientId: 'pat-1',
      doctorId: 'doc-1',
      hospitalId: 'hosp-1',
      date: futureDate,
      slot: '10:00',
    };

    vi.mocked(mockRepo.findBySlot).mockResolvedValue(null);

    vi.mocked(mockRepo.create).mockImplementation(async (app) => app);

    const result = await useCase.execute(request);

    expect(result.patientId).toBe('pat-1');
    expect(result.status).toBe(BookingStatus.AWAITING_PAYMENT);
    expect(mockRepo.create).toHaveBeenCalled();
  });

  it('should throw an error if the slot is already taken', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const request = {
      patientId: 'pat-1',
      doctorId: 'doc-1',
      hospitalId: 'hosp-1',
      date: futureDate,
      slot: '10:00',
    };

    // Mock availability check (finds existing)
    // The usecase now relies on transactional safety via create
    vi.mocked(mockRepo.create).mockRejectedValue(new Error('SLOT_ALREADY_TAKEN'));

    await expect(useCase.execute(request)).rejects.toThrow('SLOT_ALREADY_TAKEN');
    expect(mockRepo.create).toHaveBeenCalled();
  });

  it('should throw an error if booking in the past', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const request = {
      patientId: 'pat-1',
      doctorId: 'doc-1',
      hospitalId: 'hosp-1',
      date: pastDate,
      slot: '10:00',
    };

    vi.mocked(mockRepo.findBySlot).mockResolvedValue(null);

    await expect(useCase.execute(request)).rejects.toThrow('CANNOT_BOOK_IN_PAST');
  });
});

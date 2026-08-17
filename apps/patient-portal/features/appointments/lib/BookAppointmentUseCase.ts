// ============================================================
// BookAppointmentUseCase — Pure business logic for booking
// ============================================================
//
// This use-case contains NO Prisma imports. All data access is
// delegated to repository interfaces, making it fully testable
// with mock implementations.
// ============================================================
import { BookingStatus } from '../../../types';
import logger from '@/lib/logger';
import type {
  IAppointmentRepository,
  AppointmentRecord,
} from '@/lib/repositories/interfaces/IAppointmentRepository';
import type { IPatientRepository } from '@/lib/repositories/interfaces/IPatientRepository';

export interface BookAppointmentInput {
  hospitalId: string;
  patientMobile: string;
  patientName: string;
  doctorId: string;
  date: string;
  slot?: string;
  status?: string;
}

export interface BookAppointmentResult {
  appointment: AppointmentRecord;
}

export class SlotUnavailableError extends Error {
  constructor(slot: string) {
    super(`SLOT_UNAVAILABLE: The slot ${slot} has already been booked.`);
    this.name = 'SlotUnavailableError';
  }
}

export class ConcurrencyError extends Error {
  constructor() {
    super('This slot was just booked by someone else. Please choose another.');
    this.name = 'ConcurrencyError';
  }
}

export class BookAppointmentUseCase {
  constructor(
    private appointmentRepo: IAppointmentRepository,
    private patientRepo: IPatientRepository,
  ) {}

  async execute(input: BookAppointmentInput): Promise<BookAppointmentResult> {
    const {
      hospitalId,
      patientMobile,
      patientName,
      doctorId,
      date,
      slot = 'ONLINE',
      status,
    } = input;

    logger.info(
      {
        action: 'create_booking_attempt',
        hospitalId,
        doctorId,
        date,
        slot,
      },
      'Attempting transactional appointment booking',
    );

    // 1. Normalize date
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const bookingStatus = status || BookingStatus.BOOKED;

    try {
      // 2. Execute transactional booking via repository
      const appointment = await this.appointmentRepo.createBookingTransactional(
        // Patient ensure callback
        () =>
          this.patientRepo.ensureExists({
            mobile: patientMobile,
            name: patientName,
          }),
        // Slot availability check callback
        () =>
          this.appointmentRepo.findExistingBooking(doctorId, targetDate, slot, [
            BookingStatus.BOOKED,
            BookingStatus.CONFIRMED,
          ]),
        // Booking input
        {
          patientId: '', // Will be set by ensurePatient result
          doctorId,
          date: targetDate,
          slot,
          status: bookingStatus,
        },
      );

      logger.info(
        { action: 'booking_created', appointmentId: appointment.id },
        'Successfully booked appointment',
      );

      return { appointment };
    } catch (error) {
      const err = error as { code?: string; message?: string };
      // Handle Prisma unique constraint violation (P2002) — race condition protection
      if (err.code === 'P2002') {
        logger.warn(
          { action: 'booking_conflict', doctorId, slot },
          'Race condition double-booking prevented by Unique Constraint',
        );
        throw new ConcurrencyError();
      }

      logger.error(
        { action: 'booking_transaction_failed', error: err.message },
        'Booking transaction failed',
      );
      throw error;
    }
  }
}
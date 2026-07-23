// ============================================================
// CancelAppointmentUseCase — Cancellation with refund logic
// ============================================================
import { BookingStatus, VALID_STATUS_TRANSITIONS } from '../../../types';
import logger from '../../logger';
import type { IAppointmentRepository } from '../../repositories/interfaces/IAppointmentRepository';

export interface CancelAppointmentInput {
  patientId: string;
  appointmentId: string;
}

export class CancellationWindowError extends Error {
  constructor(slot: string) {
    super(`Appointments cannot be cancelled within 6 hours of the scheduled time (${slot})`);
    this.name = 'CancellationWindowError';
  }
}

export class InvalidTransitionError extends Error {
  constructor(current: string, target: string) {
    super(`Invalid state transition: Cannot move from ${current} to ${target}`);
    this.name = 'InvalidTransitionError';
  }
}

export class CancelAppointmentUseCase {
  private static readonly CANCELLATION_BUFFER_MS = 6 * 60 * 60 * 1000; // 6 hours

  constructor(private appointmentRepo: IAppointmentRepository) {}

  async execute(input: CancelAppointmentInput): Promise<{
    appointment: unknown;
    requiresRefund: boolean;
    refundAmount: number;
  }> {
    const { patientId, appointmentId } = input;

    logger.info(
      { action: 'cancel_booking_attempt', appointmentId },
      'Attempting to cancel appointment',
    );

    // 1. Find and verify ownership
    const appointment = await this.appointmentRepo.findByIdForPatient(appointmentId, patientId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // 2. Enforce cancellation time window (6-hour rule)
    const [hours, minutes] = (appointment.slot || '09:00').split(':').map(Number);
    const appointmentTime = new Date(appointment.date);
    appointmentTime.setHours(hours, minutes, 0, 0);

    const timeUntilAppointment = appointmentTime.getTime() - Date.now();
    if (timeUntilAppointment < CancelAppointmentUseCase.CANCELLATION_BUFFER_MS) {
      throw new CancellationWindowError(appointment.slot);
    }

    // 3. Validate state machine transition
    const currentStatus = appointment.status;
    const allowed = VALID_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(BookingStatus.CANCELLED)) {
      throw new InvalidTransitionError(currentStatus, BookingStatus.CANCELLED);
    }

    // 4. Determine if refund is needed
    const requiresRefund =
      currentStatus === BookingStatus.CONFIRMED || currentStatus === BookingStatus.BOOKED;
    const refundAmount = requiresRefund ? 500 : 0; // Flat consultation fee

    // 5. Execute cancellation
    const cancelled = await this.appointmentRepo.updateStatus(
      appointmentId,
      BookingStatus.CANCELLED,
    );

    logger.info(
      {
        action: 'status_transition',
        appointmentId,
        oldStatus: currentStatus,
        newStatus: BookingStatus.CANCELLED,
      },
      `Appointment cancelled`,
    );

    return {
      appointment: cancelled,
      requiresRefund,
      refundAmount,
    };
  }
}

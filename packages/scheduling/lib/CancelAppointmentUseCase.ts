import { BookingStatus } from '@haspataal/types';

import { IAppointmentRepository } from './IAppointmentRepository';

export interface CancelAppointmentRequest {
  appointmentId: string;
  patientId?: string; // Optional: To verify ownership if cancelled by a patient
}

export class CancelAppointmentUseCase {
  constructor(private appointmentRepo: IAppointmentRepository) {}

  async execute(request: CancelAppointmentRequest): Promise<void> {
    const appointment = await this.appointmentRepo.findById(request.appointmentId);

    if (!appointment) {
      throw new Error('APPOINTMENT_NOT_FOUND');
    }

    // Verify patient ownership if cancelling as a patient
    if (request.patientId && appointment.patientId !== request.patientId) {
      throw new Error('FORBIDDEN');
    }

    if (appointment.status === BookingStatus.CANCELLED) {
      return; // Already cancelled
    }

    // Domain Rule: Patients can only cancel > 2 hours before the appointment.
    // If it's a hospital cancelling (patientId is not provided), bypass this check.
    if (request.patientId) {
      const now = new Date();

      const appointmentDate = new Date(appointment.date);
      appointmentDate.setHours(0, 0, 0, 0);
      const [hours, minutes] = appointment.slot.split(':').map(Number);
      appointmentDate.setHours(hours, minutes, 0, 0);

      const msDiff = appointmentDate.getTime() - now.getTime();
      const hoursDiff = msDiff / (1000 * 60 * 60);

      if (hoursDiff <= 2) {
        throw new Error('TOO_LATE_TO_CANCEL');
      }
    }

    await this.appointmentRepo.updateStatus(request.appointmentId, BookingStatus.CANCELLED);

    // Future: Emit event for Notifications (e.g. queue.publish('AppointmentCancelled', ...))
  }
}

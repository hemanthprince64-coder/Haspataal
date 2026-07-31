import { prisma, AppointmentStatus, HandoffStage } from '@haspataal/db';
import { logger } from '@haspataal/logger';

import { ConsultationStateMachine } from './ConsultationStateMachine';

export class CheckInUseCase {
  /**
   * Checks in a patient for an appointment.
   * Creates a Visit record anchored to the Appointment.
   *
   * @param appointmentId The ID of the appointment to check in
   * @param actorId The ID of the receptionist or hospital admin
   * @param hospitalId The ID of the hospital where check-in happens
   */
  public async execute(appointmentId: string, actorId: string, hospitalId: string) {
    logger.info(`Initiating check-in for appointment ${appointmentId} by actor ${actorId}`);

    return prisma.$transaction(async (tx) => {
      // 1. Fetch the appointment
      const appointment = await tx.appointment.findUnique({
        where: { id: appointmentId },
        include: { patient: true },
      });

      if (!appointment) {
        throw new Error('APPOINTMENT_NOT_FOUND');
      }

      if (appointment.hospitalId !== hospitalId) {
        throw new Error('UNAUTHORIZED: Appointment belongs to a different hospital');
      }

      // 2. Validate state transition
      ConsultationStateMachine.validateTransition(appointment.status, AppointmentStatus.CHECKED_IN);

      // 3. Check if visit already exists (idempotency)
      let visit = await tx.visit.findUnique({
        where: { appointmentId },
      });

      if (!visit) {
        // 4. Create Visit anchor
        visit = await tx.visit.create({
          data: {
            appointmentId: appointment.id,
            hospitalId: appointment.hospitalId!,
            patientName: appointment.patient.name,
            patientPhone: appointment.patient.phone || '',
            currentStage: HandoffStage.RECEPTION,
          },
        });
        logger.info(`Created Visit ${visit.id} for appointment ${appointment.id}`);
      }

      // 5. Update appointment status
      const updatedAppointment = await tx.appointment.update({
        where: { id: appointment.id },
        data: { status: AppointmentStatus.CHECKED_IN },
      });

      logger.info(`Appointment ${appointment.id} successfully CHECKED_IN`);

      return {
        appointment: updatedAppointment,
        visit,
      };
    });
  }
}

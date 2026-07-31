import { prisma, AppointmentStatus, HandoffStage } from '@haspataal/db';
import { logger } from '@haspataal/logger';

import { ConsultationStateMachine } from './ConsultationStateMachine';

export class StartConsultationUseCase {
  /**
   * Starts a consultation, moving the patient from waiting/triage into the doctor's room.
   *
   * @param visitId The ID of the visit
   * @param doctorId The ID of the doctor attempting to start the consultation
   * @param hospitalId The hospital context
   */
  public async execute(visitId: string, doctorId: string, hospitalId: string) {
    logger.info(`Doctor ${doctorId} starting consultation for visit ${visitId}`);

    return prisma.$transaction(async (tx) => {
      const visit = await tx.visit.findUnique({
        where: { id: visitId },
        include: { appointment: true },
      });

      if (!visit || !visit.appointment) {
        throw new Error('VISIT_OR_APPOINTMENT_NOT_FOUND');
      }

      if (visit.hospitalId !== hospitalId) {
        throw new Error('UNAUTHORIZED: Visit belongs to a different hospital');
      }

      // Authorization: For MVP, only the assigned doctor can start the consultation
      if (visit.appointment.doctorId !== doctorId) {
        throw new Error('FORBIDDEN: Only the assigned doctor can start the consultation');
      }

      // State validation
      ConsultationStateMachine.validateTransition(
        visit.appointment.status,
        AppointmentStatus.IN_CONSULTATION,
      );

      // Update visit stage
      const updatedVisit = await tx.visit.update({
        where: { id: visitId },
        data: { currentStage: HandoffStage.CONSULTATION },
      });

      // Update appointment status
      const updatedAppointment = await tx.appointment.update({
        where: { id: visit.appointment.id },
        data: { status: AppointmentStatus.IN_CONSULTATION },
      });

      logger.info(`Consultation started successfully for visit ${visitId}`);

      return {
        visit: updatedVisit,
        appointment: updatedAppointment,
      };
    });
  }
}

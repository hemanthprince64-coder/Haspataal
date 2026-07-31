import { prisma, AppointmentStatus, HandoffStage } from '@haspataal/db';
import { logger } from '@haspataal/logger';

import { ConsultationStateMachine } from './ConsultationStateMachine';

export class CompleteConsultationUseCase {
  /**
   * Completes a consultation.
   *
   * @param visitId The ID of the visit
   * @param doctorId The ID of the doctor completing the consultation
   */
  public async execute(visitId: string, doctorId: string) {
    logger.info(`Doctor ${doctorId} completing consultation for visit ${visitId}`);

    return prisma.$transaction(async (tx) => {
      const visit = await tx.visit.findUnique({
        where: { id: visitId },
        include: { appointment: true },
      });

      if (!visit || !visit.appointment) {
        throw new Error('VISIT_OR_APPOINTMENT_NOT_FOUND');
      }

      if (visit.appointment.doctorId !== doctorId) {
        throw new Error('FORBIDDEN: Only the assigned doctor can complete this consultation');
      }

      ConsultationStateMachine.validateTransition(
        visit.appointment.status,
        AppointmentStatus.COMPLETED,
      );

      const updatedVisit = await tx.visit.update({
        where: { id: visitId },
        data: { currentStage: HandoffStage.BILLING }, // Assume moves to billing for now
      });

      const updatedAppointment = await tx.appointment.update({
        where: { id: visit.appointment.id },
        data: { status: AppointmentStatus.COMPLETED },
      });

      // Emit domain event for notifications/billing (In MVP, we just log it)
      await tx.auditLog.create({
        data: {
          userId: doctorId,
          hospitalId: visit.hospitalId,
          action: 'CONSULTATION_COMPLETED',
          entity: 'VISIT',
          entityId: visitId,
        },
      });

      logger.info(`Consultation successfully completed for visit ${visitId}`);

      return {
        visit: updatedVisit,
        appointment: updatedAppointment,
      };
    });
  }
}

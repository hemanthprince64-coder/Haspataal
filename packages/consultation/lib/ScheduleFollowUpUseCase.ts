import { prisma } from '@haspataal/db';
import { logger } from '@haspataal/logger';

export interface FollowUpInput {
  instructions: string;
  recommendedDays?: number;
}

export class ScheduleFollowUpUseCase {
  /**
   * Schedules a follow-up for a patient.
   *
   * @param visitId The ID of the visit
   * @param doctorId The ID of the doctor
   * @param input The follow-up instructions
   */
  public async execute(visitId: string, doctorId: string, input: FollowUpInput) {
    logger.info(`Doctor ${doctorId} scheduling follow-up for visit ${visitId}`);

    return prisma.$transaction(async (tx) => {
      const visit = await tx.visit.findUnique({
        where: { id: visitId },
        include: { appointment: true },
      });

      if (!visit || !visit.appointment) {
        throw new Error('VISIT_OR_APPOINTMENT_NOT_FOUND');
      }

      if (visit.appointment.doctorId !== doctorId) {
        throw new Error(
          'FORBIDDEN: Only the assigned doctor can schedule a follow-up for this visit',
        );
      }

      const encounter = await tx.encounter.findFirst({
        where: { appointmentId: visit.appointmentId },
      });

      const note = await tx.visitNote.create({
        data: {
          visitId,
          encounterId: encounter?.id,
          type: 'FOLLOW_UP',
          content: JSON.stringify(input),
        },
      });

      return note;
    });
  }
}

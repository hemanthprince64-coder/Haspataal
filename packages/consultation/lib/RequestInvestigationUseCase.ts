import { prisma } from '@haspataal/db';
import { logger } from '@haspataal/logger';

export interface InvestigationRequestInput {
  testName: string;
  instructions?: string;
}

export class RequestInvestigationUseCase {
  /**
   * Requests a diagnostic investigation (lab/radiology) during a consultation.
   *
   * @param visitId The ID of the visit
   * @param doctorId The ID of the doctor requesting the investigation
   * @param requests Array of tests to investigate
   */
  public async execute(visitId: string, doctorId: string, requests: InvestigationRequestInput[]) {
    logger.info(`Doctor ${doctorId} requesting investigations for visit ${visitId}`);

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
          'FORBIDDEN: Only the assigned doctor can request investigations for this visit',
        );
      }

      if (requests.length === 0) {
        throw new Error('INVALID_INPUT: Must provide at least one investigation request');
      }

      const note = await tx.visitNote.create({
        data: {
          visitId,
          type: 'INVESTIGATION_REQUEST',
          content: JSON.stringify(requests),
        },
      });

      return note;
    });
  }
}

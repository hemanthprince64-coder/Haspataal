import { prisma } from '@haspataal/db';
import { logger } from '@haspataal/logger';

export class AddDiagnosisUseCase {
  /**
   * Adds a diagnosis (or clinical notes) to a visit.
   *
   * @param visitId The ID of the visit
   * @param content The diagnosis or clinical note text
   * @param doctorId The ID of the doctor adding the note
   */
  public async execute(visitId: string, content: string, doctorId: string) {
    logger.info(`Doctor ${doctorId} adding diagnosis to visit ${visitId}`);

    return prisma.$transaction(async (tx) => {
      const visit = await tx.visit.findUnique({
        where: { id: visitId },
        include: { appointment: true },
      });

      if (!visit || !visit.appointment) {
        throw new Error('VISIT_OR_APPOINTMENT_NOT_FOUND');
      }

      if (visit.appointment.doctorId !== doctorId) {
        throw new Error('FORBIDDEN: Only the assigned doctor can add diagnosis to this visit');
      }

      const note = await tx.visitNote.create({
        data: {
          visitId,
          content,
          type: 'DIAGNOSIS',
        },
      });

      // Update the main diagnosis string on the visit as well for quick querying
      await tx.visit.update({
        where: { id: visitId },
        data: { diagnosis: content },
      });

      return note;
    });
  }
}

import { prisma } from '@haspataal/db';
import { EncounterGuard } from '@haspataal/encounter';
import { logger } from '@haspataal/logger';
import { getTimelinePublisher, TimelineCategory, TimelineEventType } from '@haspataal/timeline';

export class AddDiagnosisUseCase {
  /**
   * Adds a diagnosis (or clinical notes) to an encounter.
   *
   * @param encounterId The ID of the encounter
   * @param content The diagnosis or clinical note text
   * @param doctorId The ID of the doctor adding the note
   */
  public async execute(encounterId: string, content: string, doctorId: string) {
    logger.info(`Doctor ${doctorId} adding diagnosis to encounter ${encounterId}`);

    const encounter = await EncounterGuard.requireEncounterDoctor(encounterId, doctorId);
    await EncounterGuard.requireEncounterNotCompleted(encounterId);

    const note = await prisma.$transaction(async (tx) => {
      const note = await tx.visitNote.create({
        data: {
          encounterId: encounter.id,
          content,
          type: 'DIAGNOSIS',
        },
      });

      return note;
    });

    await getTimelinePublisher().publish({
      patientId: encounter.patientId,
      hospitalId: encounter.hospitalId,
      encounterId: encounter.id,
      aggregateType: 'Encounter',
      aggregateId: encounter.id,
      schemaVersion: 1,
      timestamp: new Date(),
      eventType: TimelineEventType.DIAGNOSIS_ADDED,
      category: TimelineCategory.DIAGNOSIS,
      title: 'Diagnosis Added',
      summary: content.slice(0, 100),
      metadata: { content },
      actorType: 'DOCTOR',
      actorId: doctorId,
    });

    return note;
  }
}

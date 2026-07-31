import { prisma, AppointmentStatus } from '@haspataal/db';
import { EncounterGuard, EncounterStateMachine } from '@haspataal/encounter';
import { logger } from '@haspataal/logger';
import { getTimelinePublisher, TimelineCategory, TimelineEventType } from '@haspataal/timeline';
import { EncounterStatus } from '@haspataal/types';

import { GenerateEncounterSummaryUseCase } from './GenerateEncounterSummaryUseCase';

export class CompleteConsultationUseCase {
  /**
   * Completes an encounter and generates its summary.
   *
   * @param encounterId The ID of the encounter
   * @param doctorId The ID of the doctor completing the encounter
   */
  public async execute(encounterId: string, doctorId: string) {
    logger.info(`Doctor ${doctorId} completing encounter ${encounterId}`);

    const encounter = await EncounterGuard.requireEncounterDoctor(encounterId, doctorId);
    await EncounterGuard.requireEncounterNotCompleted(encounterId);

    EncounterStateMachine.validateTransition(
      encounter.status as EncounterStatus,
      EncounterStatus.COMPLETED,
    );

    await GenerateEncounterSummaryUseCase.execute(encounterId, doctorId);

    return prisma.$transaction(async (tx) => {
      const updatedEncounter = await tx.encounter.update({
        where: { id: encounterId },
        data: { status: EncounterStatus.COMPLETED, endedAt: new Date() },
      });

      if (encounter.appointmentId) {
        await tx.appointment.update({
          where: { id: encounter.appointmentId },
          data: { status: AppointmentStatus.COMPLETED },
        });
      }

      await getTimelinePublisher().publish({
        patientId: encounter.patientId,
        hospitalId: encounter.hospitalId,
        encounterId: encounter.id,
        aggregateType: 'Encounter',
        aggregateId: encounter.id,
        schemaVersion: 1,
        timestamp: new Date(),
        eventType: TimelineEventType.CONSULTATION_COMPLETED,
        category: TimelineCategory.CONSULTATION,
        title: 'Encounter Completed',
        summary: 'The clinical encounter was marked as completed.',
        actorType: 'DOCTOR',
        actorId: doctorId,
      });

      logger.info(`Consultation successfully completed for encounter ${encounterId}`);

      return {
        encounter: updatedEncounter,
      };
    });
  }
}

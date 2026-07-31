import { prisma } from '@haspataal/db';
import { EncounterGuard } from '@haspataal/encounter';
import { logger } from '@haspataal/logger';
import { getTimelinePublisher, TimelineCategory, TimelineEventType } from '@haspataal/timeline';

export interface VitalsInput {
  weight?: number;
  height?: number;
  temperature?: number;
  pulse?: number;
  systolicBp?: number;
  diastolicBp?: number;
  spo2?: number;
}

export class RecordVitalsUseCase {
  /**
   * Records basic vitals for a patient during a visit triage.
   *
   * @param encounterId The ID of the encounter
   * @param actorId The ID of the nurse or doctor recording the vitals
   * @param vitals The vitals to record
   */
  public async execute(encounterId: string, actorId: string, vitals: VitalsInput) {
    logger.info(`Actor ${actorId} recording vitals for encounter ${encounterId}`);

    const encounter = await EncounterGuard.requireActiveEncounter(encounterId);

    const vitalRecord = await prisma.$transaction(async (tx) => {
      return tx.vitalRecord.create({
        data: {
          patientId: encounter.patientId,
          encounterId: encounter.id,
          weight: vitals.weight,
          height: vitals.height,
          temperature: vitals.temperature,
          pulse: vitals.pulse,
          bloodPressure:
            vitals.systolicBp && vitals.diastolicBp
              ? `${vitals.systolicBp}/${vitals.diastolicBp}`
              : null,
          spo2: vitals.spo2,
        },
      });
    });

    await getTimelinePublisher().publish({
      patientId: encounter.patientId,
      hospitalId: encounter.hospitalId,
      encounterId: encounter.id,
      aggregateType: 'Encounter',
      aggregateId: encounter.id,
      schemaVersion: 1,
      timestamp: new Date(),
      eventType: TimelineEventType.VITALS_RECORDED,
      category: TimelineCategory.VITALS,
      title: 'Vitals Recorded',
      summary: 'Patient vitals were recorded.',
      metadata: vitals as any,
      actorType: 'STAFF',
      actorId: actorId,
    });

    return vitalRecord;
  }
}

import { prisma } from '@haspataal/db';
import { EncounterGuard } from '@haspataal/encounter';
import { logger } from '@haspataal/logger';
import { getTimelinePublisher, TimelineCategory, TimelineEventType } from '@haspataal/timeline';

export interface PrescriptionItemInput {
  medicineName: string;
  dosage: string;
  duration: string;
  instructions?: string;
}

export class PrescribeMedicationUseCase {
  /**
   * Adds a prescription with multiple medications to the patient's encounter.
   *
   * @param encounterId The ID of the encounter
   * @param doctorId The ID of the doctor creating the prescription
   * @param items Array of medications
   */
  public async execute(encounterId: string, doctorId: string, items: PrescriptionItemInput[]) {
    logger.info(`Doctor ${doctorId} prescribing medication for encounter ${encounterId}`);

    const encounter = await EncounterGuard.requireEncounterDoctor(encounterId, doctorId);
    await EncounterGuard.requireEncounterNotCompleted(encounterId);

    if (items.length === 0) {
      throw new Error('INVALID_INPUT: Must provide at least one medication');
    }

    const prescription = await prisma.$transaction(async (tx) => {
      const prescription = await tx.patientPrescription.create({
        data: {
          patientId: encounter.patientId,
          doctorId: doctorId,
          appointmentId: encounter.appointmentId,
          encounterId: encounter.id,
          type: 'CONSULTATION_PRESCRIPTION',
          items: {
            create: items.map((item) => ({
              medicineName: item.medicineName,
              dosage: item.dosage,
              duration: item.duration,
              instructions: item.instructions,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return prescription;
    });

    await getTimelinePublisher().publish({
      patientId: encounter.patientId,
      hospitalId: encounter.hospitalId,
      encounterId: encounter.id,
      aggregateType: 'Encounter',
      aggregateId: encounter.id,
      schemaVersion: 1,
      timestamp: new Date(),
      eventType: TimelineEventType.PRESCRIPTION_CREATED,
      category: TimelineCategory.PRESCRIPTION,
      title: 'Prescription Added',
      summary: `${items.length} medications prescribed.`,
      metadata: { prescriptionId: prescription.id },
      actorType: 'DOCTOR',
      actorId: doctorId,
    });

    return prescription;
  }
}

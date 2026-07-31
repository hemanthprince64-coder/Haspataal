import { prisma } from '@haspataal/db';
import { logger } from '@haspataal/logger';

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
   * @param visitId The ID of the visit
   * @param actorId The ID of the nurse or doctor recording the vitals
   * @param vitals The vitals to record
   */
  public async execute(visitId: string, actorId: string, vitals: VitalsInput) {
    logger.info(`Actor ${actorId} recording vitals for visit ${visitId}`);

    return prisma.$transaction(async (tx) => {
      const visit = await tx.visit.findUnique({
        where: { id: visitId },
        include: { appointment: true },
      });

      if (!visit || !visit.appointment) {
        throw new Error('VISIT_OR_APPOINTMENT_NOT_FOUND');
      }

      // For MVP we just allow the assigned doctor or any triage staff (in this case, relying on API route auth)
      // The patient is extracted from the appointment linked to the visit.

      const vitalRecord = await tx.vitalRecord.create({
        data: {
          patientId: visit.appointment.patientId,
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

      return vitalRecord;
    });
  }
}

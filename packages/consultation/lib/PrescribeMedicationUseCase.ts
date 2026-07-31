import { prisma } from '@haspataal/db';
import { logger } from '@haspataal/logger';

export interface PrescriptionItemInput {
  medicineName: string;
  dosage: string;
  duration: string;
  instructions?: string;
}

export class PrescribeMedicationUseCase {
  /**
   * Adds a prescription with multiple medications to the patient's visit.
   *
   * @param visitId The ID of the visit
   * @param doctorId The ID of the doctor creating the prescription
   * @param items Array of medications
   */
  public async execute(visitId: string, doctorId: string, items: PrescriptionItemInput[]) {
    logger.info(`Doctor ${doctorId} prescribing medication for visit ${visitId}`);

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
          'FORBIDDEN: Only the assigned doctor can prescribe medication for this visit',
        );
      }

      if (items.length === 0) {
        throw new Error('INVALID_INPUT: Must provide at least one medication');
      }

      const prescription = await tx.patientPrescription.create({
        data: {
          patientId: visit.appointment.patientId,
          doctorId: doctorId,
          appointmentId: visit.appointment.id,
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
  }
}

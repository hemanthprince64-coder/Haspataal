import { prisma } from '@haspataal/db';
import { logger } from '@haspataal/logger';
import { EncounterType, EncounterStatus } from '@haspataal/types';

export interface CreateEncounterDTO {
  patientId: string;
  hospitalId: string;
  encounterType: EncounterType;
  appointmentId?: string;
  doctorId?: string;
  departmentId?: string;
  locationId?: string;
}

export class CreateEncounterUseCase {
  static async execute(data: CreateEncounterDTO) {
    try {
      logger.info(`Creating ${data.encounterType} encounter for patient ${data.patientId}`);

      const encounter = await prisma.encounter.create({
        data: {
          patientId: data.patientId,
          hospitalId: data.hospitalId,
          encounterType: data.encounterType as any, // Cast because types might not be 100% in sync yet
          status: EncounterStatus.ACTIVE as any,
          appointmentId: data.appointmentId,
          doctorId: data.doctorId,
          departmentId: data.departmentId,
          locationId: data.locationId,
        },
      });

      return { success: true, encounter };
    } catch (error: any) {
      logger.error('Failed to create encounter', error);
      return { success: false, error: error.message };
    }
  }
}

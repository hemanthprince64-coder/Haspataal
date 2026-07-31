import { prisma } from '@haspataal/db';
import { logger } from '@haspataal/logger';
import { EncounterStatus } from '@haspataal/types';

export class GetActiveEncounterUseCase {
  static async execute(patientId: string, hospitalId: string) {
    try {
      const encounter = await prisma.encounter.findFirst({
        where: {
          patientId,
          hospitalId,
          status: EncounterStatus.ACTIVE as any,
        },
        orderBy: {
          startedAt: 'desc',
        },
      });

      return { success: true, encounter };
    } catch (error: any) {
      logger.error('Failed to get active encounter', error);
      return { success: false, error: error.message };
    }
  }
}

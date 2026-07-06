import { prisma } from '@haspataal/db';
import { PlatformQuery, createPlatformQuerySchema } from '@haspataal/platform-contracts';
import { z } from 'zod';

export const JourneyFiltersSchema = z.object({
  patientId: z.string(),
});
export type JourneyFilters = z.infer<typeof JourneyFiltersSchema>;

export const JourneyQuerySchema = createPlatformQuerySchema(JourneyFiltersSchema as any);
export type JourneyQuery = z.infer<typeof JourneyQuerySchema>;

export class JourneyQueryHandler {
  /**
   * Retrieves journey instances for a patient.
   */
  static async getPatientJourneys(query: PlatformQuery<JourneyFilters>) {
    const { patientId } = query.filters;
    const { hospitalId } = query.tenantScope;

    return await prisma.journeyInstance.findMany({
      where: { 
        patientId,
        // Optional: enforce hospital isolation if it's not a cross-tenant query
        ...(hospitalId !== 'system' && { hospitalId }),
      },
      include: { milestones: true, tasks: true },
    });
  }
}

import { z } from 'zod';
import { createPlatformCommandSchema, PlatformCommand } from '@haspataal/platform-contracts';
import { JourneyEngine } from './engine';

export const StartJourneyPayloadSchema = z.object({
  templateId: z.string(),
  patientId: z.string(),
  hospitalId: z.string().optional(),
  careTeam: z.any().optional(),
});
export type StartJourneyPayload = z.infer<typeof StartJourneyPayloadSchema>;

export const CompleteMilestonePayloadSchema = z.object({
  milestoneId: z.string(),
});
export type CompleteMilestonePayload = z.infer<typeof CompleteMilestonePayloadSchema>;

export const StartJourneyCommandSchema = createPlatformCommandSchema(StartJourneyPayloadSchema);
export const CompleteMilestoneCommandSchema = createPlatformCommandSchema(CompleteMilestonePayloadSchema);

export class JourneyCommandHandler {
  async handleStartJourney(rawCommand: unknown): Promise<void> {
    const command = StartJourneyCommandSchema.parse(rawCommand) as PlatformCommand<StartJourneyPayload>;
    const payload = command.payload;
    
    // We already do tx.outboxEvent.create inside enroll, so this relies on
    // JourneyEngine acting as a domain service.
    await JourneyEngine.enroll({
      templateId: payload.templateId,
      patientId: payload.patientId,
      hospitalId: payload.hospitalId || command.tenantContext.hospitalId,
      careTeam: payload.careTeam,
    });
  }

  async handleCompleteMilestone(rawCommand: unknown): Promise<void> {
    const command = CompleteMilestoneCommandSchema.parse(rawCommand) as PlatformCommand<CompleteMilestonePayload>;
    const payload = command.payload;
    
    await JourneyEngine.completeMilestone(payload.milestoneId);
  }
}

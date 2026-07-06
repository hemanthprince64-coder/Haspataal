import { createPlatformCommandSchema, PlatformCommand } from '@haspataal/platform-contracts';
import { z } from 'zod';
import { ConfigurationEngine } from './engine';
import { OpdConfigSchema, IntegrationConfigSchema, BillingProfileSchema, FacilitiesSchema } from './types';

// Generic UPDATE_CONFIG_COMMAND
export const UpdateConfigPayloadSchema = z.object({
  hospitalId: z.string(),
  configType: z.enum(['OpdConfig', 'IntegrationConfig', 'BillingProfile', 'Facilities']),
  provider: z.any().optional(),
  payload: z.any(),
});
export type UpdateConfigPayload = z.infer<typeof UpdateConfigPayloadSchema>;

export const UpdateConfigCommandSchema = createPlatformCommandSchema(UpdateConfigPayloadSchema as any);

export class ConfigurationCommandHandler {
  async handleUpdateConfig(rawCommand: unknown): Promise<void> {
    const command = UpdateConfigCommandSchema.parse(rawCommand) as PlatformCommand<UpdateConfigPayload>;
    const { hospitalId, configType, provider, payload } = command.payload;
    const actorId = command.actorContext.actorId;

    switch (configType) {
      case 'OpdConfig':
        await ConfigurationEngine.updateOpdConfig(hospitalId, payload as any, actorId);
        break;
      case 'IntegrationConfig':
        if (!provider) throw new Error('Provider is required for IntegrationConfig');
        await ConfigurationEngine.updateIntegrationConfig(hospitalId, provider, payload as any, actorId);
        break;
      case 'BillingProfile':
        await ConfigurationEngine.updateBillingProfile(hospitalId, payload as any, actorId);
        break;
      case 'Facilities':
        await ConfigurationEngine.updateFacilities(hospitalId, payload as any, actorId);
        break;
      default:
        throw new Error(`Unsupported config type: ${configType}`);
    }
  }
}

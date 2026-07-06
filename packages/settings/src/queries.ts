import { PlatformQuery, createPlatformQuerySchema } from '@haspataal/platform-contracts';
import { z } from 'zod';
import { ConfigurationEngine } from './engine';

export const ConfigQueryFiltersSchema = z.object({
  configType: z.enum(['OpdConfig', 'IntegrationConfig', 'BillingProfile', 'Facilities']),
  provider: z.string().optional(),
});
export type ConfigQueryFilters = z.infer<typeof ConfigQueryFiltersSchema>;

export const ConfigQuerySchema = createPlatformQuerySchema(ConfigQueryFiltersSchema as any);

export class ConfigurationQueryHandler {
  async handleGetConfig(query: PlatformQuery<ConfigQueryFilters>) {
    const { hospitalId } = query.tenantScope;
    const { configType, provider } = query.filters;

    switch (configType) {
      case 'OpdConfig':
        return await ConfigurationEngine.getOpdConfig(hospitalId);
      case 'IntegrationConfig':
        if (!provider) throw new Error('Provider is required for IntegrationConfig');
        return await ConfigurationEngine.getIntegrationConfig(hospitalId, provider);
      case 'BillingProfile':
        return await ConfigurationEngine.getBillingProfile(hospitalId);
      case 'Facilities':
        return await ConfigurationEngine.getFacilities(hospitalId);
      default:
        throw new Error(`Unsupported config type: ${configType}`);
    }
  }
}

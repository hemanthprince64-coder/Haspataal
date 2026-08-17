import { PlatformCommand, PlatformQuery } from '@haspataal/platform-contracts';
import { ConfigProvider } from './domain/types';
import {
  UpdateHospitalConfigSchema,
  UpdateOpdConfigSchema,
  UpdateBillingProfileSchema,
} from './domain/schemas';

export class ConfigCommandHandler {
  constructor(private readonly configEngine: ConfigProvider) {}

  async handleUpdateHospitalConfig(command: PlatformCommand<unknown>) {
    const { tenantContext, payload } = command;
    const validated = UpdateHospitalConfigSchema.parse(payload);
    return await this.configEngine.updateHospitalConfig(tenantContext.hospitalId, validated);
  }

  async handleUpdateOpdConfig(command: PlatformCommand<unknown>) {
    const { tenantContext, payload } = command;
    const validated = UpdateOpdConfigSchema.parse(payload);
    return await this.configEngine.updateOpdConfig(tenantContext.hospitalId, validated);
  }

  async handleUpdateBillingProfile(command: PlatformCommand<unknown>) {
    const { tenantContext, payload } = command;
    const validated = UpdateBillingProfileSchema.parse(payload);
    return await this.configEngine.updateBillingProfile(tenantContext.hospitalId, validated);
  }
}

export class ConfigQueryHandler {
  constructor(private readonly configEngine: ConfigProvider) {}

  async handleGetHospitalConfig(query: PlatformQuery<unknown>) {
    return await this.configEngine.getHospitalConfig(query.tenantScope.hospitalId);
  }

  async handleGetOpdConfig(query: PlatformQuery<unknown>) {
    return await this.configEngine.getOpdConfig(query.tenantScope.hospitalId);
  }

  async handleGetBillingProfile(query: PlatformQuery<unknown>) {
    return await this.configEngine.getBillingProfile(query.tenantScope.hospitalId);
  }
}

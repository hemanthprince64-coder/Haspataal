import { prisma } from '@haspataal/db';
import { buildCanonicalOutbox, ScopeType, ActorType } from '@haspataal/platform-contracts';
import { v4 as uuidv4 } from 'uuid';

import {
  OpdConfigSchema,
  OpdConfigInput,
  IntegrationConfigSchema,
  IntegrationConfigInput,
  BillingProfileSchema,
  BillingProfileInput,
  FacilitiesSchema,
  FacilitiesInput,
} from './types';

export class ConfigurationEngine {
  // -- READ OPERATIONS --

  static async getOpdConfig(hospitalId: string) {
    const config = await prisma.opdConfig.findUnique({ where: { hospitalId } });
    return config || null;
  }

  static async getIntegrationConfig(hospitalId: string, provider: any) {
    const config = await prisma.integrationConfig.findUnique({
      where: { hospitalId_provider: { hospitalId, provider } },
    });
    return config || null;
  }

  static async getBillingProfile(hospitalId: string) {
    const profile = await prisma.hospitalBillingProfile.findUnique({ where: { hospitalId } });
    return profile || null;
  }

  static async getFacilities(hospitalId: string) {
    const facilities = await prisma.hospitalFacilities.findUnique({ where: { hospitalId } });
    return facilities || null;
  }

  // -- WRITE OPERATIONS --

  static async updateOpdConfig(
    hospitalId: string,
    payload: OpdConfigInput,
    actorId: string = 'system',
  ) {
    const data = OpdConfigSchema.parse(payload);

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.opdConfig.upsert({
        where: { hospitalId },
        update: data,
        create: { hospitalId, ...data },
      });

      await this.emitConfigUpdatedEvent(tx, hospitalId, 'OpdConfig', updated, actorId);
      return updated;
    });
  }

  static async updateIntegrationConfig(
    hospitalId: string,
    provider: any,
    payload: IntegrationConfigInput,
    actorId: string = 'system',
  ) {
    const data = IntegrationConfigSchema.parse(payload);

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.integrationConfig.upsert({
        where: { hospitalId_provider: { hospitalId, provider: provider as any } },
        update: { ...data, provider: provider as any },
        create: { hospitalId, ...data, provider: provider as any },
      });

      await this.emitConfigUpdatedEvent(
        tx,
        hospitalId,
        `IntegrationConfig:${provider}`,
        updated,
        actorId,
      );
      return updated;
    });
  }

  static async updateBillingProfile(
    hospitalId: string,
    payload: BillingProfileInput,
    actorId: string = 'system',
  ) {
    const data = BillingProfileSchema.parse(payload);

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.hospitalBillingProfile.upsert({
        where: { hospitalId },
        update: data,
        create: { hospitalId, ...data },
      });

      await this.emitConfigUpdatedEvent(tx, hospitalId, 'BillingProfile', updated, actorId);
      return updated;
    });
  }

  static async updateFacilities(
    hospitalId: string,
    payload: FacilitiesInput,
    actorId: string = 'system',
  ) {
    const data = FacilitiesSchema.parse(payload);

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.hospitalFacilities.upsert({
        where: { hospitalId },
        update: data,
        create: { hospitalId, ...data },
      });

      await this.emitConfigUpdatedEvent(tx, hospitalId, 'Facilities', updated, actorId);
      return updated;
    });
  }

  // -- OUTBOX EMITTER --

  private static async emitConfigUpdatedEvent(
    tx: any,
    hospitalId: string,
    configType: string,
    newConfig: any,
    actorId: string,
  ) {
    const correlationId = uuidv4();

    // We emit an event intended for the Timeline Engine to audit this change
    await tx.outboxEvent.create({
      data: buildCanonicalOutbox({
        eventId: uuidv4(),
        eventType: 'ADD_TO_TIMELINE_COMMAND',
        payload: {
          commandId: uuidv4(),
          commandVersion: 1,
          target: 'timeline',
          tenantContext: { hospitalId, branchId: 'default' },
          actorContext: { actorId, actorType: 'USER' },
          correlationId,
          idempotencyKey: `timeline-config-${configType}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          payload: {
            hospitalId: hospitalId,
            eventType: 'CONFIGURATION_UPDATED',
            category: 'SYSTEM',
            module: 'CONFIGURATION',
            title: `Configuration Updated: ${configType}`,
            subtitle: `Module: ${configType}`,
            description: `${configType} settings were modified.`,
            entityType: configType,
            entityId: hospitalId,
            metadata: {
              configType,
              newConfig,
            },
          },
        },
        scopeType: ScopeType.HOSPITAL,
        hospitalId,
        actorId,
        actorType: ActorType.USER,
        correlationId,
      }) as any,
    });
  }
}

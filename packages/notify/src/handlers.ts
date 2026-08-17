import { createPlatformCommandSchema, PlatformCommand } from '@haspataal/platform-contracts';

import { NotificationEngine } from './engine';
import { NotificationInputSchema, NotificationInput } from './types';

const SendNotificationCommandSchema = createPlatformCommandSchema(NotificationInputSchema);

export class NotificationCommandHandler {
  private engine: NotificationEngine;

  constructor(engine?: NotificationEngine) {
    this.engine = engine || new NotificationEngine();
  }

  async handleSendNotification(rawCommand: unknown) {
    const command = SendNotificationCommandSchema.parse(
      rawCommand,
    ) as PlatformCommand<NotificationInput>;
    const input: NotificationInput = {
      ...command.payload,
      hospitalId: command.payload.hospitalId || command.tenantContext.hospitalId,
    };
    await this.engine.enqueue(input);
  }

  async handleSendNotificationPrepareDb(rawCommand: unknown, options?: { tx?: any }) {
    const command = SendNotificationCommandSchema.parse(
      rawCommand,
    ) as PlatformCommand<NotificationInput>;
    const input: NotificationInput = {
      ...command.payload,
      hospitalId: command.payload.hospitalId || command.tenantContext.hospitalId,
    };
    return await this.engine.prepareDb(input, options?.tx);
  }

  async handleSendNotificationDispatch(
    queueName: string,
    notificationId: string,
    priority?: string,
  ) {
    await this.engine.dispatchQueue(queueName, notificationId, priority);
  }

  async handleCreateTemplate(command: PlatformCommand<any>) {
    const { prisma } = await import('@haspataal/db');
    const { hospitalId } = command.tenantContext;
    const template = await prisma.notificationTemplate.create({
      data: {
        ...command.payload,
        hospitalId,
      } as any,
    });
    return template;
  }

  async handleCreateCampaign(command: PlatformCommand<any>) {
    const { prisma } = await import('@haspataal/db');
    const { hospitalId } = command.tenantContext;
    const campaign = await prisma.notificationCampaign.create({
      data: {
        ...command.payload,
        hospitalId,
      } as any,
    });
    return campaign;
  }
}

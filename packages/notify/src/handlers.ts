import { createPlatformCommandSchema, PlatformCommand } from '@haspataal/platform-contracts';
import { NotificationInputSchema, NotificationInput } from './types';
import { NotificationEngine } from './engine';

const SendNotificationCommandSchema = createPlatformCommandSchema(NotificationInputSchema);

export class NotificationCommandHandler {
  private engine: NotificationEngine;

  constructor(engine?: NotificationEngine) {
    this.engine = engine || new NotificationEngine();
  }

  async handleSendNotification(rawCommand: unknown) {
    // Validate command envelope and payload
    const command = SendNotificationCommandSchema.parse(rawCommand) as PlatformCommand<NotificationInput>;
    
    // Inherit hospital context if not provided explicitly in payload
    const input: NotificationInput = {
      ...command.payload,
      hospitalId: command.payload.hospitalId || command.tenantContext.hospitalId,
    };

    // Note: The inbox processor has already guaranteed idempotency before reaching here.
    await this.engine.enqueue(input);
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

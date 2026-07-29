import { PrismaClient, CommunicationStatus } from '@prisma/client';
import { createHash } from 'crypto';

import { OutboxService } from '@haspataal/core/domain/outbox/service';

export interface SendCommunicationInput {
  executionId: string;
  channel: string;
  recipientAddress: string;
  subject?: string;
  body: string;
  sentBy: string;
  isReminder?: boolean;
  isEscalation?: boolean;
}

export class CommunicationService {
  constructor(
    private prisma: PrismaClient,
    private outbox: OutboxService,
  ) {}

  async recordCommunication(input: SendCommunicationInput) {
    const bodyHash = createHash('sha256').update(input.body).digest('hex');

    return this.prisma.referralCommunication.create({
      data: {
        executionId: input.executionId,
        channel: input.channel,
        recipientAddress: input.recipientAddress,
        subject: input.subject,
        bodyHash,
        status: CommunicationStatus.SENT,
        sentBy: input.sentBy,
        isReminder: input.isReminder ?? false,
        isEscalation: input.isEscalation ?? false,
      },
    });
  }

  async markDelivered(communicationId: string) {
    return this.prisma.referralCommunication.update({
      where: { id: communicationId },
      data: { status: CommunicationStatus.DELIVERED, deliveredAt: new Date() },
    });
  }

  async markOpened(communicationId: string) {
    return this.prisma.referralCommunication.update({
      where: { id: communicationId },
      data: { status: CommunicationStatus.OPENED, openedAt: new Date() },
    });
  }

  async markAcknowledged(communicationId: string) {
    return this.prisma.referralCommunication.update({
      where: { id: communicationId },
      data: { status: CommunicationStatus.ACKNOWLEDGED, acknowledgedAt: new Date() },
    });
  }

  async sendEscalation(
    executionId: string,
    recipientAddress: string,
    body: string,
    sentBy: string,
  ) {
    return this.recordCommunication({
      executionId,
      channel: 'IN_APP',
      recipientAddress,
      subject: 'Referral Escalation',
      body,
      sentBy,
      isEscalation: true,
    });
  }

  async getCommunicationHistory(executionId: string) {
    return this.prisma.referralCommunication.findMany({
      where: { executionId },
      orderBy: { sentAt: 'asc' },
    });
  }
}

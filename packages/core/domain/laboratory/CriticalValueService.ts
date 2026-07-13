import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export class CriticalValueService {
  constructor(private prisma: PrismaClient) {}
  async detectAndNotify(resultVersionId: string, recipientId: string) {
    // Detect if abnormal flags contain "CRITICAL"
    return await this.prisma.$transaction(async (tx) => {
      const version = await tx.laboratoryResultVersion.findUniqueOrThrow({
        where: { id: resultVersionId },
        include: { result: true },
      });

      const flags = version.abnormalFlags as any;
      if (!flags || !Array.isArray(flags) || !flags.includes('CRITICAL')) {
        return null;
      }

      // Check if already notified for this version
      const existing = await tx.criticalValueNotification.findFirst({
        where: { resultVersionId, recipientId },
      });
      if (existing) return existing;

      const notification = await tx.criticalValueNotification.create({
        data: {
          resultVersionId,
          recipientId,
        },
      });

      const item = await tx.laboratoryExecutionItem.findUnique({
        where: { id: version.result.executionItemId },
      });

      if (item) {
        await tx.outboxEvent.create({
          data: {
            id: uuidv4(),
            aggregateType: 'LaboratoryExecution',
            aggregateId: item.executionId,
            eventType: 'CRITICAL_RESULT_DETECTED',
            payload: JSON.parse(
              JSON.stringify({
                executionItemId: item.id,
                resultVersionId,
                recipientId,
                notificationId: notification.id,
              }),
            ),
          },
        });
      }

      return notification;
    });
  }

  async acknowledge(notificationId: string, acknowledgedBy: string) {
    return await this.prisma.$transaction(async (tx) => {
      const notification = await tx.criticalValueNotification.update({
        where: { id: notificationId },
        data: {
          acknowledgedAt: new Date(),
          acknowledgedBy,
        },
        include: {
          resultVersion: {
            include: { result: true },
          },
        },
      });

      const item = await tx.laboratoryExecutionItem.findUnique({
        where: { id: notification.resultVersion.result.executionItemId },
      });

      if (item) {
        await tx.outboxEvent.create({
          data: {
            id: uuidv4(),
            aggregateType: 'LaboratoryExecution',
            aggregateId: item.executionId,
            eventType: 'CRITICAL_RESULT_ACKNOWLEDGED',
            payload: JSON.parse(
              JSON.stringify({
                executionItemId: item.id,
                notificationId,
                acknowledgedBy,
              }),
            ),
          },
        });
      }

      return notification;
    });
  }
}

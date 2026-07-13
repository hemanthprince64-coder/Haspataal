import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export class CriticalValueService {
  constructor(private prisma: PrismaClient) {}

  async evaluateRules(hospitalId: string, values: Record<string, any>): Promise<string[]> {
    const flags: string[] = [];
    const rules = await this.prisma.criticalValueRule.findMany({
      where: { hospitalId },
    });

    for (const rule of rules) {
      const val = values[rule.testCode];
      if (val === undefined || val === null) continue;
      const numVal = parseFloat(val);
      if (isNaN(numVal)) continue;

      let match = false;
      switch (rule.condition) {
        case '>':
          match = numVal > (rule.threshold ?? 0);
          break;
        case '<':
          match = numVal < (rule.threshold ?? 0);
          break;
        case '=':
          match = numVal === (rule.threshold ?? 0);
          break;
        case '>=':
          match = numVal >= (rule.threshold ?? 0);
          break;
        case '<=':
          match = numVal <= (rule.threshold ?? 0);
          break;
        case 'BETWEEN':
          match = numVal >= (rule.threshold ?? 0) && numVal <= (rule.upperThreshold ?? 0);
          break;
      }
      if (match) {
        flags.push(rule.severity);
      }
    }
    return [...new Set(flags)];
  }

  async detectAndNotify(resultVersionId: string, recipientId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const version = await tx.laboratoryResultVersion.findUniqueOrThrow({
        where: { id: resultVersionId },
        include: { result: true },
      });

      const flags = (version.abnormalFlags as string[]) || [];
      const newerFlags = (version.flags as string[]) || [];
      const allFlags = [...flags, ...newerFlags];

      if (!allFlags.includes('CRITICAL')) {
        return null;
      }

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

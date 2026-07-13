import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export class AnalyzerService {
  constructor(private prisma: PrismaClient) {}
  async queue(executionItemId: string, priority: number = 0, analyzerId?: string) {
    return await this.prisma.$transaction(async (tx) => {
      // Find current max queue position for this analyzer/priority
      const lastInQueue = await tx.analyzerQueue.findFirst({
        where: { analyzerId, priority },
        orderBy: { queuePosition: 'desc' },
      });

      const nextPosition = lastInQueue ? lastInQueue.queuePosition + 1 : 1;

      const queueEntry = await tx.analyzerQueue.create({
        data: {
          executionItemId,
          analyzerId,
          priority,
          queuePosition: nextPosition,
          status: 'IN_ANALYZER_QUEUE',
        },
      });

      const item = await tx.laboratoryExecutionItem.update({
        where: { id: executionItemId },
        data: { status: 'IN_ANALYZER_QUEUE' },
      });

      await tx.outboxEvent.create({
        data: {
          id: uuidv4(),
          aggregateType: 'LaboratoryExecution',
          aggregateId: item.executionId,
          eventType: 'ANALYZER_QUEUED',
          payload: JSON.parse(
            JSON.stringify({
              executionItemId,
              queueEntryId: queueEntry.id,
              analyzerId,
              priority,
            }),
          ),
        },
      });

      return queueEntry;
    });
  }

  async start(queueEntryId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const queueEntry = await tx.analyzerQueue.update({
        where: { id: queueEntryId },
        data: { status: 'ANALYZING' },
      });

      const item = await tx.laboratoryExecutionItem.update({
        where: { id: queueEntry.executionItemId },
        data: { status: 'ANALYZING' },
      });

      await tx.outboxEvent.create({
        data: {
          id: uuidv4(),
          aggregateType: 'LaboratoryExecution',
          aggregateId: item.executionId,
          eventType: 'ANALYZER_STARTED',
          payload: JSON.parse(
            JSON.stringify({
              executionItemId: item.id,
              queueEntryId,
              analyzerId: queueEntry.analyzerId,
            }),
          ),
        },
      });

      return queueEntry;
    });
  }

  async complete(queueEntryId: string) {
    // Usually moving to RESULT_ENTERED is done via ResultService.
    // The analyzer completing just dequeues it.
    return await this.prisma.$transaction(async (tx) => {
      const queueEntry = await tx.analyzerQueue.delete({
        where: { id: queueEntryId },
      });
      return queueEntry;
    });
  }
}

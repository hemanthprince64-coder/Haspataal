import { PrismaClient } from '@prisma/client';

import { OutboxService } from '@haspataal/core';
import { BloodBankExecutionService } from './ExecutionService';

export class BloodBankConsumer {
  private executionService: BloodBankExecutionService;

  constructor(
    private prisma: PrismaClient,
    private outbox: OutboxService,
  ) {
    this.executionService = new BloodBankExecutionService(prisma, outbox);
  }

  async handleOrderRequested(eventPayload: any, hospitalId: string, patientId: string) {
    if (eventPayload.orderType !== 'BLOOD_REQUEST') {
      return;
    }

    await this.executionService.provisionExecution(
      eventPayload.orderId,
      hospitalId,
      patientId,
      eventPayload.items,
      eventPayload.orderedBy,
    );
  }
}

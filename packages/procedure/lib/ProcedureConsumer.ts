import { PrismaClient } from '@prisma/client';

import { ProcedureExecutionService } from './ExecutionService';

interface OrderRequestedPayload {
  orderId: string;
  type: string;
}

export class ProcedureConsumer {
  private executionService: ProcedureExecutionService;

  constructor(private prisma: PrismaClient) {
    this.executionService = new ProcedureExecutionService(prisma);
  }

  async handleOrderRequested(payload: OrderRequestedPayload): Promise<void> {
    if (payload.type === 'PROCEDURE') {
      await this.executionService.provisionExecution(payload.orderId);
    }
  }

  async processEvents(events: Array<{ type: string; payload: any }>): Promise<void> {
    for (const event of events) {
      if (event.type === 'ORDER_REQUESTED') {
        await this.handleOrderRequested(event.payload);
      }
    }
  }
}

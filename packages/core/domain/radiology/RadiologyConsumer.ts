import { PrismaClient } from '@prisma/client';

import { ExecutionService } from './ExecutionService';

export class RadiologyConsumer {
  private executionService: ExecutionService;

  constructor(private prisma: PrismaClient) {
    this.executionService = new ExecutionService(prisma);
  }

  async handleEvent(event: any) {
    const payload = event.payload?.payload || event.payload;

    switch (event.eventType) {
      case 'ORDER_REQUESTED':
        await this.executionService.startExecution(payload.orderId);
        break;

      case 'ORDER_CANCELLED':
        await this.executionService.cancelExecution(payload.orderId, payload.reason);
        break;

      default:
        break;
    }
  }
}

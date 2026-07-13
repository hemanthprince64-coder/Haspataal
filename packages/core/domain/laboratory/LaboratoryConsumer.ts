import { PrismaClient } from '@prisma/client';

import { ExecutionService } from './ExecutionService';

export class LaboratoryConsumer {
  private executionService: ExecutionService;

  constructor(private prisma: PrismaClient) {
    this.executionService = new ExecutionService(prisma);
  }

  async handleEvent(event: any) {
    // PlatformEvent payload typically holds the data
    const payload = event.payload?.payload || event.payload;

    switch (event.eventType) {
      case 'ORDER_REQUESTED':
        // For laboratory items, we create execution
        await this.executionService.startExecution(payload.orderId);
        break;

      case 'ORDER_CANCELLED':
        await this.executionService.cancelExecution(payload.orderId, payload.reason);
        break;

      case 'ORDER_AMENDED':
        // Complex logic: Handle additions/removals
        // To be implemented or handled manually inside cancellation/re-request
        break;

      default:
        break;
    }
  }
}

import { EventConsumer, EventType, CanonicalEventEnvelope } from '@haspataal/platform-contracts';
import { Prisma } from '@prisma/client';

import { PharmacyExecutionService } from './ExecutionService';

export class PharmacyConsumer implements EventConsumer {
  public consumerName = 'PharmacyConsumer';

  constructor(private executionService: PharmacyExecutionService) {}

  supportedEvents(): EventType[] {
    return ['ORDER_REQUESTED', 'ORDER_CANCELLED'];
  }

  async handle(event: CanonicalEventEnvelope, _tx: Prisma.TransactionClient): Promise<void> {
    if (event.aggregateType !== 'ORDER') {
      return;
    }

    // In a real transactional relay, the Consumer receives the tx to participate in the unit of work.
    // However, our ExecutionService is currently designed to use its own transactions.
    // To properly support the relay, we would inject the tx into the service.
    // For this demonstration/Phase 5B.1 scope, we will invoke the service directly.
    // (Assuming the relay handles error logging and DLQ)

    switch (event.eventType) {
      case 'ORDER_REQUESTED':
        // The event payload might have items. We assume the execution service fetches the order and checks.
        await this.executionService.initializeExecutionFromOrder(event.aggregateId);
        break;

      case 'ORDER_CANCELLED':
        await this.executionService.cancelExecution(event.aggregateId);
        break;

      default:
        // Ignore other events
        break;
    }
  }
}

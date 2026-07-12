import { Prisma } from '@prisma/client';

import { CanonicalEventEnvelope } from './outbox';

export type EventType = string;
export interface EventConsumer {
  consumerName: string;
  supportedEvents(): EventType[];
  handle(event: CanonicalEventEnvelope, tx: Prisma.TransactionClient): Promise<void>;
}
export declare class ConsumerRegistry {
  private consumers;
  register(consumer: EventConsumer): void;
  getConsumersForEvent(eventType: EventType): EventConsumer[];
  getAllConsumers(): EventConsumer[];
}
//# sourceMappingURL=consumer.d.ts.map

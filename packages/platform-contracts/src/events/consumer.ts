import { Prisma } from '@prisma/client';

import { CanonicalEventEnvelope } from './outbox';

export type EventType = string;

export interface EventConsumer {
  consumerName: string;
  supportedEvents(): EventType[];
  handle(event: CanonicalEventEnvelope, tx: Prisma.TransactionClient): Promise<void>;
}

export class ConsumerRegistry {
  private consumers: Map<string, EventConsumer> = new Map();

  register(consumer: EventConsumer) {
    if (this.consumers.has(consumer.consumerName)) {
      throw new Error(`Consumer ${consumer.consumerName} is already registered.`);
    }
    this.consumers.set(consumer.consumerName, consumer);
  }

  getConsumersForEvent(eventType: EventType): EventConsumer[] {
    const matched: EventConsumer[] = [];
    for (const consumer of this.consumers.values()) {
      if (consumer.supportedEvents().includes(eventType)) {
        matched.push(consumer);
      }
    }
    return matched;
  }

  getAllConsumers(): EventConsumer[] {
    return Array.from(this.consumers.values());
  }
}

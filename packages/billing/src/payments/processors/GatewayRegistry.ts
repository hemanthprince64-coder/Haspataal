import { PaymentMethod } from '@prisma/client';

import { PaymentProcessor } from './interfaces';

export class GatewayRegistry {
  private static processors: Map<string, PaymentProcessor> = new Map();

  static register(methodOrGateway: string, processor: PaymentProcessor) {
    this.processors.set(methodOrGateway, processor);
  }

  static resolve(method: PaymentMethod | string): PaymentProcessor {
    const processor = this.processors.get(method);
    if (!processor) {
      throw new Error(`No PaymentProcessor registered for ${method}`);
    }
    return processor;
  }
}

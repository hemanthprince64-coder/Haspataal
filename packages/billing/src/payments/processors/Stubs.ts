import { PaymentIntent, PaymentStatus } from '@prisma/client';

import { Money } from '../../pricing/Money';
import {
  PaymentProcessor,
  AuthorizationProcessor,
  RefundProcessor,
  ProcessorResult,
} from './interfaces';

export class UPIProcessor implements PaymentProcessor, AuthorizationProcessor {
  async authorize(intent: PaymentIntent, payload: any): Promise<ProcessorResult> {
    throw new Error('Method not implemented.');
  }

  async capture(intent: PaymentIntent, payload: any): Promise<ProcessorResult> {
    throw new Error('Method not implemented.');
  }
}

export class CardProcessor implements PaymentProcessor, AuthorizationProcessor, RefundProcessor {
  async authorize(intent: PaymentIntent, payload: any): Promise<ProcessorResult> {
    throw new Error('Method not implemented.');
  }

  async capture(intent: PaymentIntent, payload: any): Promise<ProcessorResult> {
    throw new Error('Method not implemented.');
  }

  async refund(paymentId: string, amount: Money, reason?: string): Promise<ProcessorResult> {
    throw new Error('Method not implemented.');
  }
}

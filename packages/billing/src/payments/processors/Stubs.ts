import { PaymentIntent } from '@prisma/client';

import { Money } from '../../pricing/Money';
import {
  PaymentProcessor,
  AuthorizationProcessor,
  RefundProcessor,
  ProcessorResult,
} from './interfaces';

export class UPIProcessor implements PaymentProcessor, AuthorizationProcessor {
  capabilities = {
    supportsAuthorization: true,
    supportsCapture: true,
    supportsRefund: false,
    supportsPartialCapture: false,
    supportsWebhook: true,
    supportsVoid: false,
  };
  timeout = 30000;
  maxRetries = 3;

  async authorize(intent: PaymentIntent, payload: any): Promise<ProcessorResult> {
    throw new Error('Method not implemented.');
  }

  async capture(intent: PaymentIntent, payload: any): Promise<ProcessorResult> {
    throw new Error('Method not implemented.');
  }
}

export class CardProcessor implements PaymentProcessor, AuthorizationProcessor, RefundProcessor {
  capabilities = {
    supportsAuthorization: true,
    supportsCapture: true,
    supportsRefund: true,
    supportsPartialCapture: true,
    supportsWebhook: true,
    supportsVoid: true,
  };
  timeout = 30000;
  maxRetries = 3;

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

import { PaymentStatus } from '@prisma/client';
import { PaymentIntent } from '@prisma/client';

import { Money } from '../../pricing/Money';

export interface ProcessorResult {
  success: boolean;
  paymentStatus: PaymentStatus;
  gatewayName: string;
  gatewayPaymentId?: string;
  gatewayOrderId?: string;
  gatewaySignature?: string;
  rawPayload?: unknown;
  errorCode?: string;
  errorMessage?: string;
  processedAt: Date;
}

export interface PaymentProcessorCapabilities {
  supportsAuthorization: boolean;
  supportsCapture: boolean;
  supportsRefund: boolean;
  supportsPartialCapture: boolean;
  supportsWebhook: boolean;
  supportsVoid: boolean;
}

export interface PaymentProcessor {
  capabilities: PaymentProcessorCapabilities;
  timeout: number; // in ms
  maxRetries: number;

  capture(intent: PaymentIntent, payload: any): Promise<ProcessorResult>;
}

export interface AuthorizationProcessor {
  authorize(intent: PaymentIntent, payload: any): Promise<ProcessorResult>;
}

export interface RefundProcessor {
  refund(paymentId: string, amount: Money, reason?: string): Promise<ProcessorResult>;
}

export interface CancellationProcessor {
  cancel(intent: PaymentIntent, reason?: string): Promise<ProcessorResult>;
}

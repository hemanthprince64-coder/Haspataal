import { PaymentIntent, PaymentStatus } from '@prisma/client';

import { PaymentProcessor, ProcessorResult } from './interfaces';

export class CashProcessor implements PaymentProcessor {
  capabilities = {
    supportsAuthorization: false,
    supportsCapture: true,
    supportsRefund: true,
    supportsPartialCapture: false,
    supportsWebhook: false,
    supportsVoid: true,
  };
  timeout = 0; // Cash is instant
  maxRetries = 0;

  async capture(
    intent: PaymentIntent,
    payload: { receiptNumber?: string } = {},
  ): Promise<ProcessorResult> {
    // Cash payments are immediately captured upon receipt by the cashier
    return {
      success: true,
      paymentStatus: PaymentStatus.CAPTURED,
      gatewayName: 'CASH',
      gatewayPaymentId: payload.receiptNumber || `CASH-${Date.now()}`,
      rawPayload: payload,
      processedAt: new Date(),
    };
  }
}

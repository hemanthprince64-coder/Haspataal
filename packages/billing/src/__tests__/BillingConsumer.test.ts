import { PrismaClient } from '@haspataal/db';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { BillingConsumer } from '../consumer/BillingConsumer';
import { PricingEngine } from '../pricing/PricingEngine';

describe('BillingConsumer', () => {
  let prismaMock: any;
  let consumer: BillingConsumer;

  beforeEach(() => {
    prismaMock = {
      chargeItem: {
        upsert: vi.fn().mockResolvedValue({}),
      },
    };
    consumer = new BillingConsumer(prismaMock as unknown as PrismaClient);
  });

  it('should process a clinical event and generate an immutable ChargeItem', async () => {
    const payload = {
      eventId: 'evt_123',
      eventType: 'CONSULTATION_COMPLETED',
      hospitalId: 'hosp_1',
      patientId: 'pat_1',
    };

    await consumer.processClinicalEvent(payload);

    expect(prismaMock.chargeItem.upsert).toHaveBeenCalledTimes(1);
    const callArgs = prismaMock.chargeItem.upsert.mock.calls[0][0];

    // Idempotency Key
    expect(callArgs.where.idempotencyKey).toBe('BILLING:CONSULTATION_COMPLETED:evt_123');

    // Immutable generation checks
    expect(callArgs.create.idempotencyKey).toBe('BILLING:CONSULTATION_COMPLETED:evt_123');
    expect(callArgs.create.sourceEvent).toBe('CONSULTATION_COMPLETED');
    expect(callArgs.create.category).toBe('CONSULTATION');
    expect(callArgs.create.status).toBe('UNBILLED');

    // Pricing checks
    expect(callArgs.create.grossAmount).toBe(500);

    // Idempotency DO NOTHING on conflict
    expect(callArgs.update).toEqual({});
  });

  it('should prevent duplicate billing when identical event is processed twice (Retry safety)', async () => {
    const payload = {
      eventId: 'evt_999',
      eventType: 'LAB_RESULT_VERIFIED',
      hospitalId: 'hosp_1',
      patientId: 'pat_1',
    };

    await consumer.processClinicalEvent(payload);
    await consumer.processClinicalEvent(payload); // Simulate EventBus retry

    // It calls upsert twice, but prisma's upsert with `{ update: {} }` is idempotent at DB level
    expect(prismaMock.chargeItem.upsert).toHaveBeenCalledTimes(2);

    // Both calls must use the EXACT same idempotency key
    const firstCall = prismaMock.chargeItem.upsert.mock.calls[0][0];
    const secondCall = prismaMock.chargeItem.upsert.mock.calls[1][0];

    expect(firstCall.where.idempotencyKey).toBe('BILLING:LAB_RESULT_VERIFIED:evt_999');
    expect(secondCall.where.idempotencyKey).toBe('BILLING:LAB_RESULT_VERIFIED:evt_999');
  });
});

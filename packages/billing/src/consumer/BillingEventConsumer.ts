import { PrismaClient } from '@haspataal/db';
import { EventConsumer, CanonicalEventEnvelope } from '@haspataal/platform-contracts';
import { Prisma } from '@prisma/client';

import { BillingConsumer, ClinicalEventPayload } from './BillingConsumer';

export class BillingEventConsumer implements EventConsumer {
  consumerName = 'BillingEventConsumer';
  consumerVersion = 1;

  supportedEvents(): string[] {
    return [
      'CONSULTATION_COMPLETED',
      'LAB_RESULT_VERIFIED',
      'RADIOLOGY_COMPLETED',
      'MEDICATION_DISPENSED',
      'PROCEDURE_COMPLETED',
    ];
  }

  async handle(event: CanonicalEventEnvelope, tx: Prisma.TransactionClient): Promise<void> {
    // Note: In real life we would cast `tx` appropriately or pass it to `BillingConsumer`.
    // Here we're using a transaction client but the BillingConsumer uses a full PrismaClient.
    // For MVP phase 10A, we'll cast tx to PrismaClient since their method signatures for `.chargeItem.upsert` match.
    const consumer = new BillingConsumer(tx as unknown as PrismaClient);

    const payload: ClinicalEventPayload = {
      eventId: event.eventId,
      eventType: event.eventType,
      hospitalId: event.aggregate.aggregateId || 'unknown_hospital',
      patientId:
        (event.payload as any)?.patientId || event.aggregate.aggregateId || 'unknown_patient',
      encounterId: (event.payload as any)?.encounterId,
      doctorId: event.actor.actorId || undefined,
      metadata: event.payload,
    };

    if (event.scope.hospitalId) {
      payload.hospitalId = event.scope.hospitalId;
    } else if ((event.payload as any)?.hospitalId) {
      payload.hospitalId = (event.payload as any).hospitalId;
    }

    await consumer.processClinicalEvent(payload);
  }
}

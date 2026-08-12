import { PrismaClient } from '@haspataal/db';
import { eventBus, DomainEvent } from '@haspataal/events';
import { logger } from '@haspataal/logger';

import { BillingConsumer, ClinicalEventPayload } from './BillingConsumer';

const prisma = new PrismaClient();
const consumer = new BillingConsumer(prisma);

export function registerBillingConsumers() {
  const handleClinicalEvent = async (event: DomainEvent) => {
    // Only process events that have a hospitalId and patientId
    if (!event.hospitalId || !event.patientId) {
      logger.warn(
        `[BillingConsumer] Skipped event ${event.id} (${event.type}) due to missing hospitalId or patientId.`,
      );
      return;
    }

    const payload: ClinicalEventPayload = {
      eventId: event.id,
      eventType: event.type,
      hospitalId: event.hospitalId,
      patientId: event.patientId,
      encounterId: event.encounterId,
      doctorId: event.actor?.id,
      metadata: event.payload,
    };

    await consumer.processClinicalEvent(payload);
  };

  // Register events that generate charges
  eventBus.subscribe('CONSULTATION_COMPLETED', handleClinicalEvent);
  eventBus.subscribe('LAB_RESULT_VERIFIED', handleClinicalEvent);
  eventBus.subscribe('RADIOLOGY_COMPLETED', handleClinicalEvent);
  eventBus.subscribe('MEDICATION_DISPENSED', handleClinicalEvent);
  eventBus.subscribe('PROCEDURE_COMPLETED', handleClinicalEvent);

  logger.info('[BillingConsumer] Registered successfully.');
}

import { PrismaClient, BillingSourceEvent, ChargeCategory } from '@haspataal/db';
import { logger } from '@haspataal/logger';

import { PricingEngine } from '../pricing/PricingEngine';

export interface ClinicalEventPayload {
  eventId: string; // Used for idempotency
  eventType: BillingSourceEvent | string;
  hospitalId: string;
  patientId: string;
  encounterId?: string;
  doctorId?: string;
  department?: string;
  metadata?: any;
}

export class BillingConsumer {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  /**
   * Translates a clinical event into a financial ChargeItem command.
   * Enforces idempotency via eventId -> idempotencyKey.
   */
  public async processClinicalEvent(payload: ClinicalEventPayload): Promise<void> {
    const idempotencyKey = `BILLING:${payload.eventType}:${payload.eventId}`;

    // 1. Calculate Prices (Domain Logic)
    const pricing = PricingEngine.calculatePrice(payload.eventType, 1);

    // 2. Map Event to Charge Category
    let category: ChargeCategory = ChargeCategory.MISC;
    if (payload.eventType === 'CONSULTATION_COMPLETED') category = ChargeCategory.CONSULTATION;
    else if (payload.eventType === 'LAB_RESULT_VERIFIED') category = ChargeCategory.LAB;
    else if (payload.eventType === 'RADIOLOGY_COMPLETED') category = ChargeCategory.RADIOLOGY;
    else if (payload.eventType === 'MEDICATION_DISPENSED') category = ChargeCategory.PHARMACY;
    else if (payload.eventType === 'PROCEDURE_COMPLETED') category = ChargeCategory.PROCEDURE;

    // 3. Persist ChargeItem Idempotently (ON CONFLICT DO NOTHING equivalent using upsert or checking)
    try {
      await this.prisma.chargeItem.upsert({
        where: {
          idempotencyKey: idempotencyKey,
        },
        update: {}, // Do nothing if it exists (idempotency rule)
        create: {
          idempotencyKey,
          hospitalId: payload.hospitalId,
          patientId: payload.patientId,
          sourceEvent: payload.eventType as BillingSourceEvent,
          category,
          quantity: pricing.quantity,
          unitPrice: pricing.unitPrice,
          taxAmount: pricing.taxAmount,
          discountAmount: pricing.discountAmount,
          grossAmount: pricing.grossAmount,
          netAmount: pricing.netAmount,
          status: 'UNBILLED',
          metadata: {
            encounterId: payload.encounterId,
            doctorId: payload.doctorId,
            department: payload.department,
            originalEventId: payload.eventId,
            ...payload.metadata,
          },
        },
      });
    } catch (error) {
      // In a real transactional outbox, we would log this for retry or DLQ
      logger.error({ error }, `Failed to process billing event ${payload.eventId}`);
      throw error;
    }
  }
}

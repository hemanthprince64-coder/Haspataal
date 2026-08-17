import { PrismaClient, BloodRequestStatus, BloodComponentType } from '@prisma/client';

import { OutboxService } from '@haspataal/core';
import { BloodBankEvent, BloodBankEventType } from './types';

export class BloodBankExecutionService {
  constructor(
    private prisma: PrismaClient,
    private outbox: OutboxService,
  ) {}

  async provisionExecution(
    orderId: string,
    hospitalId: string,
    patientId: string,
    items: any[],
  ) {
    const execution = await this.prisma.bloodBankExecution.create({
      data: {
        orderId,
        hospitalId,
        patientId,
        status: BloodRequestStatus.REQUESTED,
        items: {
          create: items.map((i) => ({
            orderItemId: i.id,
            componentType: i.code as BloodComponentType, // Mapping OrderItem code to BloodComponentType
            requestedUnits: i.quantity || 1,
            requestedVolumeMl: i.volume,
            status: BloodRequestStatus.REQUESTED,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    const event: BloodBankEvent = {
      eventId: crypto.randomUUID(),
      eventType: BloodBankEventType.BLOOD_REQUEST_CREATED,
      executionId: execution.id,
      orderId,
      hospitalId,
      patientId,
      timestamp: new Date(),
      payload: { items: execution.items },
    };

    await this.outbox.createEvent(
      this.prisma,
      event.patientId,
      event.eventType,
      event.payload,
    );

    return execution;
  }
}

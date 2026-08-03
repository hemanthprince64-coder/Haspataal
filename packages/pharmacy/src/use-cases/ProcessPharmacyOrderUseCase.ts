import { prisma } from '@haspataal/db';
import { ClinicalOrderFacade } from '@haspataal/orders';
import { getTimelinePublisher } from '@haspataal/timeline';
import { ClinicalOrderStatus } from '@haspataal/types';

import { PharmacyState } from '../domain/state-machine/PharmacyStateMachine';

export interface ProcessPharmacyOrderDTO {
  clinicalOrderId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
}

export class ProcessPharmacyOrderUseCase {
  static async execute(data: ProcessPharmacyOrderDTO) {
    const order = await prisma.clinicalOrder.findUnique({
      where: { id: data.clinicalOrderId },
    });

    if (!order) {
      throw new Error('ClinicalOrder not found');
    }

    if (order.status !== ClinicalOrderStatus.ORDERED) {
      throw new Error(`Cannot process order in state ${order.status}`);
    }

    // Create PharmacyExecution (status defaults to PRESCRIBED)
    const execution = await prisma.pharmacyExecution.create({
      data: {
        clinicalOrderId: order.id,
        patientId: order.patientId,
        hospitalId: order.hospitalId,
        status: 'PRESCRIBED' as PharmacyState,
        version: 1,
      },
    });

    // Update ClinicalOrder to ACCEPTED
    await ClinicalOrderFacade.updateStatus({
      orderId: order.id,
      status: ClinicalOrderStatus.ACCEPTED,
      version: order.version,
      actorId: data.actorId,
      actorName: data.actorName,
      actorRole: data.actorRole,
    });

    // Publish Timeline Event
    const publisher = getTimelinePublisher();
    await publisher.publishStandardEvent({
      version: 1,
      type: 'PHARMACY_ORDER_PROCESSED',
      patientId: order.patientId,
      hospitalId: order.hospitalId || undefined,
      encounterId: order.encounterId || undefined,
      aggregateType: 'PharmacyExecution',
      aggregateId: execution.id,
      actor: {
        id: data.actorId,
        type: data.actorRole,
        name: data.actorName,
        role: data.actorRole,
      },
      occurredAt: new Date(),
      payload: {
        clinicalOrderId: order.id,
        executionId: execution.id,
      },
    });

    return execution;
  }
}

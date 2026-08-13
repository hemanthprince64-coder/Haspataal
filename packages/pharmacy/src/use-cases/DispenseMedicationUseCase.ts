import { prisma } from '@haspataal/db';
import { ClinicalOrderFacade } from '@haspataal/orders';
import { getTimelinePublisher } from '@haspataal/timeline';
import { ClinicalOrderStatus } from '@haspataal/types';

import { PharmacyStateMachine, PharmacyState } from '../domain/state-machine/PharmacyStateMachine';

export interface DispenseMedicationDTO {
  executionId: string;
  expectedVersion: number;
  itemsDispensed: { itemId: string; quantity: number }[];
  isPartial: boolean;
  actorId: string;
  actorName: string;
  actorRole: string;
}

export class DispenseMedicationUseCase {
  static async execute(data: DispenseMedicationDTO) {
    const execution = await prisma.pharmacyExecution.findUnique({
      where: { id: data.executionId },
    });

    if (!execution) {
      throw new Error('PharmacyExecution not found');
    }

    if (execution.version !== data.expectedVersion) {
      throw new Error('Optimistic locking failure: execution has been modified.');
    }

    const targetState: PharmacyState = data.isPartial ? 'PARTIALLY_DISPENSED' : 'FULLY_DISPENSED';

    PharmacyStateMachine.validateTransition(execution.status as PharmacyState, targetState);

    // Use a transaction since we are updating execution and items
    const updated = await prisma.$transaction(async (tx) => {
      // Stubbed: inventory logic would go here
      // For each item, deduct from inventory and update dispensed quantity

      const exec = await tx.pharmacyExecution.update({
        where: { id: execution.id, version: data.expectedVersion },
        data: {
          status: targetState,
          version: { increment: 1 },
          dispensedBy: data.actorId,
          dispensedAt: new Date(),
        },
      });

      // Update Clinical Order if fully dispensed
      if (!data.isPartial && execution.clinicalOrderId) {
        // Need to update the status of the clinical order
        const order = await tx.clinicalOrder.findUnique({
          where: { id: execution.clinicalOrderId },
        });
        if (order) {
          await ClinicalOrderFacade.updateStatus({
            orderId: order.id,
            status: ClinicalOrderStatus.COMPLETED,
            version: order.version,
            actorId: data.actorId,
            actorName: data.actorName,
            actorRole: data.actorRole,
          });
        }
      }

      return exec;
    });

    const publisher = getTimelinePublisher();
    await publisher.publishStandardEvent({
      version: 1,
      schemaVersion: 1,
      eventVersion: 1,
      type: data.isPartial ? 'PHARMACY_ORDER_PARTIALLY_DISPENSED' : 'PHARMACY_ORDER_DISPENSED',
      patientId: execution.patientId,
      hospitalId: execution.hospitalId || undefined,
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
        executionId: execution.id,
        itemsDispensed: data.itemsDispensed,
      },
    });

    return updated;
  }
}

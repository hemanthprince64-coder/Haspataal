import { prisma } from '@haspataal/db';
import { ClinicalOrderFacade } from '@haspataal/orders';
import { getTimelinePublisher } from '@haspataal/timeline';
import { ClinicalOrderStatus } from '@haspataal/types';

import { PharmacyStateMachine, PharmacyState } from '../domain/state-machine/PharmacyStateMachine';

export interface CancelPharmacyOrderDTO {
  executionId: string;
  expectedVersion: number;
  reason: string;
  actorId: string;
  actorName: string;
  actorRole: string;
}

export class CancelPharmacyOrderUseCase {
  static async execute(data: CancelPharmacyOrderDTO) {
    const execution = await prisma.pharmacyExecution.findUnique({
      where: { id: data.executionId },
    });

    if (!execution) {
      throw new Error('PharmacyExecution not found');
    }

    if (execution.version !== data.expectedVersion) {
      throw new Error('Optimistic locking failure: execution has been modified.');
    }

    PharmacyStateMachine.validateTransition(execution.status as PharmacyState, 'CANCELLED');

    const updated = await prisma.$transaction(async (tx) => {
      const exec = await tx.pharmacyExecution.update({
        where: { id: execution.id, version: data.expectedVersion },
        data: {
          status: 'CANCELLED',
          version: { increment: 1 },
        },
      });

      if (execution.clinicalOrderId) {
        const order = await tx.clinicalOrder.findUnique({
          where: { id: execution.clinicalOrderId },
        });
        if (order) {
          await ClinicalOrderFacade.updateStatus({
            orderId: order.id,
            status: ClinicalOrderStatus.CANCELLED,
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
      type: 'PHARMACY_ORDER_CANCELLED',
      patientId: execution.patientId,
      hospitalId: execution.hospitalId || undefined,
      encounterId: execution.encounterId || undefined,
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
        reason: data.reason,
      },
    });

    return updated;
  }
}

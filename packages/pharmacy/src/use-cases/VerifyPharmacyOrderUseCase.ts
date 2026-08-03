import { prisma } from '@haspataal/db';
import { getTimelinePublisher } from '@haspataal/timeline';

import { PharmacyStateMachine, PharmacyState } from '../domain/state-machine/PharmacyStateMachine';

export interface VerifyPharmacyOrderDTO {
  executionId: string;
  expectedVersion: number;
  actorId: string;
  actorName: string;
  actorRole: string;
}

export class VerifyPharmacyOrderUseCase {
  static async execute(data: VerifyPharmacyOrderDTO) {
    const execution = await prisma.pharmacyExecution.findUnique({
      where: { id: data.executionId },
    });

    if (!execution) {
      throw new Error('PharmacyExecution not found');
    }

    if (execution.version !== data.expectedVersion) {
      throw new Error(
        'Optimistic locking failure: execution has been modified by another process.',
      );
    }

    PharmacyStateMachine.validateTransition(execution.status as PharmacyState, 'VERIFIED');

    const updated = await prisma.pharmacyExecution.update({
      where: { id: execution.id, version: data.expectedVersion },
      data: {
        status: 'VERIFIED',
        version: { increment: 1 },
        verifiedBy: data.actorId,
        verifiedAt: new Date(),
      },
    });

    const publisher = getTimelinePublisher();
    await publisher.publishStandardEvent({
      version: 1,
      type: 'PHARMACY_ORDER_VERIFIED',
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
      },
    });

    return updated;
  }
}

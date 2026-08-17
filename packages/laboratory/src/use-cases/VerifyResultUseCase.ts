import { PrismaClient, LabResultStatus, ClinicalOrderStatus } from '@haspataal/db';
import { TimelinePublisher, TimelineEventType } from '@haspataal/timeline';

import { ResultStateMachine } from '../domain/state-machine/ResultStateMachine';

const prisma = new PrismaClient();
const timelinePublisher = new TimelinePublisher();

export interface VerifyResultDTO {
  clinicalOrderId: string;
  hospitalId: string;
  verifiedBy: string;
}

export class VerifyResultUseCase {
  public async execute(data: VerifyResultDTO) {
    const result = await prisma.labResult.findUnique({
      where: { clinicalOrderId: data.clinicalOrderId },
      include: { values: true },
    });

    if (!result) throw new Error('Lab Result not found');
    if (result.hospitalId !== data.hospitalId) throw new Error('Hospital mismatch');

    ResultStateMachine.validateTransition(result.status, LabResultStatus.VERIFIED);

    const verifiedResult = await prisma.$transaction(async (tx) => {
      // 1. Mark result as verified
      const updated = await tx.labResult.update({
        where: { id: result.id },
        data: {
          status: LabResultStatus.VERIFIED,
          verifiedBy: data.verifiedBy,
          verifiedAt: new Date(),
        },
      });

      // 2. Mark clinical order as verified
      const order = await tx.clinicalOrder.update({
        where: { id: result.clinicalOrderId },
        data: {
          status: ClinicalOrderStatus.VERIFIED,
          verifiedBy: data.verifiedBy,
          completedAt: new Date(),
        },
      });

      // 3. Mark all samples as completed
      await tx.sample.updateMany({
        where: { clinicalOrderId: result.clinicalOrderId },
        data: { status: 'COMPLETED' },
      });

      return { updatedResult: updated, order };
    });

    // 4. Publish VERIFIED event
    await timelinePublisher.publish({
      patientId: result.patientId,
      encounterId: verifiedResult.order.encounterId,
      hospitalId: result.hospitalId,
      eventType: TimelineEventType.RESULT_VERIFIED,
      title: 'Lab Result Verified',
      description: 'The laboratory result has been verified and is available for viewing.',
      actorId: data.verifiedBy,
      timestamp: new Date(),
      metadata: { labResultId: result.id },
    });

    // 5. If Critical Values exist, dispatch CRITICAL_VALUE_DETECTED event
    const hasCritical = result.values.some((v) => v.isCritical);
    if (hasCritical) {
      await timelinePublisher.publish({
        patientId: result.patientId,
        encounterId: verifiedResult.order.encounterId,
        hospitalId: result.hospitalId,
        eventType: TimelineEventType.CRITICAL_VALUE_DETECTED,
        title: 'Critical Lab Value Detected',
        description: 'One or more laboratory values are critically out of range.',
        actorId: 'SYSTEM',
        timestamp: new Date(),
        metadata: { labResultId: result.id, criticality: 'HIGH' },
      });
    }

    // 6. Trigger Billing Hook
    const { BillingHook } = await import('../events/BillingHook');
    await BillingHook.dispatchOrderVerifiedEvent(
      result.clinicalOrderId,
      result.hospitalId,
      result.patientId,
    );

    return verifiedResult.updatedResult;
  }
}

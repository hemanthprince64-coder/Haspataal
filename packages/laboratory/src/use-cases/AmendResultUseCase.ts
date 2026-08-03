import { PrismaClient, LabResultStatus } from '@haspataal/db';
import { TimelinePublisher, TimelineEventType } from '@haspataal/timeline';

import { ResultStateMachine } from '../domain/state-machine/ResultStateMachine';

const prisma = new PrismaClient();
const timelinePublisher = new TimelinePublisher();

export interface AmendResultDTO {
  clinicalOrderId: string;
  hospitalId: string;
  amendedBy: string;
  reason: string;
  // To keep it simple, we just revert it back to DRAFT or UNDER_REVIEW for editing.
  // Actually, standard practice: we amend it, making it DRAFT again.
}

export class AmendResultUseCase {
  public async execute(data: AmendResultDTO) {
    const result = await prisma.labResult.findUnique({
      where: { clinicalOrderId: data.clinicalOrderId },
    });

    if (!result) throw new Error('Lab Result not found');
    if (result.hospitalId !== data.hospitalId) throw new Error('Hospital mismatch');

    ResultStateMachine.validateTransition(result.status, LabResultStatus.AMENDED);

    const amended = await prisma.labResult.update({
      where: { id: result.id },
      data: {
        status: LabResultStatus.AMENDED,
        amendedBy: data.amendedBy,
        amendedAt: new Date(),
      },
    });

    const clinicalOrder = await prisma.clinicalOrder.findUnique({
      where: { id: result.clinicalOrderId },
    });

    await timelinePublisher.publish({
      patientId: result.patientId,
      encounterId: clinicalOrder?.encounterId || '',
      hospitalId: result.hospitalId,
      eventType: TimelineEventType.RESULT_AMENDED,
      title: 'Lab Result Amended',
      description: `The laboratory result has been opened for amendment. Reason: ${data.reason}`,
      actorId: data.amendedBy,
      timestamp: new Date(),
      metadata: { labResultId: result.id, reason: data.reason },
    });

    return amended;
  }
}

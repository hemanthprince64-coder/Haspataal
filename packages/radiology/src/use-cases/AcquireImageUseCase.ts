import { prisma } from '@haspataal/db';
import { UpdateClinicalOrderStatusUseCase } from '@haspataal/orders';
import { getTimelinePublisher } from '@haspataal/timeline';
import { ClinicalOrderStatus } from '@haspataal/types';

import { RadiologyStateMachine } from '../domain/state-machine/RadiologyStateMachine';

export interface AcquireImageDTO {
  studyId: string;
  seriesCount: number;
  imageCount: number;
  actorId: string;
  actorName: string;
  actorRole: string;
}

export class AcquireImageUseCase {
  static async execute(data: AcquireImageDTO) {
    const study = await prisma.imagingStudy.findUnique({
      where: { id: data.studyId },
      include: { clinicalOrder: true },
    });

    if (!study) {
      throw new Error(`ImagingStudy not found`);
    }

    RadiologyStateMachine.validateTransition(study.status as any, 'IMAGE_ACQUIRED');

    // 1. Transition the study
    const updatedStudy = await prisma.imagingStudy.update({
      where: { id: study.id },
      data: {
        status: 'IMAGE_ACQUIRED',
        seriesCount: data.seriesCount,
        imageCount: data.imageCount,
      },
    });

    // 2. Also transition the Order to IN_PROGRESS
    if (study.clinicalOrderId) {
      await UpdateClinicalOrderStatusUseCase.execute({
        orderId: study.clinicalOrderId,
        status: ClinicalOrderStatus.IN_PROGRESS,
        version: study.clinicalOrder?.version || 0,
        actorId: data.actorId,
        actorName: data.actorName,
        actorRole: data.actorRole,
      });
    }

    // 3. Emit timeline event
    if (study.patientId && study.hospitalId && study.encounterId) {
      await getTimelinePublisher().publishStandardEvent({
        version: 1,
        type: 'IMAGING_STUDY_ACQUIRED',
        patientId: study.patientId,
        hospitalId: study.hospitalId,
        encounterId: study.encounterId,
        aggregateType: 'ImagingStudy',
        aggregateId: study.id,
        actor: {
          id: data.actorId,
          type: 'TECHNICIAN',
          name: data.actorName,
          role: data.actorRole,
        },
        occurredAt: new Date(),
        payload: {
          clinicalOrderId: study.clinicalOrderId || undefined,
          seriesCount: data.seriesCount,
          imageCount: data.imageCount,
        },
      });
    }

    return { success: true, study: updatedStudy };
  }
}

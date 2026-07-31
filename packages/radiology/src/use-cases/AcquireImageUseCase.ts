import { prisma } from '@haspataal/db';
import { getTimelinePublisher } from '@haspataal/timeline';
import { TimelineEventType, TimelineCategory, ClinicalOrderStatus } from '@haspataal/types';
import { UpdateClinicalOrderStatusUseCase } from '@haspataal/orders';
import { RadiologyStateMachine } from '../domain/state-machine/RadiologyStateMachine';

export interface AcquireImageDTO {
  studyId: string;
  seriesCount: number;
  imageCount: number;
  actorId: string;
}

export class AcquireImageUseCase {
  static async execute(data: AcquireImageDTO) {
    const study = await prisma.imagingStudy.findUnique({
      where: { id: data.studyId },
      include: { clinicalOrder: true },
    });

    if (!study) {
      throw new Error(`Imaging study ${data.studyId} not found`);
    }

    const stateMachine = new RadiologyStateMachine(study.status as any);
    stateMachine.transition({ type: 'ACQUIRE_IMAGE', seriesCount: data.seriesCount, imageCount: data.imageCount });

    const updatedStudy = await prisma.imagingStudy.update({
      where: { id: data.studyId },
      data: {
        seriesCount: data.seriesCount,
        imageCount: data.imageCount,
        status: stateMachine.getState(),
      },
    });

    // Update the base order to IN_PROGRESS
    if (study.clinicalOrderId) {
      await UpdateClinicalOrderStatusUseCase.execute({
        orderId: study.clinicalOrderId,
        status: ClinicalOrderStatus.IN_PROGRESS,
        actorId: data.actorId,
      });
    }

    if (study.patientId && study.hospitalId && study.encounterId) {
      await getTimelinePublisher().publish({
        patientId: study.patientId,
        hospitalId: study.hospitalId,
        encounterId: study.encounterId,
        aggregateType: 'ImagingStudy',
        aggregateId: study.id,
        schemaVersion: 1,
        eventType: TimelineEventType.INVESTIGATION_UPDATE || 'IMAGE_ACQUIRED' as any,
        category: TimelineCategory.INVESTIGATION,
        title: 'Images Acquired',
        summary: `Acquired ${data.imageCount} images across ${data.seriesCount} series.`,
        actorType: 'TECHNICIAN',
        actorId: data.actorId,
        payload: {
          seriesCount: data.seriesCount,
          imageCount: data.imageCount,
        },
      });
    }

    return { success: true, study: updatedStudy };
  }
}

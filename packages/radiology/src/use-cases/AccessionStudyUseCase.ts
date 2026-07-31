import { prisma } from '@haspataal/db';
import { getTimelinePublisher } from '@haspataal/timeline';
import { TimelineEventType, TimelineCategory, ClinicalOrderStatus } from '@haspataal/types';
import { UpdateClinicalOrderStatusUseCase } from '@haspataal/orders';
import { RadiologyStateMachine } from '../domain/state-machine/RadiologyStateMachine';

export interface AccessionStudyDTO {
  studyId: string;
  studyInstanceUID: string;
  actorId: string;
}

export class AccessionStudyUseCase {
  static async execute(data: AccessionStudyDTO) {
    const study = await prisma.imagingStudy.findUnique({
      where: { id: data.studyId },
      include: { clinicalOrder: true },
    });

    if (!study) {
      throw new Error(`Imaging study ${data.studyId} not found`);
    }

    const stateMachine = new RadiologyStateMachine(study.status as any);
    stateMachine.transition({ type: 'ACCESSION', accessionNumber: study.accessionNumber });

    const updatedStudy = await prisma.imagingStudy.update({
      where: { id: data.studyId },
      data: {
        studyInstanceUID: data.studyInstanceUID,
        status: stateMachine.getState(),
      },
      include: {
        clinicalOrder: true,
        encounter: true,
      },
    });

    // We can also transition the underlying ClinicalOrder to ACCEPTED or SCHEDULED if needed.
    if (study.clinicalOrderId) {
      await UpdateClinicalOrderStatusUseCase.execute({
        orderId: study.clinicalOrderId,
        status: ClinicalOrderStatus.ACCEPTED,
        actorId: data.actorId,
      });
    }

    if (updatedStudy.patientId && updatedStudy.hospitalId && updatedStudy.encounterId) {
      await getTimelinePublisher().publish({
        patientId: updatedStudy.patientId,
        hospitalId: updatedStudy.hospitalId,
        encounterId: updatedStudy.encounterId,
        aggregateType: 'ImagingStudy',
        aggregateId: study.id,
        schemaVersion: 1,
        eventType: TimelineEventType.INVESTIGATION_UPDATE || 'IMAGING_STUDY_ACCESSIONED' as any,
        category: TimelineCategory.INVESTIGATION,
        title: 'Imaging Study Accessioned',
        summary: `Study accessioned with UID: ${data.studyInstanceUID}`,
        actorType: 'TECHNICIAN',
        actorId: data.actorId,
        payload: {
          accessionNumber: study.accessionNumber,
          studyInstanceUID: data.studyInstanceUID,
        },
      });
    }

    return { success: true, study: updatedStudy };
  }
}

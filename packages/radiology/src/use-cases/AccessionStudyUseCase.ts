import { prisma } from '@haspataal/db';
import { getTimelinePublisher } from '@haspataal/timeline';

import { RadiologyStateMachine } from '../domain/state-machine/RadiologyStateMachine';

export interface AccessionStudyDTO {
  studyId: string;
  studyInstanceUID: string;
  actorId: string;
  actorName: string;
  actorRole: string;
}

export class AccessionStudyUseCase {
  static async execute(data: AccessionStudyDTO) {
    const study = await prisma.imagingStudy.findUnique({
      where: { id: data.studyId },
    });

    if (!study) {
      throw new Error(`ImagingStudy not found`);
    }

    RadiologyStateMachine.validateTransition(study.status as any, 'ACCESSIONED');

    // 1. Transition state to ACCESSIONED and attach UID
    const updatedStudy = await prisma.imagingStudy.update({
      where: { id: study.id },
      data: {
        status: 'ACCESSIONED',
        studyInstanceUID: data.studyInstanceUID,
      },
    });

    // 2. Publish timeline event
    if (updatedStudy.patientId && updatedStudy.hospitalId && updatedStudy.encounterId) {
      await getTimelinePublisher().publishStandardEvent({
        version: 1,
        type: 'IMAGING_STUDY_ACCESSIONED',
        patientId: updatedStudy.patientId,
        hospitalId: updatedStudy.hospitalId,
        encounterId: updatedStudy.encounterId,
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
          accessionNumber: study.accessionNumber,
          studyInstanceUID: data.studyInstanceUID,
        },
      });
    }

    return { success: true, study: updatedStudy };
  }
}

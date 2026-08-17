import { prisma } from '@haspataal/db';
import { getTimelinePublisher } from '@haspataal/timeline';

import { RadiologyStateMachine } from '../domain/state-machine/RadiologyStateMachine';

export interface DraftReportDTO {
  studyId: string;
  findings: string;
  impression?: string;
  actorId: string;
  actorName: string;
  actorRole: string;
}

export class DraftReportUseCase {
  static async execute(data: DraftReportDTO) {
    const study = await prisma.imagingStudy.findUnique({
      where: { id: data.studyId },
    });

    if (!study) {
      throw new Error(`ImagingStudy not found`);
    }

    RadiologyStateMachine.validateTransition(study.status as any, 'REPORT_DRAFTED');

    // 1. Transition the study
    const updatedStudy = await prisma.imagingStudy.update({
      where: { id: study.id },
      data: { status: 'REPORT_DRAFTED' },
    });

    // 2. Create the report
    const report = await prisma.radiologyReport.create({
      data: {
        studyId: study.id,
        findings: data.findings,
        impression: data.impression,
        status: 'DRAFT',
        reportedBy: data.actorId,
      },
    });

    // 3. Emit timeline event
    if (study.patientId && study.hospitalId && study.encounterId) {
      await getTimelinePublisher().publishStandardEvent({
        version: 1,
        eventVersion: 1,
        schemaVersion: 1,
        type: 'RADIOLOGY_REPORT_DRAFTED',
        patientId: study.patientId,
        hospitalId: study.hospitalId,
        encounterId: study.encounterId,
        aggregateType: 'RadiologyReport',
        aggregateId: report.id,
        actor: {
          id: data.actorId,
          type: 'DOCTOR',
          name: data.actorName,
          role: data.actorRole,
        },
        occurredAt: new Date(),
        payload: {
          clinicalOrderId: study.clinicalOrderId || undefined,
          reportId: report.id,
        },
      });
    }

    return { success: true, report, study: updatedStudy };
  }
}

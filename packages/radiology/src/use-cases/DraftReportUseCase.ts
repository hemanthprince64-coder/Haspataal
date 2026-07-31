import { prisma } from '@haspataal/db';
import { getTimelinePublisher } from '@haspataal/timeline';
import { TimelineEventType, TimelineCategory } from '@haspataal/types';
import { RadiologyStateMachine } from '../domain/state-machine/RadiologyStateMachine';

export interface DraftReportDTO {
  studyId: string;
  findings: string;
  impression: string;
  recommendation?: string;
  actorId: string;
}

export class DraftReportUseCase {
  static async execute(data: DraftReportDTO) {
    const study = await prisma.imagingStudy.findUnique({
      where: { id: data.studyId },
    });

    if (!study) {
      throw new Error(`Imaging study ${data.studyId} not found`);
    }

    const stateMachine = new RadiologyStateMachine(study.status as any);
    stateMachine.transition({
      type: 'DRAFT_REPORT',
      findings: data.findings,
      impression: data.impression,
    });

    // Create the report
    const report = await prisma.radiologyReport.create({
      data: {
        studyId: data.studyId,
        findings: data.findings,
        impression: data.impression,
        recommendation: data.recommendation,
        status: 'DRAFT',
      },
    });

    // Update study status
    const updatedStudy = await prisma.imagingStudy.update({
      where: { id: data.studyId },
      data: { status: stateMachine.getState() },
    });

    if (study.patientId && study.hospitalId && study.encounterId) {
      await getTimelinePublisher().publish({
        patientId: study.patientId,
        hospitalId: study.hospitalId,
        encounterId: study.encounterId,
        aggregateType: 'RadiologyReport',
        aggregateId: report.id,
        schemaVersion: 1,
        eventType: TimelineEventType.INVESTIGATION_UPDATE || 'RADIOLOGY_REPORT_DRAFTED' as any,
        category: TimelineCategory.INVESTIGATION,
        title: 'Radiology Report Drafted',
        summary: 'A radiologist has drafted a report for this study.',
        actorType: 'DOCTOR',
        actorId: data.actorId,
        payload: {
          reportId: report.id,
        },
      });
    }

    return { success: true, report, study: updatedStudy };
  }
}

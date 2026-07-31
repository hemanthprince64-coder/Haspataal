import { prisma } from '@haspataal/db';
import { getTimelinePublisher } from '@haspataal/timeline';
import { TimelineEventType, TimelineCategory, ClinicalOrderStatus } from '@haspataal/types';
import { UpdateClinicalOrderStatusUseCase } from '@haspataal/orders';
import { RadiologyStateMachine } from '../domain/state-machine/RadiologyStateMachine';

export interface VerifyReportDTO {
  reportId: string;
  actorId: string;
}

export class VerifyReportUseCase {
  static async execute(data: VerifyReportDTO) {
    const report = await prisma.radiologyReport.findUnique({
      where: { id: data.reportId },
      include: { study: true },
    });

    if (!report || !report.study) {
      throw new Error(`Report or associated study not found`);
    }

    const study = report.study;
    const stateMachine = new RadiologyStateMachine(study.status as any);
    
    // VERIFY_REPORT event
    stateMachine.transition({
      type: 'VERIFY_REPORT',
      verifiedBy: data.actorId,
    });

    // Also COMPLETE the study automatically upon verification, or leave it for a separate explicit step.
    // In many radiology workflows, report verification == study completed.
    stateMachine.transition({ type: 'COMPLETE' });

    // Update the report
    const updatedReport = await prisma.radiologyReport.update({
      where: { id: data.reportId },
      data: {
        status: 'VERIFIED',
        verifiedBy: data.actorId,
        verifiedAt: new Date(),
      },
    });

    // Update study status to COMPLETED
    const updatedStudy = await prisma.imagingStudy.update({
      where: { id: study.id },
      data: { status: stateMachine.getState(), completedAt: new Date() },
    });

    // Update the base order to COMPLETED
    if (study.clinicalOrderId) {
      await UpdateClinicalOrderStatusUseCase.execute({
        orderId: study.clinicalOrderId,
        status: ClinicalOrderStatus.COMPLETED,
        actorId: data.actorId,
      });
    }

    if (study.patientId && study.hospitalId && study.encounterId) {
      await getTimelinePublisher().publish({
        patientId: study.patientId,
        hospitalId: study.hospitalId,
        encounterId: study.encounterId,
        aggregateType: 'RadiologyReport',
        aggregateId: report.id,
        schemaVersion: 1,
        eventType: TimelineEventType.INVESTIGATION_COMPLETED || 'RADIOLOGY_REPORT_VERIFIED' as any,
        category: TimelineCategory.INVESTIGATION,
        title: 'Radiology Report Verified',
        summary: 'The final radiology report has been verified and is available.',
        actorType: 'DOCTOR',
        actorId: data.actorId,
        payload: {
          reportId: report.id,
          findings: report.findings,
          impression: report.impression,
        },
      });
    }

    return { success: true, report: updatedReport, study: updatedStudy };
  }
}

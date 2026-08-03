import { prisma } from '@haspataal/db';
import { UpdateClinicalOrderStatusUseCase } from '@haspataal/orders';
import { getTimelinePublisher } from '@haspataal/timeline';
import { ClinicalOrderStatus } from '@haspataal/types';

import { RadiologyStateMachine } from '../domain/state-machine/RadiologyStateMachine';

export interface VerifyReportDTO {
  reportId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
}

export class VerifyReportUseCase {
  static async execute(data: VerifyReportDTO) {
    const report = await prisma.radiologyReport.findUnique({
      where: { id: data.reportId },
      include: { study: { include: { clinicalOrder: true } } },
    });

    if (!report || !report.study) {
      throw new Error(`Report or associated study not found`);
    }

    const study = report.study;
    RadiologyStateMachine.validateTransition(study.status as any, 'REPORT_VERIFIED');
    RadiologyStateMachine.validateTransition('REPORT_VERIFIED', 'COMPLETED');

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
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    // Update the base order to COMPLETED
    if (study.clinicalOrderId) {
      await UpdateClinicalOrderStatusUseCase.execute({
        orderId: study.clinicalOrderId,
        status: ClinicalOrderStatus.COMPLETED,
        version: study.clinicalOrder?.version || 0,
        actorId: data.actorId,
        actorName: data.actorName,
        actorRole: data.actorRole,
      });
    }

    if (study.patientId && study.hospitalId && study.encounterId) {
      await getTimelinePublisher().publishStandardEvent({
        version: 1,
        type: 'RADIOLOGY_REPORT_VERIFIED',
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
          findings: report.findings,
          impression: report.impression,
        },
      });
    }

    return { success: true, report: updatedReport, study: updatedStudy };
  }
}

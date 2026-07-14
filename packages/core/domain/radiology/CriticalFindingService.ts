import { PrismaClient } from '@prisma/client';

import { OutboxService } from '../outbox/service';
import {
  DetectCriticalFindingInput,
  AcknowledgeCriticalFindingInput,
  RadiologyEventName,
} from './types';

export class CriticalFindingService {
  constructor(
    private prisma: PrismaClient,
    private outbox: OutboxService,
  ) {}

  async detectCriticalFinding(input: DetectCriticalFindingInput): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const report = await tx.radiologyReport.findUnique({
        where: { id: input.reportId },
        include: { executionItem: { include: { execution: true } } },
      });

      if (!report) throw new Error('Report not found');

      // Ensure no duplicate duplicate unacknowledged finding with same severity and finding string
      const existing = await tx.radiologyCriticalFinding.findFirst({
        where: {
          reportId: report.id,
          finding: input.finding,
          severity: input.severity,
          acknowledgedBy: null,
        },
      });

      if (existing) {
        return; // Already notified and pending acknowledgement
      }

      const finding = await tx.radiologyCriticalFinding.create({
        data: {
          reportId: report.id,
          finding: input.finding,
          severity: input.severity,
          notifiedDoctor: input.notifiedDoctor,
          notifiedNurse: input.notifiedNurse,
          communicationMethod: input.communicationMethod,
        },
      });

      await this.outbox.createEvent(
        tx,
        report.executionItem.execution.patientId,
        RadiologyEventName.CRITICAL_FINDING_DETECTED,
        {
          findingId: finding.id,
          reportId: report.id,
          finding: input.finding,
          severity: input.severity,
        },
      );
    });
  }

  async acknowledgeFinding(input: AcknowledgeCriticalFindingInput, actorId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Row lock to prevent concurrent acknowledgements
      await tx.$executeRaw`SELECT id FROM radiology_critical_findings WHERE id = ${input.findingId} FOR UPDATE`;

      const finding = await tx.radiologyCriticalFinding.findUnique({
        where: { id: input.findingId },
        include: { report: { include: { executionItem: { include: { execution: true } } } } },
      });

      if (!finding) throw new Error('Finding not found');
      if (finding.acknowledgedBy) throw new Error('Finding already acknowledged');

      await tx.radiologyCriticalFinding.update({
        where: { id: finding.id },
        data: {
          acknowledgedBy: actorId,
          acknowledgedAt: new Date(),
          communicationLog: input.communicationLog,
        },
      });

      await this.outbox.createEvent(
        tx,
        finding.report.executionItem.execution.patientId,
        RadiologyEventName.CRITICAL_FINDING_ACKNOWLEDGED,
        {
          findingId: finding.id,
          acknowledgedBy: actorId,
        },
      );
    });
  }
}

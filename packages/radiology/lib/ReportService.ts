import { PrismaClient } from '@prisma/client';

import { OutboxService } from '@haspataal/core';
import {
  CreateReportInput,
  VerifyReportInput,
  AmendReportInput,
  RadiologyEventName,
} from './types';

export class ReportService {
  constructor(
    private prisma: PrismaClient,
    private outbox: OutboxService,
  ) {}

  async createReport(input: CreateReportInput, actorId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Lock ExecutionItem
      await tx.$executeRaw`SELECT id FROM radiology_execution_items WHERE id = ${input.executionItemId} FOR UPDATE`;

      const executionItem = await tx.radiologyExecutionItem.findUnique({
        where: { id: input.executionItemId },
        include: { execution: true },
      });

      if (!executionItem) throw new Error('Execution item not found');

      // Check if report already exists
      const existingReport = await tx.radiologyReport.findUnique({
        where: { executionItemId: executionItem.id },
      });

      if (existingReport) {
        throw new Error('Report already exists. Use amendReport instead.');
      }

      const status = input.isPreliminary ? 'PRELIMINARY' : 'DRAFT';

      // Create Report and first Version
      const report = await tx.radiologyReport.create({
        data: {
          executionItemId: executionItem.id,
          studyId: input.studyId,
          status,
          versions: {
            create: {
              versionNumber: 1,
              text: input.text,
              enteredBy: actorId,
            },
          },
        },
        include: { versions: true },
      });

      const firstVersion = report.versions[0];

      // Update active version
      await tx.radiologyReport.update({
        where: { id: report.id },
        data: { activeVersionId: firstVersion.id },
      });

      // Update execution status
      await tx.radiologyExecution.update({
        where: { id: executionItem.executionId },
        data: { status: 'REPORTING' },
      });

      await tx.radiologyExecutionItem.update({
        where: { id: executionItem.id },
        data: { status: 'REPORTING' },
      });

      const eventType = input.isPreliminary
        ? RadiologyEventName.RADIOLOGY_REPORT_PRELIMINARY
        : RadiologyEventName.RADIOLOGY_REPORT_CREATED;

      await this.outbox.createEvent(tx, executionItem.execution.patientId, eventType, {
        reportId: report.id,
        versionId: firstVersion.id,
        executionItemId: executionItem.id,
      });
    });
  }

  async verifyReport(input: VerifyReportInput, actorId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Lock Report
      await tx.$executeRaw`SELECT id FROM radiology_reports WHERE id = ${input.reportId} FOR UPDATE`;

      const report = await tx.radiologyReport.findUnique({
        where: { id: input.reportId },
        include: {
          activeVersion: true,
          executionItem: { include: { execution: true } },
        },
      });

      if (!report) throw new Error('Report not found');
      if (['FINAL', 'AMENDED'].includes(report.status)) {
        throw new Error(`Report cannot be verified in status ${report.status}`);
      }

      if (!report.activeVersion) {
        throw new Error('No active version found to verify');
      }

      await tx.radiologyReportVersion.update({
        where: { id: report.activeVersion.id },
        data: {
          verifiedBy: actorId,
          verifiedAt: new Date(),
        },
      });

      await tx.radiologyReport.update({
        where: { id: report.id },
        data: { status: 'FINAL' },
      });

      await tx.radiologyExecution.update({
        where: { id: report.executionItem.executionId },
        data: { status: 'REPORT_VERIFIED' },
      });

      await tx.radiologyExecutionItem.update({
        where: { id: report.executionItemId },
        data: { status: 'REPORT_VERIFIED' },
      });

      await this.outbox.createEvent(
        tx,
        report.executionItem.execution.patientId,
        RadiologyEventName.RADIOLOGY_REPORT_FINAL,
        {
          reportId: report.id,
          versionId: report.activeVersion.id,
          executionItemId: report.executionItemId,
        },
      );
    });
  }

  async amendReport(input: AmendReportInput, actorId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Lock Report
      await tx.$executeRaw`SELECT id FROM radiology_reports WHERE id = ${input.reportId} FOR UPDATE`;

      const report = await tx.radiologyReport.findUnique({
        where: { id: input.reportId },
        include: {
          versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
          executionItem: { include: { execution: true } },
        },
      });

      if (!report) throw new Error('Report not found');

      const nextVersionNumber = (report.versions[0]?.versionNumber || 0) + 1;

      // Nullify current active version to avoid unique constraint conflict if necessary,
      // but Prisma should handle updates if replacing.
      // We will first disconnect, then connect.
      await tx.radiologyReport.update({
        where: { id: report.id },
        data: { activeVersion: { disconnect: true } },
      });

      const newVersion = await tx.radiologyReportVersion.create({
        data: {
          reportId: report.id,
          versionNumber: nextVersionNumber,
          text: input.text,
          enteredBy: actorId,
          // If amending, do we auto-verify or needs verification? Let's say it requires re-verification or is immediately amended.
          // Usually an amendment implies verified if done by a senior. Let's leave it unverified for this phase.
        },
      });

      await tx.radiologyReport.update({
        where: { id: report.id },
        data: {
          activeVersionId: newVersion.id,
          status: 'AMENDED',
        },
      });

      // No change to execution state usually, just report state.
      // Outbox event
      await this.outbox.createEvent(
        tx,
        report.executionItem.execution.patientId,
        RadiologyEventName.RADIOLOGY_REPORT_AMENDED,
        {
          reportId: report.id,
          versionId: newVersion.id,
          executionItemId: report.executionItemId,
          reason: input.reason,
        },
      );
    });
  }
}

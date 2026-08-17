import { PrismaClient } from '@prisma/client';

import { OutboxService } from '@haspataal/core';
import {
  CreateReportInput,
  VerifyReportInput,
  AmendReportInput,
  ProcedureEventName,
} from './types';

export class ReportService {
  constructor(
    private prisma: PrismaClient,
    private outbox: OutboxService,
  ) {}

  async createReport(input: CreateReportInput, actorId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const execution = await tx.procedureExecution.findUnique({
        where: { id: input.executionId },
      });

      if (!execution) throw new Error('Execution not found');

      const existingReport = await tx.procedureReport.findUnique({
        where: { executionId: input.executionId },
      });

      if (existingReport) {
        throw new Error('Report already exists for this execution');
      }

      const report = await tx.procedureReport.create({
        data: {
          executionId: input.executionId,
          status: 'DRAFT',
        },
      });

      const version = await tx.procedureReportVersion.create({
        data: {
          reportId: report.id,
          versionNumber: 1,
          text: input.text,
          authorId: actorId,
        },
      });

      await tx.procedureReport.update({
        where: { id: report.id },
        data: { activeVersionId: version.id },
      });

      await this.outbox.createEvent(
        tx,
        execution.patientId,
        ProcedureEventName.PROCEDURE_REPORT_CREATED,
        {
          reportId: report.id,
          executionId: execution.id,
          authorId: actorId,
          versionId: version.id,
        },
      );
    });
  }

  async verifyReport(input: VerifyReportInput, actorId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const report = await tx.procedureReport.findUnique({
        where: { id: input.reportId },
        include: { execution: true },
      });

      if (!report) throw new Error('Report not found');
      if (report.status === 'FINAL') throw new Error('Report is already FINAL');
      if (report.status === 'AMENDED') throw new Error('Report is already AMENDED');

      await tx.procedureReport.update({
        where: { id: report.id },
        data: { status: 'FINAL' },
      });

      await this.outbox.createEvent(
        tx,
        report.execution.patientId,
        ProcedureEventName.PROCEDURE_REPORT_FINAL,
        {
          reportId: report.id,
          executionId: report.executionId,
          verifiedBy: actorId,
        },
      );
    });
  }

  async amendReport(input: AmendReportInput, actorId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const report = await tx.procedureReport.findUnique({
        where: { id: input.reportId },
        include: { versions: true, execution: true },
      });

      if (!report) throw new Error('Report not found');
      if (report.status !== 'FINAL' && report.status !== 'AMENDED') {
        throw new Error(`Cannot amend report in status ${report.status}`);
      }

      const nextVersionNumber = report.versions.length + 1;

      const newVersion = await tx.procedureReportVersion.create({
        data: {
          reportId: report.id,
          versionNumber: nextVersionNumber,
          text: input.text,
          reason: input.reason,
          authorId: actorId,
        },
      });

      await tx.procedureReport.update({
        where: { id: report.id },
        data: {
          status: 'AMENDED',
          activeVersionId: newVersion.id,
        },
      });

      await this.outbox.createEvent(
        tx,
        report.execution.patientId,
        ProcedureEventName.PROCEDURE_REPORT_AMENDED,
        {
          reportId: report.id,
          executionId: report.executionId,
          authorId: actorId,
          versionId: newVersion.id,
          reason: input.reason,
        },
      );
    });
  }
}

import { PrismaClient, ReferralOutcome, ReferralStatus } from '@prisma/client';

import { OutboxService } from '@haspataal/core/domain/outbox/service';
import { ReferralEvent, ReferralEventType } from './types';

export class OutcomeService {
  constructor(
    private prisma: PrismaClient,
    private outbox: OutboxService,
  ) {}

  async recordOutcome(
    executionItemId: string,
    outcome: ReferralOutcome,
    reportedBy: string,
    options?: {
      clinicalFinding?: string;
      recommendationSummary?: string;
      followUpRequired?: boolean;
      followUpDays?: number;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.referralExecutionItem.findUniqueOrThrow({
        where: { id: executionItemId },
        include: { execution: true },
      });

      const report = await tx.referralOutcomeReport.create({
        data: {
          executionItemId,
          outcome,
          reportedBy,
          clinicalFinding: options?.clinicalFinding,
          recommendationSummary: options?.recommendationSummary,
          followUpRequired: options?.followUpRequired ?? false,
          followUpDays: options?.followUpDays,
          closedAt: outcome === ReferralOutcome.CLOSED ? new Date() : undefined,
        },
      });

      const itemStatus =
        outcome === ReferralOutcome.CLOSED
          ? ReferralStatus.COMPLETED
          : ReferralStatus.CONSULTATION_COMPLETED;

      await tx.referralExecutionItem.update({
        where: { id: executionItemId },
        data: { status: itemStatus },
      });

      await tx.referralAudit.create({
        data: {
          executionId: item.executionId,
          action: 'OUTCOME_REPORTED',
          performedBy: reportedBy,
          details: { outcome, reportId: report.id },
        },
      });

      return report;
    });
  }

  async closeOutcome(reportId: string, closedBy: string) {
    return this.prisma.$transaction(async (tx) => {
      return tx.referralOutcomeReport.update({
        where: { id: reportId },
        data: {
          outcome: ReferralOutcome.CLOSED,
          closedAt: new Date(),
        },
      });
    });
  }
}

import {
  PrismaClient,
  BloodUnitStatus,
  BloodRequestStatus,
  CrossmatchStatus,
} from '@prisma/client';

import { OutboxService } from '../outbox/service';
import { BloodBankEvent, BloodBankEventType } from './types';

export class IssueService {
  constructor(
    private prisma: PrismaClient,
    private outbox: OutboxService,
  ) {}

  async issueUnit(
    executionItemId: string,
    bloodUnitId: string,
    issuedBy: string,
    issuedTo: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Must be allocated
      const allocation = await tx.bloodAllocation.findUnique({
        where: {
          executionItemId_bloodUnitId: { executionItemId, bloodUnitId },
        },
      });
      if (!allocation || !allocation.active) {
        throw new Error('Unit is not allocated for this execution item.');
      }

      // Check crossmatch expiry
      const crossmatch = await tx.crossmatch.findFirst({
        where: { executionItemId, bloodUnitId, status: CrossmatchStatus.COMPATIBLE },
      });

      const executionItem = await tx.bloodBankExecutionItem.findUniqueOrThrow({
        where: { id: executionItemId },
        include: { execution: { include: { overrides: true } } },
      });
      const hasEmergencyOverride = executionItem.execution.overrides.length > 0;

      if (!hasEmergencyOverride) {
        if (!crossmatch) {
          throw new Error('Valid crossmatch required for issue without emergency override.');
        }
        if (crossmatch.expiryAt && crossmatch.expiryAt < new Date()) {
          throw new Error('Crossmatch has expired.');
        }
      }

      // Issue unit
      const issue = await tx.bloodIssue.create({
        data: {
          executionItemId,
          bloodUnitId,
          issuedBy,
          issuedTo,
          active: true,
        },
      });

      await tx.bloodAllocation.update({
        where: { id: allocation.id },
        data: { active: false },
      });

      await tx.bloodUnit.update({
        where: { id: bloodUnitId },
        data: { currentStatus: BloodUnitStatus.ISSUED },
      });

      await tx.bloodBankExecutionItem.update({
        where: { id: executionItemId },
        data: { status: BloodRequestStatus.ISSUED },
      });

      const event: BloodBankEvent = {
        eventId: crypto.randomUUID(),
        eventType: BloodBankEventType.BLOOD_ISSUED,
        hospitalId: executionItem.execution.hospitalId,
        patientId: executionItem.execution.patientId,
        executionId: executionItem.executionId,
        bloodUnitId,
        timestamp: new Date(),
        payload: { issueId: issue.id },
      };

      await this.outbox.createEvent(
        typeof tx !== 'undefined' ? tx : this.prisma,
        event.patientId,
        event.eventType,
        event.payload,
      );

      return issue;
    });
  }
}

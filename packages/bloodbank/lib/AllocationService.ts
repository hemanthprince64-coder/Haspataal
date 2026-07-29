import {
  PrismaClient,
  BloodUnitStatus,
  BloodRequestStatus,
  CrossmatchStatus,
} from '@prisma/client';

import { OutboxService } from '@haspataal/core';
import { BloodBankEvent, BloodBankEventType } from './types';

export class AllocationService {
  constructor(
    private prisma: PrismaClient,
    private outbox: OutboxService,
  ) {}

  async allocateUnit(executionItemId: string, bloodUnitId: string, allocatedBy: string) {
    return this.prisma.$transaction(async (tx) => {
      // Prevent double allocation
      const unit = await tx.bloodUnit.findUniqueOrThrow({
        where: { id: bloodUnitId },
      });
      if (unit.currentStatus !== BloodUnitStatus.AVAILABLE) {
        throw new Error('Blood unit is not available for allocation.');
      }

      // Check crossmatch or emergency override
      const executionItem = await tx.bloodBankExecutionItem.findUniqueOrThrow({
        where: { id: executionItemId },
        include: { execution: { include: { overrides: true } } },
      });

      const crossmatch = await tx.crossmatch.findFirst({
        where: {
          executionItemId,
          bloodUnitId,
          status: CrossmatchStatus.COMPATIBLE,
          expiryAt: { gt: new Date() },
        },
      });

      const hasEmergencyOverride = executionItem.execution.overrides.length > 0;

      if (!crossmatch && !hasEmergencyOverride) {
        throw new Error('Allocation requires valid crossmatch or emergency override.');
      }

      // Create allocation
      const allocation = await tx.bloodAllocation.create({
        data: {
          executionItemId,
          bloodUnitId,
          allocatedBy,
          active: true,
        },
      });

      await tx.bloodUnit.update({
        where: { id: bloodUnitId },
        data: { currentStatus: BloodUnitStatus.RESERVED },
      });

      await tx.bloodBankExecutionItem.update({
        where: { id: executionItemId },
        data: { status: BloodRequestStatus.ALLOCATED },
      });

      const event: BloodBankEvent = {
        eventId: crypto.randomUUID(),
        eventType: BloodBankEventType.BLOOD_ALLOCATED,
        hospitalId: executionItem.execution.hospitalId,
        patientId: executionItem.execution.patientId,
        executionId: executionItem.executionId,
        bloodUnitId,
        timestamp: new Date(),
        payload: { allocationId: allocation.id },
      };

      await this.outbox.createEvent(
        this.prisma,
        event.patientId,
        event.eventType,
        event.payload,
      );

      return allocation;
    });
  }
}

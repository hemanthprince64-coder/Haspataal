import {
  PrismaClient,
  CrossmatchStatus,
  BloodRequestStatus,
  BloodComponentType,
} from '@prisma/client';

import { OutboxService } from '../outbox/service';
import { BloodBankEvent, BloodBankEventType } from './types';

export class CrossmatchService {
  constructor(
    private prisma: PrismaClient,
    private outbox: OutboxService,
  ) {}

  async startCrossmatch(executionItemId: string, bloodUnitId: string, technicianId: string) {
    const crossmatch = await this.prisma.crossmatch.create({
      data: {
        executionItemId,
        bloodUnitId,
        status: CrossmatchStatus.PENDING,
        technicianId,
        performedAt: new Date(),
      },
      include: {
        executionItem: { include: { execution: true } },
      },
    });

    await this.prisma.bloodBankExecutionItem.update({
      where: { id: executionItemId },
      data: { status: BloodRequestStatus.CROSSMATCH_PENDING },
    });

    const event: BloodBankEvent = {
      eventId: crypto.randomUUID(),
      eventType: BloodBankEventType.CROSSMATCH_STARTED,
      hospitalId: crossmatch.executionItem.execution.hospitalId,
      patientId: crossmatch.executionItem.execution.patientId,
      executionId: crossmatch.executionItem.executionId,
      bloodUnitId,
      timestamp: new Date(),
      payload: { crossmatchId: crossmatch.id },
    };

    await this.outbox.createEvent(
      typeof tx !== 'undefined' ? tx : this.prisma,
      event.patientId,
      event.eventType,
      event.payload,
    );

    return crossmatch;
  }

  async completeCrossmatch(crossmatchId: string, status: CrossmatchStatus) {
    const crossmatch = await this.prisma.crossmatch.update({
      where: { id: crossmatchId },
      data: { status },
      include: {
        executionItem: { include: { execution: true } },
        bloodUnit: true,
      },
    });

    // Determine validity hours based on policy
    let expiryAt = new Date();
    expiryAt.setHours(expiryAt.getHours() + 72); // Default fallback

    try {
      const policy = await this.prisma.hospitalBloodBankPolicy.findUnique({
        where: {
          hospitalId_componentType: {
            hospitalId: crossmatch.executionItem.execution.hospitalId,
            componentType: crossmatch.bloodUnit.componentType,
          },
        },
      });
      if (policy && policy.defaultCrossmatchValidityHours) {
        expiryAt = new Date();
        expiryAt.setHours(expiryAt.getHours() + policy.defaultCrossmatchValidityHours);
      }
    } catch (e) {
      // Ignore policy lookup errors, rely on fallback
    }

    if (status === CrossmatchStatus.COMPATIBLE) {
      await this.prisma.crossmatch.update({
        where: { id: crossmatchId },
        data: { expiryAt },
      });

      await this.prisma.bloodBankExecutionItem.update({
        where: { id: crossmatch.executionItemId },
        data: { status: BloodRequestStatus.CROSSMATCH_COMPLETE },
      });
    }

    const event: BloodBankEvent = {
      eventId: crypto.randomUUID(),
      eventType:
        status === CrossmatchStatus.COMPATIBLE
          ? BloodBankEventType.CROSSMATCH_COMPLETED
          : BloodBankEventType.CROSSMATCH_FAILED,
      hospitalId: crossmatch.executionItem.execution.hospitalId,
      patientId: crossmatch.executionItem.execution.patientId,
      executionId: crossmatch.executionItem.executionId,
      bloodUnitId: crossmatch.bloodUnitId,
      timestamp: new Date(),
      payload: { crossmatchId, status },
    };

    await this.outbox.createEvent(
      typeof tx !== 'undefined' ? tx : this.prisma,
      event.patientId,
      event.eventType,
      event.payload,
    );

    return crossmatch;
  }

  async authorizeEmergencyOverride(
    executionId: string,
    authorizedBy: string,
    reason: string,
    clinicalJustification: string,
  ) {
    const override = await this.prisma.emergencyBloodOverride.create({
      data: {
        executionId,
        authorizedBy,
        reason,
        clinicalJustification,
        overrideType: 'UNCROSSMATCHED_O_NEGATIVE',
      },
      include: {
        execution: true,
      },
    });

    const event: BloodBankEvent = {
      eventId: crypto.randomUUID(),
      eventType: BloodBankEventType.EMERGENCY_BLOOD_OVERRIDE_APPROVED,
      hospitalId: override.execution.hospitalId,
      patientId: override.execution.patientId,
      executionId,
      timestamp: new Date(),
      payload: { overrideId: override.id },
    };

    await this.outbox.createEvent(
      typeof tx !== 'undefined' ? tx : this.prisma,
      event.patientId,
      event.eventType,
      event.payload,
    );

    return override;
  }
}

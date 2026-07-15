import { PrismaClient, ReferralStatus, ReferralType, ReferralPriority } from '@prisma/client';
import { createHash } from 'crypto';

import { OutboxService } from '../outbox/service';
import { ReferralEvent, ReferralEventType, CreateReferralInput } from './types';

export class ReferralExecutionService {
  constructor(
    private prisma: PrismaClient,
    private outbox: OutboxService,
  ) {}

  /**
   * Provision a ReferralExecution from a canonical REFERRAL order.
   * This is the entry point called by the ReferralConsumer.
   * The canonical Order is NEVER mutated.
   */
  async provisionExecution(input: CreateReferralInput) {
    return this.prisma.$transaction(async (tx) => {
      // Create ReferralExecution
      const execution = await tx.referralExecution.create({
        data: {
          orderId: input.orderId,
          hospitalId: input.hospitalId,
          patientId: input.patientId,
          referralType: input.referralType as ReferralType,
          status: ReferralStatus.DRAFT,
          priority: input.priority as ReferralPriority,
          clinicalSummary: input.clinicalSummary,
          reasonForReferral: input.reasonForReferral,
          requestingDoctorId: input.requestingDoctorId,
        },
      });

      // Create ReferralExecutionItem
      const item = await tx.referralExecutionItem.create({
        data: {
          executionId: execution.id,
          orderItemId: input.orderItemId,
          status: ReferralStatus.DRAFT,
          specialtyCode: input.specialtyCode,
          departmentCode: input.departmentCode,
          recipients: {
            create: input.recipients.map((r) => ({
              recipientType: r.recipientType,
              recipientId: r.recipientId,
              recipientName: r.recipientName,
              recipientHospitalId: r.recipientHospitalId,
              recipientSpecialty: r.recipientSpecialty,
            })),
          },
        },
        include: { recipients: true },
      });

      // Audit trail
      await tx.referralAudit.create({
        data: {
          executionId: execution.id,
          action: 'EXECUTION_PROVISIONED',
          performedBy: input.requestingDoctorId,
          details: { orderId: input.orderId, recipientCount: input.recipients.length },
        },
      });

      const event: ReferralEvent = {
        eventId: crypto.randomUUID(),
        eventType: ReferralEventType.REFERRAL_CREATED,
        executionId: execution.id,
        orderId: input.orderId,
        itemId: item.id,
        hospitalId: input.hospitalId,
        patientId: input.patientId,
        timestamp: new Date(),
        payload: {
          referralType: input.referralType,
          priority: input.priority,
          recipientCount: input.recipients.length,
        },
      };

      await this.outbox.createEvent(tx, input.patientId, event.eventType, event.payload);

      return { execution, item };
    });
  }

  /**
   * Submit a drafted referral — transitions DRAFT → SUBMITTED → SENT.
   */
  async submitReferral(executionId: string, submittedBy: string) {
    return this.prisma.$transaction(async (tx) => {
      const execution = await tx.referralExecution.findUniqueOrThrow({
        where: { id: executionId },
        include: { items: { include: { recipients: true } } },
      });

      if (
        execution.status !== ReferralStatus.DRAFT &&
        execution.status !== ReferralStatus.SUBMITTED
      ) {
        throw new Error(`Cannot submit referral in status ${execution.status}`);
      }

      const updated = await tx.referralExecution.update({
        where: { id: executionId },
        data: { status: ReferralStatus.SENT, sentAt: new Date() },
      });

      await tx.referralExecutionItem.updateMany({
        where: { executionId },
        data: { status: ReferralStatus.SENT },
      });

      await tx.referralAudit.create({
        data: {
          executionId,
          action: 'REFERRAL_SENT',
          performedBy: submittedBy,
          details: { sentAt: new Date() },
        },
      });

      const event: ReferralEvent = {
        eventId: crypto.randomUUID(),
        eventType: ReferralEventType.REFERRAL_SENT,
        executionId,
        hospitalId: execution.hospitalId,
        patientId: execution.patientId,
        timestamp: new Date(),
        payload: { sentBy: submittedBy },
      };

      await this.outbox.createEvent(tx, execution.patientId, event.eventType, event.payload);

      return updated;
    });
  }

  /**
   * Cancel a referral before completion.
   */
  async cancelReferral(executionId: string, cancelledBy: string, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      const execution = await tx.referralExecution.findUniqueOrThrow({
        where: { id: executionId },
      });

      const terminalStatuses: ReferralStatus[] = [
        ReferralStatus.COMPLETED,
        ReferralStatus.CANCELLED,
      ];

      if (terminalStatuses.includes(execution.status)) {
        throw new Error(`Cannot cancel referral in terminal status ${execution.status}`);
      }

      const updated = await tx.referralExecution.update({
        where: { id: executionId },
        data: {
          status: ReferralStatus.CANCELLED,
          cancelledAt: new Date(),
          cancellationReason: reason,
        },
      });

      await tx.referralAudit.create({
        data: {
          executionId,
          action: 'REFERRAL_CANCELLED',
          performedBy: cancelledBy,
          details: { reason },
        },
      });

      const event: ReferralEvent = {
        eventId: crypto.randomUUID(),
        eventType: ReferralEventType.REFERRAL_CANCELLED,
        executionId,
        hospitalId: execution.hospitalId,
        patientId: execution.patientId,
        timestamp: new Date(),
        payload: { cancelledBy, reason },
      };

      await this.outbox.createEvent(tx, execution.patientId, event.eventType, event.payload);

      return updated;
    });
  }

  /**
   * Mark referral as fully completed (e.g., after outcome report).
   */
  async completeReferral(executionId: string, completedBy: string) {
    return this.prisma.$transaction(async (tx) => {
      const execution = await tx.referralExecution.findUniqueOrThrow({
        where: { id: executionId },
      });

      const updated = await tx.referralExecution.update({
        where: { id: executionId },
        data: {
          status: ReferralStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      await tx.referralAudit.create({
        data: {
          executionId,
          action: 'REFERRAL_COMPLETED',
          performedBy: completedBy,
          details: { completedAt: new Date() },
        },
      });

      const event: ReferralEvent = {
        eventId: crypto.randomUUID(),
        eventType: ReferralEventType.REFERRAL_COMPLETED,
        executionId,
        hospitalId: execution.hospitalId,
        patientId: execution.patientId,
        timestamp: new Date(),
        payload: { completedBy },
      };

      await this.outbox.createEvent(tx, execution.patientId, event.eventType, event.payload);

      return updated;
    });
  }
}

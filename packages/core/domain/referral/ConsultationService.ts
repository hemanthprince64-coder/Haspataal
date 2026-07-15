import { PrismaClient, ReferralStatus } from '@prisma/client';
import { createHash } from 'crypto';

import { OutboxService } from '../outbox/service';
import { ReferralEvent, ReferralEventType } from './types';

export class ConsultationService {
  constructor(
    private prisma: PrismaClient,
    private outbox: OutboxService,
  ) {}

  /**
   * Accept a referral for consultation. Transitions SENT/ACCEPTED.
   * Advice-only consultations NEVER transfer ownership.
   */
  async acceptReferral(
    executionItemId: string,
    respondedBy: string,
    clinicalNotes?: string,
    isAdviceOnly: boolean = false,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.referralExecutionItem.findUniqueOrThrow({
        where: { id: executionItemId },
        include: { execution: true },
      });

      await tx.referralExecutionItem.update({
        where: { id: executionItemId },
        data: { status: ReferralStatus.ACCEPTED },
      });

      await tx.referralExecution.update({
        where: { id: item.executionId },
        data: { status: ReferralStatus.ACCEPTED },
      });

      // Record response (immutable, append-only)
      await tx.referralResponse.create({
        data: {
          executionItemId,
          respondedBy,
          decision: 'ACCEPTED',
          clinicalNotes,
          isAdviceOnly,
        },
      });

      await tx.referralAudit.create({
        data: {
          executionId: item.executionId,
          action: 'REFERRAL_ACCEPTED',
          performedBy: respondedBy,
          details: { executionItemId, isAdviceOnly },
        },
      });

      const event: ReferralEvent = {
        eventId: crypto.randomUUID(),
        eventType: ReferralEventType.REFERRAL_ACCEPTED,
        executionId: item.executionId,
        itemId: executionItemId,
        hospitalId: item.execution.hospitalId,
        patientId: item.execution.patientId,
        timestamp: new Date(),
        payload: { respondedBy, isAdviceOnly },
      };

      await this.outbox.createEvent(tx, item.execution.patientId, event.eventType, event.payload);

      return item;
    });
  }

  /**
   * Decline a referral consultation.
   */
  async declineReferral(executionItemId: string, respondedBy: string, declineReason: string) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.referralExecutionItem.findUniqueOrThrow({
        where: { id: executionItemId },
        include: { execution: true },
      });

      await tx.referralExecutionItem.update({
        where: { id: executionItemId },
        data: { status: ReferralStatus.DECLINED },
      });

      // Record response
      await tx.referralResponse.create({
        data: {
          executionItemId,
          respondedBy,
          decision: 'DECLINED',
          declineReason,
        },
      });

      await tx.referralAudit.create({
        data: {
          executionId: item.executionId,
          action: 'REFERRAL_DECLINED',
          performedBy: respondedBy,
          details: { executionItemId, declineReason },
        },
      });

      const event: ReferralEvent = {
        eventId: crypto.randomUUID(),
        eventType: ReferralEventType.REFERRAL_DECLINED,
        executionId: item.executionId,
        itemId: executionItemId,
        hospitalId: item.execution.hospitalId,
        patientId: item.execution.patientId,
        timestamp: new Date(),
        payload: { respondedBy, declineReason },
      };

      await this.outbox.createEvent(tx, item.execution.patientId, event.eventType, event.payload);

      return item;
    });
  }

  /**
   * Start a consultation session.
   */
  async startConsultation(executionId: string, startedBy: string) {
    return this.prisma.$transaction(async (tx) => {
      const execution = await tx.referralExecution.findUniqueOrThrow({
        where: { id: executionId },
      });

      const updated = await tx.referralExecution.update({
        where: { id: executionId },
        data: { status: ReferralStatus.CONSULTATION_IN_PROGRESS },
      });

      await tx.referralAudit.create({
        data: {
          executionId,
          action: 'CONSULTATION_STARTED',
          performedBy: startedBy,
          details: { startedAt: new Date() },
        },
      });

      const event: ReferralEvent = {
        eventId: crypto.randomUUID(),
        eventType: ReferralEventType.CONSULTATION_STARTED,
        executionId,
        hospitalId: execution.hospitalId,
        patientId: execution.patientId,
        timestamp: new Date(),
        payload: { startedBy },
      };

      await this.outbox.createEvent(tx, execution.patientId, event.eventType, event.payload);

      return updated;
    });
  }

  /**
   * Complete a consultation (advice-only — no ownership transfer).
   */
  async completeConsultation(executionId: string, completedBy: string) {
    return this.prisma.$transaction(async (tx) => {
      const execution = await tx.referralExecution.findUniqueOrThrow({
        where: { id: executionId },
      });

      const updated = await tx.referralExecution.update({
        where: { id: executionId },
        data: { status: ReferralStatus.CONSULTATION_COMPLETED },
      });

      await tx.referralAudit.create({
        data: {
          executionId,
          action: 'CONSULTATION_COMPLETED',
          performedBy: completedBy,
          details: { completedAt: new Date() },
        },
      });

      const event: ReferralEvent = {
        eventId: crypto.randomUUID(),
        eventType: ReferralEventType.CONSULTATION_COMPLETED,
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

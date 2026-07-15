import { PrismaClient, CareTransferStatus, ReferralStatus } from '@prisma/client';

import { OutboxService } from '../outbox/service';
import { ReferralEvent, ReferralEventType } from './types';

/**
 * CareTransferService — the ONLY service allowed to invoke DoctorPatientRelationshipService.
 *
 * CONSTITUTIONAL INVARIANT:
 *  - Consultation NEVER transfers care ownership.
 *  - Advice-only referrals NEVER modify the primary treating doctor.
 *  - CareTransfer ONLY changes ownership upon explicit CareTransfer.ACCEPTED & COMPLETED.
 *  - The DoctorPatientRelationship is updated only through this service.
 */
export class CareTransferService {
  constructor(
    private prisma: PrismaClient,
    private outbox: OutboxService,
  ) {}

  /**
   * Request a care transfer.
   * Creates a CareTransfer record and emits CARE_TRANSFER_REQUESTED.
   */
  async requestTransfer(
    executionId: string,
    fromDoctorId: string,
    toDoctorId: string,
    patientId: string,
    requestedBy: string,
    clinicalJustification: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const execution = await tx.referralExecution.findUniqueOrThrow({
        where: { id: executionId },
      });

      // Cannot create duplicate care transfer for same execution
      const existing = await tx.careTransfer.findUnique({
        where: { executionId },
      });

      if (existing) {
        throw new Error('A CareTransfer already exists for this referral execution.');
      }

      const transfer = await tx.careTransfer.create({
        data: {
          executionId,
          fromDoctorId,
          toDoctorId,
          patientId,
          requestedBy,
          clinicalJustification,
          status: CareTransferStatus.REQUESTED,
        },
      });

      await tx.referralExecution.update({
        where: { id: executionId },
        data: { status: ReferralStatus.CARE_TRANSFER_REQUESTED },
      });

      await tx.referralAudit.create({
        data: {
          executionId,
          action: 'CARE_TRANSFER_REQUESTED',
          performedBy: requestedBy,
          details: { fromDoctorId, toDoctorId, transferId: transfer.id },
        },
      });

      const event: ReferralEvent = {
        eventId: crypto.randomUUID(),
        eventType: ReferralEventType.CARE_TRANSFER_REQUESTED,
        executionId,
        careTransferId: transfer.id,
        hospitalId: execution.hospitalId,
        patientId: execution.patientId,
        timestamp: new Date(),
        payload: { fromDoctorId, toDoctorId, transferId: transfer.id },
      };

      await this.outbox.createEvent(tx, execution.patientId, event.eventType, event.payload);

      return transfer;
    });
  }

  /**
   * Accept the care transfer request.
   */
  async acceptTransfer(transferId: string, acceptedBy: string) {
    return this.prisma.$transaction(async (tx) => {
      const transfer = await tx.careTransfer.findUniqueOrThrow({
        where: { id: transferId },
        include: { execution: true },
      });

      if (transfer.status !== CareTransferStatus.REQUESTED) {
        throw new Error(`Cannot accept transfer in status ${transfer.status}`);
      }

      const updated = await tx.careTransfer.update({
        where: { id: transferId },
        data: {
          status: CareTransferStatus.ACCEPTED,
          acceptedAt: new Date(),
          acceptedBy,
        },
      });

      await tx.referralExecution.update({
        where: { id: transfer.executionId },
        data: { status: ReferralStatus.CARE_TRANSFER_ACCEPTED },
      });

      await tx.referralAudit.create({
        data: {
          executionId: transfer.executionId,
          action: 'CARE_TRANSFER_ACCEPTED',
          performedBy: acceptedBy,
          details: { transferId },
        },
      });

      const event: ReferralEvent = {
        eventId: crypto.randomUUID(),
        eventType: ReferralEventType.CARE_TRANSFER_ACCEPTED,
        executionId: transfer.executionId,
        careTransferId: transferId,
        hospitalId: transfer.execution.hospitalId,
        patientId: transfer.execution.patientId,
        timestamp: new Date(),
        payload: { acceptedBy, transferId },
      };

      await this.outbox.createEvent(
        tx,
        transfer.execution.patientId,
        event.eventType,
        event.payload,
      );

      return updated;
    });
  }

  /**
   * Reject the care transfer request.
   */
  async rejectTransfer(transferId: string, rejectedBy: string, rejectionReason: string) {
    return this.prisma.$transaction(async (tx) => {
      const transfer = await tx.careTransfer.findUniqueOrThrow({
        where: { id: transferId },
        include: { execution: true },
      });

      if (transfer.status !== CareTransferStatus.REQUESTED) {
        throw new Error(`Cannot reject transfer in status ${transfer.status}`);
      }

      const updated = await tx.careTransfer.update({
        where: { id: transferId },
        data: {
          status: CareTransferStatus.REJECTED,
          rejectedAt: new Date(),
          rejectedBy,
          rejectionReason,
        },
      });

      await tx.referralAudit.create({
        data: {
          executionId: transfer.executionId,
          action: 'CARE_TRANSFER_REJECTED',
          performedBy: rejectedBy,
          details: { transferId, rejectionReason },
        },
      });

      const event: ReferralEvent = {
        eventId: crypto.randomUUID(),
        eventType: ReferralEventType.CARE_TRANSFER_REJECTED,
        executionId: transfer.executionId,
        careTransferId: transferId,
        hospitalId: transfer.execution.hospitalId,
        patientId: transfer.execution.patientId,
        timestamp: new Date(),
        payload: { rejectedBy, rejectionReason },
      };

      await this.outbox.createEvent(
        tx,
        transfer.execution.patientId,
        event.eventType,
        event.payload,
      );

      return updated;
    });
  }

  /**
   * Execute the care transfer — the only place that modifies DoctorPatientRelationship.
   *
   * CONSTITUTIONAL INVARIANT: Only this method may create/update the care relationship.
   * This represents a COMPLETED care handover, not just an agreement.
   *
   * Uses the existing Phase 2 DoctorPatientRelationship model fields:
   *   - patientId, doctorId, level, status, carePurpose, sourceTrigger
   */
  async executeTransfer(transferId: string, executedBy: string) {
    return this.prisma.$transaction(async (tx) => {
      const transfer = await tx.careTransfer.findUniqueOrThrow({
        where: { id: transferId },
        include: { execution: true },
      });

      if (transfer.status !== CareTransferStatus.ACCEPTED) {
        throw new Error(
          `Cannot execute transfer that is not ACCEPTED. Current: ${transfer.status}`,
        );
      }

      // End existing ACTIVE relationships from the transferring doctor
      await tx.doctorPatientRelationship.updateMany({
        where: {
          patientId: transfer.patientId,
          doctorId: transfer.fromDoctorId,
          status: 'ACTIVE',
        },
        data: {
          status: 'ENDED',
          endedAt: new Date(),
          endedBy: executedBy,
          terminationReason: 'TRANSFER_ACCEPTED',
        },
      });

      // Create new ACTIVE primary relationship with the receiving doctor
      const newRelationship = await tx.doctorPatientRelationship.create({
        data: {
          patientId: transfer.patientId,
          doctorId: transfer.toDoctorId,
          level: 'LONGITUDINAL',
          status: 'ACTIVE',
          carePurpose: 'PRIMARY_TREATMENT',
          sourceTrigger: 'REFERRAL_ACCEPTED',
          activatedAt: new Date(),
        },
      });

      // Mark transfer as completed
      const updated = await tx.careTransfer.update({
        where: { id: transferId },
        data: {
          status: CareTransferStatus.COMPLETED,
          completedAt: new Date(),
          relationshipId: newRelationship.id,
        },
      });

      await tx.referralExecution.update({
        where: { id: transfer.executionId },
        data: { status: ReferralStatus.CARE_TRANSFER_COMPLETED },
      });

      await tx.referralAudit.create({
        data: {
          executionId: transfer.executionId,
          action: 'CARE_TRANSFER_COMPLETED',
          performedBy: executedBy,
          details: {
            transferId,
            fromDoctorId: transfer.fromDoctorId,
            toDoctorId: transfer.toDoctorId,
            newRelationshipId: newRelationship.id,
          },
        },
      });

      const event: ReferralEvent = {
        eventId: crypto.randomUUID(),
        eventType: ReferralEventType.CARE_TRANSFER_COMPLETED,
        executionId: transfer.executionId,
        careTransferId: transferId,
        hospitalId: transfer.execution.hospitalId,
        patientId: transfer.execution.patientId,
        timestamp: new Date(),
        payload: {
          executedBy,
          fromDoctorId: transfer.fromDoctorId,
          toDoctorId: transfer.toDoctorId,
          newRelationshipId: newRelationship.id,
        },
      };

      await this.outbox.createEvent(
        tx,
        transfer.execution.patientId,
        event.eventType,
        event.payload,
      );

      return { transfer: updated, newRelationship };
    });
  }
}

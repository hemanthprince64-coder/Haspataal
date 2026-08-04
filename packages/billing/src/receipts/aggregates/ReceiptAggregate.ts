import { EventBus } from '@haspataal/platform-contracts';
import { PrismaClient, ReceiptStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

import { BillingEventTypes } from '../../events/BillingEvents';
import { Money } from '../../pricing/Money';
import { ReceiptNumberGenerator } from '../services/ReceiptNumberGenerator';

const prisma = new PrismaClient();
const EventBusMock = {
  publish: (event: any) => {
    console.log(`[EventBus] Published ${event.eventType}`, event);
  },
};

export interface GenerateReceiptCommand {
  hospitalId: string;
  patientId: string;
  allocationIds: string[];
  userId: string;
}

export class ReceiptAggregate {
  private numberGenerator = new ReceiptNumberGenerator();

  /**
   * Generates a Receipt from a set of PaymentAllocations.
   * Ensures that all allocations belong to the given hospital and patient,
   * and that they are not already associated with a receipt.
   */
  public async generate(command: GenerateReceiptCommand): Promise<string> {
    const { hospitalId, patientId, allocationIds, userId } = command;

    if (!allocationIds || allocationIds.length === 0) {
      throw new Error('Cannot generate a receipt without allocations');
    }

    return await prisma.$transaction(
      async (tx) => {
        // 1. Fetch all allocations
        const allocations = await tx.paymentAllocation.findMany({
          where: { id: { in: allocationIds } },
          include: {
            payment: true,
            invoice: {
              include: {
                lineItems: true,
              },
            },
            ReceiptLine: true,
          },
        });

        if (allocations.length !== allocationIds.length) {
          throw new Error('One or more payment allocations were not found');
        }

        // 2. Validate rules
        let totalAmount = new Money(0, 'INR');

        for (const allocation of allocations) {
          if (allocation.hospitalId !== hospitalId) {
            throw new Error(
              `Allocation ${allocation.id} does not belong to hospital ${hospitalId}`,
            );
          }

          // Ensure patient matches. Allocation's payment must belong to patient.
          if (allocation.payment.patientId !== patientId) {
            throw new Error(`Allocation ${allocation.id} does not belong to patient ${patientId}`);
          }

          if (allocation.ReceiptLine) {
            throw new Error(
              `Allocation ${allocation.id} is already receipted (ReceiptLine ${allocation.ReceiptLine.id})`,
            );
          }

          if (allocation.status !== 'ACTIVE') {
            throw new Error(
              `Cannot receipt a non-active allocation (${allocation.id} is ${allocation.status})`,
            );
          }

          if (allocation.currency !== 'INR') {
            throw new Error(
              `Currency mismatch. Allocation currency ${allocation.currency} is not supported by receipt engine`,
            );
          }

          totalAmount = totalAmount.add(new Money(allocation.allocatedAmount));
        }

        // 3. Fetch Hospital and Patient for snapshotting
        const hospital = await tx.hospitalsMaster.findUniqueOrThrow({
          where: { id: hospitalId },
        });

        const patient = await tx.patient.findUniqueOrThrow({
          where: { id: patientId },
        });

        // 4. Create immutable snapshot
        const snapshot = {
          hospital: {
            id: hospital.id,
            name: hospital.displayName || hospital.legalName,
            registrationNumber: hospital.registrationNumber,
            gstNumber: hospital.gstNumber,
            address: `${hospital.addressLine1 || ''} ${hospital.city || ''}`,
          },
          patient: {
            id: patient.id,
            name: patient.name,
          },
          allocations: allocations.map((a) => ({
            allocationId: a.id,
            allocationNumber: a.allocationNumber,
            invoiceId: a.invoiceId,
            invoiceNumber: a.invoice.invoiceNumber,
            paymentMethod: a.payment.method,
            amount: a.allocatedAmount.toNumber(),
          })),
          generatedAt: new Date().toISOString(),
          generatedBy: userId,
        };

        // 5. Generate Sequential Receipt Number
        const receiptNumber = await this.numberGenerator.generateNext(hospitalId, tx);

        // 6. Create Receipt and ReceiptLines
        const receipt = await tx.receipt.create({
          data: {
            hospitalId,
            patientId,
            receiptNumber,
            totalAmount: totalAmount.toDecimal(),
            status: ReceiptStatus.ISSUED,
            snapshot,
            createdBy: userId,
            lines: {
              create: allocations.map((a) => ({
                allocationId: a.id,
                invoiceId: a.invoiceId,
                amount: a.allocatedAmount,
              })),
            },
          },
          include: {
            lines: true,
          },
        });

        // 7. Emit Domain Event
        EventBusMock.publish({
          eventId: randomUUID(),
          eventType: BillingEventTypes.RECEIPT_GENERATED,
          eventVersion: 1,
          schemaVersion: '1.0.0',
          occurredAt: new Date().toISOString(),
          aggregate: { aggregateId: receipt.id, aggregateType: 'Receipt' },
          actor: { actorId: userId, actorType: 'USER' },
          scope: { hospitalId },
          payload: {
            receiptNumber,
            totalAmount: totalAmount.toNumber(),
            allocationIds,
          },
        });

        return receipt.id;
      },
      { isolationLevel: 'ReadCommitted' },
    );
  }

  public async void(
    receiptId: string,
    reason: string,
    userId: string,
    hospitalId: string,
  ): Promise<void> {
    await prisma.$transaction(
      async (tx) => {
        const receipt = await tx.receipt.findUniqueOrThrow({
          where: { id: receiptId },
        });

        if (receipt.hospitalId !== hospitalId) {
          throw new Error('Hospital ID mismatch');
        }

        if (receipt.status === ReceiptStatus.VOIDED) {
          throw new Error('Receipt is already voided');
        }

        await tx.receipt.update({
          where: { id: receiptId },
          data: {
            status: ReceiptStatus.VOIDED,
            voidReason: reason,
          },
        });

        EventBusMock.publish({
          eventId: randomUUID(),
          eventType: BillingEventTypes.RECEIPT_VOIDED,
          eventVersion: 1,
          schemaVersion: '1.0.0',
          occurredAt: new Date().toISOString(),
          aggregate: { aggregateId: receiptId, aggregateType: 'Receipt' },
          actor: { actorId: userId, actorType: 'USER' },
          scope: { hospitalId },
          payload: {
            receiptNumber: receipt.receiptNumber,
            reason,
          },
        });
      },
      { isolationLevel: 'ReadCommitted' },
    );
  }
}

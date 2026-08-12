import { Prisma, PrismaClient, BillingAuditAction } from '@haspataal/db';
import { eventBus } from '@haspataal/events';
import { v4 as uuidv4 } from 'uuid';

import { createBillGeneratedEvent } from '../events/BillingEvents';
import { InvoiceNumberGenerator } from '../services/InvoiceNumberGenerator';

export class InvoiceAggregate {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Generates an invoice for all UNBILLED charge items for a specific patient and hospital.
   * Runs atomically in a single database transaction.
   */
  public async generate(
    hospitalId: string,
    patientId: string,
    performedBy?: string,
  ): Promise<string | null> {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Fetch UNBILLED ChargeItems and lock them using ALLOCATED status.
      const unbilledCharges = await tx.chargeItem.findMany({
        where: {
          hospitalId,
          patientId,
          status: 'UNBILLED',
        },
      });

      if (unbilledCharges.length === 0) {
        return null;
      }

      const chargeItemIds = unbilledCharges.map((c) => c.id);

      // Lock them by changing status to ALLOCATED
      const allocateResult = await tx.chargeItem.updateMany({
        where: {
          id: { in: chargeItemIds },
          status: 'UNBILLED',
        },
        data: {
          status: 'ALLOCATED',
        },
      });

      if (allocateResult.count !== unbilledCharges.length) {
        throw new Error(
          'Concurrency conflict: Some charge items were modified by another process.',
        );
      }

      // Fetch patient and hospital for immutable snapshot
      const patient = await tx.patient.findUnique({ where: { id: patientId } });
      const hospital = await tx.hospitalsMaster.findUnique({ where: { id: hospitalId } });

      if (!patient || !hospital) {
        throw new Error('Patient or Hospital missing during invoice generation.');
      }

      // 2. Compute Invoice Totals exactly from ChargeItems (no recalculation of prices)
      let subtotal = new Prisma.Decimal(0);
      let gstTotal = new Prisma.Decimal(0);
      let discountTotal = new Prisma.Decimal(0);
      let totalAmount = new Prisma.Decimal(0);

      let billingAccountId: string | undefined;

      const lineItemsData: Prisma.InvoiceLineItemCreateManyInvoiceInput[] = [];

      for (const charge of unbilledCharges) {
        if (charge.billingAccountId && !billingAccountId) {
          billingAccountId = charge.billingAccountId;
        }

        subtotal = subtotal.add(charge.grossAmount);
        gstTotal = gstTotal.add(charge.taxAmount);
        discountTotal = discountTotal.add(charge.discountAmount);
        totalAmount = totalAmount.add(charge.netAmount);

        lineItemsData.push({
          chargeItemId: charge.id,
          description: `Charge for ${charge.sourceEvent}`,
          type: 'CONSULTATION', // fallback or mapped
          quantity: charge.quantity,
          unitPrice: charge.unitPrice,
          gstAmount: charge.taxAmount,
          discountAmount: charge.discountAmount,
          taxableAmount: charge.grossAmount,
          totalAmount: charge.netAmount,
        });
      }

      // 3. Generate Invoice Number
      const invoiceNumber = await InvoiceNumberGenerator.generate(tx, hospitalId);
      const invoiceId = uuidv4();

      // 4. Create Expanded Immutable Invoice Snapshot
      const invoiceSnapshot = {
        hospital: {
          name: hospital.displayName || hospital.legalName,
          address:
            `${hospital.addressLine1 || ''} ${hospital.city || ''} ${hospital.pincode || ''}`.trim(),
          contactNumber: hospital.contactNumber,
          gstNumber: hospital.gstNumber,
          stateRegistrationNumber: hospital.registrationNumber,
        },
        patient: {
          name: patient.name,
          contactNumber: patient.phone,
          address: patient.address,
          abhaAddress: patient.abhaAddress,
        },
        doctor: {}, // Could be populated if generating per encounter
        encounter: {}, // Could be populated if grouping by encounter
        pricing: {
          currency: unbilledCharges[0].currency,
          subtotal: subtotal.toNumber(),
          gstTotal: gstTotal.toNumber(),
          discountTotal: discountTotal.toNumber(),
          totalAmount: totalAmount.toNumber(),
        },
        invoice: {
          invoiceNumber,
          generatedAt: new Date().toISOString(),
        },
        lineItems: lineItemsData.map((li) => ({
          chargeItemId: li.chargeItemId,
          description: li.description,
          type: li.type,
          quantity: li.quantity ? Number(li.quantity) : 1,
          unitPrice: li.unitPrice instanceof Prisma.Decimal ? li.unitPrice.toNumber() : Number(li.unitPrice),
          gstAmount: li.gstAmount instanceof Prisma.Decimal ? li.gstAmount.toNumber() : Number(li.gstAmount),
          discountAmount: li.discountAmount instanceof Prisma.Decimal ? li.discountAmount.toNumber() : Number(li.discountAmount),
          taxableAmount: li.taxableAmount instanceof Prisma.Decimal ? li.taxableAmount.toNumber() : Number(li.taxableAmount),
          totalAmount: li.totalAmount instanceof Prisma.Decimal ? li.totalAmount.toNumber() : Number(li.totalAmount),
        })),
      };

      // 5. Create Invoice and Line Items
      await tx.invoice.create({
        data: {
          id: invoiceId,
          hospitalId,
          patientId,
          invoiceNumber,
          status: 'ISSUED', // Issued immediately
          subtotal,
          gstTotal,
          discountTotal,
          totalAmount,
          balanceAmount: totalAmount,
          payload: invoiceSnapshot,
          version: 1,
          lineItems: {
            createMany: {
              data: lineItemsData,
            },
          },
        },
      });

      // 6. Mark ChargeItems as INVOICED
      await tx.chargeItem.updateMany({
        where: { id: { in: chargeItemIds } },
        data: {
          status: 'INVOICED',
        },
      });

      // 7. Write Audit Trail
      await tx.billingAudit.createMany({
        data: [
          {
            hospitalId,
            patientId,
            invoiceId,
            action: BillingAuditAction.INVOICE_GENERATED,
            performedBy,
            metadata: { message: 'Invoice mathematically generated from unbilled charges' },
          },
          {
            hospitalId,
            patientId,
            invoiceId,
            action: BillingAuditAction.INVOICE_ISSUED,
            performedBy,
            metadata: { message: 'Invoice officially issued to patient' },
          },
        ],
      });

      // 8. Publish BILL_GENERATED event (Versioned)
      const eventId = uuidv4();
      const event = createBillGeneratedEvent(
        hospitalId,
        {
          invoiceId,
          invoiceNumber,
          billingAccountId,
          patientId,
          hospitalId,
          subtotal: subtotal.toNumber(),
          discountAmount: discountTotal.toNumber(),
          taxAmount: gstTotal.toNumber(),
          totalAmount: totalAmount.toNumber(),
          currency: unbilledCharges[0].currency,
          chargeItemIds,
        },
        eventId,
      );

      await eventBus.publish(event);

      return invoiceId;
    });
  }
}

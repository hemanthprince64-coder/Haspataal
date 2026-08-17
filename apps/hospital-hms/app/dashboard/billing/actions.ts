'use server';

import { InvoiceAggregate } from '@haspataal/billing';

import { cookies } from 'next/headers';

import prisma from '@/lib/prisma';

/**
 * Ensures the user has billing access and returns their context.
 */
async function requireBillingContext() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('session_user');
  if (!userCookie) {
    throw new Error('Unauthorized');
  }

  const user = JSON.parse(userCookie.value);
  // Optional: check for specific roles like BILLING_VIEW, BILLING_ISSUE
  // For now we check if they have a hospitalId context
  if (!user.hospitalId) {
    throw new Error('Hospital context missing');
  }

  return { hospitalId: user.hospitalId, userId: user.id };
}

/**
 * Searches invoices by query (Invoice Number or Patient Name/ID).
 */
export async function searchInvoices(query: string) {
  const { hospitalId } = await requireBillingContext();

  const invoices = await prisma.invoice.findMany({
    where: {
      hospitalId,
      OR: [
        { invoiceNumber: { contains: query, mode: 'insensitive' } },
        { patient: { name: { contains: query, mode: 'insensitive' } } },
      ],
    },
    include: {
      patient: { select: { id: true, name: true, mrn: true } },
    },
    take: 20,
    orderBy: { createdAt: 'desc' },
  });

  return invoices;
}

/**
 * Retrieves patients who have UNBILLED charge items.
 */
export async function getUnbilledPatients() {
  const { hospitalId } = await requireBillingContext();

  // Find all unbilled charge items in this hospital, distinct by patient
  const unbilledCharges = await prisma.chargeItem.groupBy({
    by: ['patientId'],
    where: {
      hospitalId,
      status: 'UNBILLED',
    },
    _sum: {
      netAmount: true,
    },
    _count: {
      id: true,
    },
  });

  // Fetch patient details for these IDs
  const patientIds = unbilledCharges.map((u) => u.patientId);
  const patients = await prisma.patient.findMany({
    where: { id: { in: patientIds } },
    select: { id: true, name: true, mrn: true },
  });

  return unbilledCharges.map((charge) => {
    const patient = patients.find((p) => p.id === charge.patientId);
    return {
      patientId: charge.patientId,
      patientName: patient?.name || 'Unknown',
      mrn: patient?.mrn || 'N/A',
      unbilledCount: charge._count.id,
      unbilledTotal: charge._sum.netAmount?.toNumber() || 0,
    };
  });
}

/**
 * Issues an invoice for a given patient.
 */
export async function issueInvoiceAction(
  patientId: string,
): Promise<{ success: boolean; invoiceId?: string; error?: string }> {
  try {
    const { hospitalId, userId } = await requireBillingContext();
    const aggregate = new InvoiceAggregate(prisma as any); // using apps/hospital-hms prisma instance

    const invoiceId = await aggregate.generate(hospitalId, patientId, userId);

    if (!invoiceId) {
      return { success: false, error: 'No unbilled charges found for this patient.' };
    }

    return { success: true, invoiceId };
  } catch (error: any) {
    if (error.message?.includes('Concurrency conflict')) {
      return { success: false, error: 'Invoice already generated or charges are being processed.' };
    }
    console.error('Invoice generation failed', error);
    return { success: false, error: 'An unexpected error occurred while generating the invoice.' };
  }
}

/**
 * Retrieves detailed immutable invoice information for preview.
 */
export async function getInvoiceDetails(invoiceId: string) {
  const { hospitalId } = await requireBillingContext();

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId, hospitalId },
    include: {
      patient: { select: { id: true, name: true, mrn: true, contactNumber: true } },
      hospital: { select: { id: true, name: true, address: true, contactNumber: true } },
    },
  });

  if (!invoice) return null;

  // Render exclusively from the immutable payload snapshot if it exists
  const snapshot = invoice.payload as any;
  if (snapshot && snapshot.lineItems) {
    return {
      ...invoice,
      lineItems: snapshot.lineItems,
    };
  }

  // Fallback to relations if snapshot doesn't have it yet (for older data if any)
  const lineItems = await prisma.invoiceLineItem.findMany({
    where: { invoiceId: invoice.id },
  });

  return { ...invoice, lineItems };
}

/**
 * Get all unbilled charge items for a specific patient.
 */
export async function getUnbilledChargeItemsForPatient(patientId: string) {
  const { hospitalId } = await requireBillingContext();

  return await prisma.chargeItem.findMany({
    where: {
      hospitalId,
      patientId,
      status: 'UNBILLED',
    },
    orderBy: { createdAt: 'asc' },
  });
}

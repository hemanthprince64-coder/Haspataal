import { z } from 'zod';

import { NextRequest, NextResponse } from 'next/server';

import {
  hospitalAccessError,
  requireHospitalAccess,
  writeAuditLog,
} from '@/lib/auth/hospital-access';
import { invoiceNumber, summarizeInvoice } from '@/lib/billing/invoice';
import { prisma } from '@/lib/prisma';

const billRadiologySchema = z.object({
  executionId: z.string().min(1),
  modalityPrice: z.number().nonnegative(),
  contrastCharge: z.number().nonnegative().default(0),
  gstRate: z.number().min(0).max(28).default(0),
});

export async function POST(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('radiology', 'create');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const body = await req.json().catch(() => null);
  const parsed = billRadiologySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const execution = await prisma.radiologyExecution.findFirst({
    where: { id: data.executionId, hospitalId: access.hospitalId },
    include: { patient: true, items: { include: { orderItem: { include: { test: true } } } } },
  });

  if (!execution) {
    return NextResponse.json({ error: 'Radiology execution not found' }, { status: 404 });
  }

  const existingInvoice = await prisma.invoice.findFirst({
    where: { diagnosticOrderId: execution.items[0]?.orderItem?.orderId },
  });

  if (existingInvoice) {
    return NextResponse.json(
      { error: 'Invoice already exists for this radiology order', invoiceId: existingInvoice.id },
      { status: 409 },
    );
  }

  const lines = [
    {
      description: `Radiology - ${execution.items[0]?.orderItem?.test?.testName || 'Imaging'}`,
      type: 'IMAGING' as const,
      quantity: 1,
      unitPrice: data.modalityPrice,
      gstRate: data.gstRate,
    },
    ...(data.contrastCharge > 0
      ? [
          {
            description: 'Contrast agent',
            type: 'PROCEDURE' as const,
            quantity: 1,
            unitPrice: data.contrastCharge,
            gstRate: data.gstRate,
          },
        ]
      : []),
  ];

  const summary = summarizeInvoice(lines);
  const orderId = execution.items[0]?.orderItem?.orderId;

  const invoice = await prisma.invoice.create({
    data: {
      hospitalId: access.hospitalId,
      patientId: execution.patientId,
      diagnosticOrderId: orderId,
      invoiceNumber: invoiceNumber('RAD'),
      source: 'DIAGNOSTICS',
      status: 'FINALIZED',
      finalizedAt: new Date(),
      subtotal: summary.subtotal,
      gstTotal: summary.gstTotal,
      discountTotal: summary.discountTotal,
      totalAmount: summary.totalAmount,
      balanceAmount: summary.totalAmount,
      lineItems: {
        create: summary.lines.map(({ input, amounts }) => ({
          description: input.description,
          type: input.type,
          quantity: amounts.quantity,
          unitPrice: input.unitPrice,
          gstRate: input.gstRate ?? 0,
          gstInclusive: false,
          discountAmount: amounts.discountAmount,
          taxableAmount: amounts.taxableAmount,
          gstAmount: amounts.gstAmount,
          totalAmount: amounts.totalAmount,
        })),
      },
    },
    include: { lineItems: true },
  });

  await writeAuditLog({
    hospitalId: access.hospitalId,
    userId: access.user.id,
    action: 'create',
    entity: 'invoice',
    entityId: invoice.id,
    details: { executionId: execution.id, totalAmount: invoice.totalAmount },
  });

  return NextResponse.json({ invoice }, { status: 201 });
}

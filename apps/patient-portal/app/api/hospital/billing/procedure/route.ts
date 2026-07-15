import { z } from 'zod';

import { NextRequest, NextResponse } from 'next/server';

import {
  hospitalAccessError,
  requireHospitalAccess,
  writeAuditLog,
} from '@/lib/auth/hospital-access';
import { invoiceNumber, summarizeInvoice } from '@/lib/billing/invoice';
import { prisma } from '@/lib/prisma';

const billProcedureSchema = z.object({
  executionId: z.string().min(1),
  surgeonFee: z.number().nonnegative(),
  anesthetistFee: z.number().nonnegative().default(0),
  otCharge: z.number().nonnegative(),
  consumables: z.number().nonnegative().default(0),
  gstRate: z.number().min(0).max(28).default(0),
});

export async function POST(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('procedure', 'create');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const body = await req.json().catch(() => null);
  const parsed = billProcedureSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const execution = await prisma.procedureExecution.findFirst({
    where: { id: data.executionId, hospitalId: access.hospitalId },
    include: {
      patient: true,
      order: { include: { items: { include: { catalogVersion: true } } } },
    },
  });

  if (!execution) {
    return NextResponse.json({ error: 'Procedure execution not found' }, { status: 404 });
  }

  const existingInvoice = await prisma.invoice.findFirst({
    where: { diagnosticOrderId: execution.orderId },
  });

  if (existingInvoice) {
    return NextResponse.json(
      { error: 'Invoice already exists for this procedure', invoiceId: existingInvoice.id },
      { status: 409 },
    );
  }

  const procedureName =
    execution.order.items[0]?.catalogVersion?.metadata?.procedureName || 'Procedure';

  const lines = [
    {
      description: `Procedure - ${procedureName}`,
      type: 'PROCEDURE' as const,
      quantity: 1,
      unitPrice: data.surgeonFee,
      gstRate: data.gstRate,
    },
    ...(data.anesthetistFee > 0
      ? [
          {
            description: 'Anesthetist fee',
            type: 'PROCEDURE' as const,
            quantity: 1,
            unitPrice: data.anesthetistFee,
            gstRate: data.gstRate,
          },
        ]
      : []),
    {
      description: 'OT charges',
      type: 'PROCEDURE' as const,
      quantity: 1,
      unitPrice: data.otCharge,
      gstRate: data.gstRate,
    },
    ...(data.consumables > 0
      ? [
          {
            description: 'Consumables',
            type: 'PROCEDURE' as const,
            quantity: 1,
            unitPrice: data.consumables,
            gstRate: data.gstRate,
          },
        ]
      : []),
  ];

  const summary = summarizeInvoice(lines);

  const invoice = await prisma.invoice.create({
    data: {
      hospitalId: access.hospitalId,
      patientId: execution.patientId,
      diagnosticOrderId: execution.orderId,
      invoiceNumber: invoiceNumber('OT'),
      source: 'DIRECT',
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

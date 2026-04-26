import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { invoiceNumber, summarizeInvoice } from '@/lib/billing/invoice';
import { hospitalAccessError, requireHospitalAccess, writeAuditLog } from '@/lib/auth/hospital-access';

const lineSchema = z.object({
  serviceId: z.string().optional().nullable(),
  description: z.string().min(1),
  type: z.enum(['CONSULTATION', 'PROCEDURE', 'LAB_TEST', 'IMAGING', 'BED_CHARGE', 'MEDICINE', 'PACKAGE']),
  quantity: z.number().positive().default(1),
  unitPrice: z.number().nonnegative(),
  gstRate: z.number().min(0).max(28).default(0),
  gstInclusive: z.boolean().default(false),
  discountAmount: z.number().min(0).default(0),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const invoiceSchema = z.object({
  patientId: z.string().optional().nullable(),
  appointmentId: z.string().optional().nullable(),
  admissionId: z.string().optional().nullable(),
  diagnosticOrderId: z.string().optional().nullable(),
  billId: z.string().optional().nullable(),
  source: z.string().default('DIRECT'),
  lines: z.array(lineSchema).min(1),
});

export async function GET(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('billing', 'read');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const status = req.nextUrl.searchParams.get('status') ?? undefined;
  const invoices = await prisma.invoice.findMany({
    where: { hospitalId: access.hospitalId, ...(status ? { status } : {}) },
    include: { patient: { select: { id: true, name: true, phone: true } }, lineItems: true, payments: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return NextResponse.json({ invoices });
}

export async function POST(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('billing', 'create');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const body = await req.json().catch(() => null);
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });
  }

  const data = parsed.data;
  const summary = summarizeInvoice(data.lines);
  const invoice = await prisma.invoice.create({
    data: {
      hospitalId: access.hospitalId,
      patientId: data.patientId ?? null,
      appointmentId: data.appointmentId ?? null,
      admissionId: data.admissionId ?? null,
      diagnosticOrderId: data.diagnosticOrderId ?? null,
      billId: data.billId ?? null,
      invoiceNumber: invoiceNumber(),
      source: data.source,
      subtotal: summary.subtotal,
      gstTotal: summary.gstTotal,
      discountTotal: summary.discountTotal,
      totalAmount: summary.totalAmount,
      balanceAmount: summary.totalAmount,
      lineItems: {
        create: summary.lines.map(({ input, amounts }) => ({
          serviceId: input.serviceId ?? null,
          description: input.description,
          type: input.type,
          quantity: amounts.quantity,
          unitPrice: input.unitPrice,
          gstRate: input.gstRate ?? 0,
          gstInclusive: input.gstInclusive ?? false,
          discountAmount: amounts.discountAmount,
          taxableAmount: amounts.taxableAmount,
          gstAmount: amounts.gstAmount,
          totalAmount: amounts.totalAmount,
          metadata: (input.metadata ?? {}) as any,
        })),
      },
    },
    include: { lineItems: true, payments: true },
  });

  await writeAuditLog({
    hospitalId: access.hospitalId,
    userId: access.user.id,
    action: 'create',
    entity: 'invoice',
    entityId: invoice.id,
    details: { totalAmount: summary.totalAmount, source: data.source },
  });

  return NextResponse.json({ invoice }, { status: 201 });
}

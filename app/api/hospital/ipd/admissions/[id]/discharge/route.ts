import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { invoiceNumber, summarizeInvoice } from '@/lib/billing/invoice';
import { hospitalAccessError, requireHospitalAccess, writeAuditLog } from '@/lib/auth/hospital-access';

type Params = { params: Promise<{ id: string }> };

const dischargeSchema = z.object({
  dischargeSummary: z.string().min(1),
  additionalCharges: z.array(z.object({
    description: z.string().min(1),
    type: z.enum(['CONSULTATION', 'PROCEDURE', 'LAB_TEST', 'IMAGING', 'BED_CHARGE', 'MEDICINE', 'PACKAGE']).default('PROCEDURE'),
    quantity: z.number().positive().default(1),
    unitPrice: z.number().nonnegative(),
    gstRate: z.number().min(0).max(28).default(0),
    gstInclusive: z.boolean().default(false),
  })).default([]),
});

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  let access;
  try {
    access = await requireHospitalAccess('ipd', 'discharge');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const body = await req.json().catch(() => null);
  const parsed = dischargeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const admission = await tx.admission.findFirst({ where: { id, hospitalId: access.hospitalId } });
    if (!admission) throw new Error('NOT_FOUND');
    if (admission.status === 'DISCHARGED') throw new Error('ALREADY_DISCHARGED');

    const dischargedAt = new Date();
    const stayMs = dischargedAt.getTime() - admission.admittedAt.getTime();
    const billableDays = Math.max(1, Math.ceil(stayMs / 86400000));
    const bedCharge = Number(admission.dailyBedCharge ?? 0);
    const lines = [
      ...(bedCharge > 0 ? [{
        description: `IPD bed charges (${billableDays} day${billableDays > 1 ? 's' : ''})`,
        type: 'BED_CHARGE' as const,
        quantity: billableDays,
        unitPrice: bedCharge,
        gstRate: 0,
        gstInclusive: false,
      }] : []),
      ...parsed.data.additionalCharges,
    ];
    const summary = summarizeInvoice(lines);

    const invoice = await tx.invoice.create({
      data: {
        hospitalId: access.hospitalId,
        patientId: admission.patientId,
        admissionId: admission.id,
        invoiceNumber: invoiceNumber('IPD'),
        source: 'IPD',
        status: 'FINALIZED',
        finalizedAt: dischargedAt,
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
            gstInclusive: input.gstInclusive ?? false,
            discountAmount: amounts.discountAmount,
            taxableAmount: amounts.taxableAmount,
            gstAmount: amounts.gstAmount,
            totalAmount: amounts.totalAmount,
          })),
        },
      },
      include: { lineItems: true },
    });

    const updated = await tx.admission.update({
      where: { id },
      data: { status: 'DISCHARGED', dischargedAt, dischargeSummary: parsed.data.dischargeSummary },
      include: { patient: true, bed: true },
    });

    if (admission.bedId) {
      await tx.bed.update({
        where: { id: admission.bedId },
        data: { status: 'CLEANING', patientId: null, admittedAt: null, expectedDischargeAt: null },
      });
    }

    return { admission: updated, invoice };
  }).catch((error) => {
    if (error instanceof Error && error.message === 'NOT_FOUND') return null;
    throw error;
  });

  if (!result) return NextResponse.json({ error: 'Admission not found' }, { status: 404 });

  await writeAuditLog({
    hospitalId: access.hospitalId,
    userId: access.user.id,
    action: 'discharge',
    entity: 'admission',
    entityId: id,
    details: { invoiceId: result.invoice.id },
  });

  return NextResponse.json(result);
}

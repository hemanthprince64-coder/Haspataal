import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { roundMoney } from '@/lib/billing/invoice';
import { hospitalAccessError, requireHospitalAccess, writeAuditLog } from '@/lib/auth/hospital-access';

type Params = { params: Promise<{ id: string }> };

const paymentSchema = z.object({
  amount: z.number().positive(),
  method: z.string().min(2),
  referenceNumber: z.string().optional(),
  gatewayProvider: z.string().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  let access;
  try {
    access = await requireHospitalAccess('billing', 'pay');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const body = await req.json().catch(() => null);
  const parsed = paymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });
  }

  const data = parsed.data;
  const result = await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findFirst({ where: { id, hospitalId: access.hospitalId } });
    if (!invoice) throw new Error('NOT_FOUND');
    if (invoice.status === 'CANCELLED') throw new Error('CANCELLED');

    const paidAmount = roundMoney(Number(invoice.paidAmount) + data.amount);
    const balanceAmount = roundMoney(Math.max(Number(invoice.totalAmount) - paidAmount, 0));
    const status = balanceAmount === 0 ? 'PAID' : 'PARTIALLY_PAID';

    const payment = await tx.invoicePayment.create({
      data: {
        invoiceId: id,
        hospitalId: access.hospitalId,
        amount: data.amount,
        method: data.method,
        referenceNumber: data.referenceNumber,
        gatewayProvider: data.gatewayProvider,
        payload: (data.payload ?? {}) as any,
      },
    });

    const updated = await tx.invoice.update({
      where: { id },
      data: {
        paidAmount,
        balanceAmount,
        status,
        paidAt: status === 'PAID' ? new Date() : null,
      },
      include: { lineItems: true, payments: true },
    });

    return { payment, invoice: updated };
  }).catch((error) => {
    if (error instanceof Error && error.message === 'NOT_FOUND') return null;
    throw error;
  });

  if (!result) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

  await writeAuditLog({
    hospitalId: access.hospitalId,
    userId: access.user.id,
    action: 'pay',
    entity: 'invoice',
    entityId: id,
    details: { amount: data.amount, method: data.method },
  });

  return NextResponse.json(result);
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { invoiceNumber, summarizeInvoice } from '@/lib/billing/invoice';
import { hospitalAccessError, requireHospitalAccess, writeAuditLog } from '@/lib/auth/hospital-access';

const itemSchema = z.object({
  drugStockId: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative().default(0),
  batchNumber: z.string().optional(),
});

const dispenseSchema = z.object({
  patientId: z.string().min(1),
  prescriptionId: z.string().optional().nullable(),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1),
  createInvoice: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('pharmacy', 'read');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const patientId = req.nextUrl.searchParams.get('patientId') ?? undefined;
  const dispenses = await prisma.pharmacyDispense.findMany({
    where: { hospitalId: access.hospitalId, ...(patientId ? { patientId } : {}) },
    include: { patient: { select: { id: true, name: true, phone: true } }, items: true, invoice: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return NextResponse.json({ dispenses });
}

export async function POST(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('pharmacy', 'create');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const body = await req.json().catch(() => null);
  const parsed = dispenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });
  }

  const data = parsed.data;
  const result = await prisma.$transaction(async (tx) => {
    const stocks = await tx.drugStock.findMany({
      where: { hospitalId: access.hospitalId, id: { in: data.items.map((item) => item.drugStockId) } },
    });
    const byId = new Map(stocks.map((stock) => [stock.id, stock]));
    for (const item of data.items) {
      const stock = byId.get(item.drugStockId);
      if (!stock) throw new Error('STOCK_NOT_FOUND');
      if (stock.stock < item.quantity) throw new Error(`INSUFFICIENT_STOCK:${stock.name}`);
    }

    const invoice = data.createInvoice
      ? await tx.invoice.create({
          data: {
            hospitalId: access.hospitalId,
            patientId: data.patientId,
            invoiceNumber: invoiceNumber('PHR'),
            source: 'PHARMACY',
            status: 'FINALIZED',
            finalizedAt: new Date(),
            ...(() => {
              const summary = summarizeInvoice(data.items.map((item) => {
                const stock = byId.get(item.drugStockId)!;
                return {
                  description: stock.name,
                  type: 'MEDICINE' as const,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  gstRate: 12,
                };
              }));
              return {
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
              };
            })(),
          },
        })
      : null;

    const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const dispense = await tx.pharmacyDispense.create({
      data: {
        hospitalId: access.hospitalId,
        patientId: data.patientId,
        prescriptionId: data.prescriptionId ?? null,
        invoiceId: invoice?.id ?? null,
        dispensedBy: access.user.id,
        notes: data.notes,
        totalAmount,
        items: {
          create: data.items.map((item) => {
            const stock = byId.get(item.drugStockId)!;
            return {
              drugStockId: item.drugStockId,
              drugName: stock.name,
              batchNumber: item.batchNumber,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalAmount: item.quantity * item.unitPrice,
            };
          }),
        },
      },
      include: { items: true, invoice: true },
    });

    for (const item of data.items) {
      await tx.drugStock.update({
        where: { id: item.drugStockId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return dispense;
  }).catch((error) => {
    if (error instanceof Error && (error.message === 'STOCK_NOT_FOUND' || error.message.startsWith('INSUFFICIENT_STOCK'))) {
      return { error: error.message };
    }
    throw error;
  });

  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 409 });

  await writeAuditLog({
    hospitalId: access.hospitalId,
    userId: access.user.id,
    action: 'dispense',
    entity: 'pharmacy_dispense',
    entityId: result.id,
    details: { itemCount: result.items.length, invoiceId: result.invoiceId },
  });

  return NextResponse.json({ dispense: result }, { status: 201 });
}

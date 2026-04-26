import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hospitalAccessError, requireHospitalAccess, writeAuditLog } from '@/lib/auth/hospital-access';

type Params = { params: Promise<{ id: string }> };

const resultSchema = z.object({
  orderItemId: z.string().min(1),
  resultValue: z.string().optional(),
  resultFlag: z.string().optional(),
  reportFileUrl: z.string().optional(),
  structuredData: z.record(z.string(), z.unknown()).optional(),
  verify: z.boolean().default(false),
});

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  let access;
  try {
    access = await requireHospitalAccess('diagnostics', 'update');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const body = await req.json().catch(() => null);
  const parsed = resultSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });
  }

  const data = parsed.data;
  const order = await prisma.diagnosticOrder.findFirst({
    where: { id, hospitalId: access.hospitalId },
    include: { items: true },
  });
  if (!order || !order.items.some((item) => item.id === data.orderItemId)) {
    return NextResponse.json({ error: 'Order item not found' }, { status: 404 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const created = await tx.diagnosticResult.create({
      data: {
        orderItemId: data.orderItemId,
        resultValue: data.resultValue,
        resultFlag: data.resultFlag,
        reportFileUrl: data.reportFileUrl,
        structuredData: (data.structuredData ?? {}) as any,
        verifiedBy: data.verify ? access.user.id : null,
        verifiedAt: data.verify ? new Date() : null,
      },
    });
    await tx.diagnosticOrderItem.update({
      where: { id: data.orderItemId },
      data: { status: data.verify ? 'VERIFIED' : 'RESULT_ENTERED' },
    });
    const remaining = await tx.diagnosticOrderItem.count({
      where: { orderId: id, status: { notIn: ['VERIFIED'] } },
    });
    await tx.diagnosticOrder.update({
      where: { id },
      data: { orderStatus: remaining === 0 ? 'COMPLETED' : 'IN_PROGRESS' },
    });
    return created;
  });

  await writeAuditLog({
    hospitalId: access.hospitalId,
    userId: access.user.id,
    action: data.verify ? 'verify_report' : 'create_result',
    entity: 'diagnostic_result',
    entityId: result.id,
    details: { orderId: id, orderItemId: data.orderItemId },
  });

  return NextResponse.json({ result }, { status: 201 });
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hospitalAccessError, requireHospitalAccess, writeAuditLog } from '@/lib/auth/hospital-access';

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  let access;
  try {
    access = await requireHospitalAccess('billing', 'finalize');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const invoice = await prisma.invoice.findFirst({ where: { id, hospitalId: access.hospitalId } });
  if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  if (invoice.status !== 'DRAFT') return NextResponse.json({ error: 'Only draft invoices can be finalized' }, { status: 409 });

  const updated = await prisma.invoice.update({
    where: { id },
    data: { status: 'FINALIZED', finalizedAt: new Date() },
    include: { lineItems: true, payments: true },
  });

  await writeAuditLog({
    hospitalId: access.hospitalId,
    userId: access.user.id,
    action: 'finalize',
    entity: 'invoice',
    entityId: id,
  });

  return NextResponse.json({ invoice: updated });
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hospitalAccessError, requireHospitalAccess, writeAuditLog } from '@/lib/auth/hospital-access';
import { z } from 'zod';

const stockSchema = z.object({
  drugName: z.string().trim().min(1),
  quantity: z.coerce.number().int().min(0),
  expiryDate: z.string().min(1),
  type: z.string().trim().optional(),
  category: z.string().trim().optional(),
  minLevel: z.coerce.number().int().min(0).optional(),
});

function formatStock(item: any) {
  return {
    ...item,
    drugName: item.name,
    quantity: item.stock,
    type: item.category ?? 'TABLET',
    batchNumber: '',
    mrp: 0,
  };
}

export async function GET(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('pharmacy', 'read');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const stock = await prisma.drugStock.findMany({
    where: { hospitalId: access.hospitalId },
    orderBy: { name: 'asc' }
  });

  return NextResponse.json({ stock: stock.map(formatStock) });
}

export async function POST(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('pharmacy', 'create');
  } catch (error) {
    return hospitalAccessError(error);
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = stockSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });

  const expiryDate = new Date(parsed.data.expiryDate);
  if (Number.isNaN(expiryDate.getTime())) {
    return NextResponse.json({ error: 'Invalid expiryDate' }, { status: 422 });
  }

  const item = await prisma.drugStock.create({
    data: {
      hospitalId: access.hospitalId,
      name: parsed.data.drugName,
      stock: parsed.data.quantity,
      minLevel: parsed.data.minLevel ?? 10,
      expiryDate,
      category: parsed.data.category ?? parsed.data.type ?? 'TABLET',
    }
  });

  await writeAuditLog({
    hospitalId: access.hospitalId,
    userId: access.user.id,
    action: 'pharmacy.stock.create',
    entity: 'DrugStock',
    entityId: item.id,
    details: { name: item.name, stock: item.stock },
  });

  return NextResponse.json({ item: formatStock(item) }, { status: 201 });
}

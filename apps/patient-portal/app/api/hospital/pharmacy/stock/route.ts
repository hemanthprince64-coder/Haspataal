/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  hospitalAccessError,
  requireHospitalAccess,
  writeAuditLog,
} from '@/lib/auth/hospital-access';
import { z } from 'zod';

const stockSchema = z.object({
  drugName: z.string().trim().min(1),
  genericName: z.string().optional(),
  quantity: z.coerce.number().int().min(0),
  expiryDate: z.string().min(1),
  type: z.string().optional(),
  formulation: z.string().optional(),
  strength: z.string().optional(),
  packSize: z.coerce.number().int().default(10),
  minLevel: z.coerce.number().int().min(0).optional(),
  reorderPoint: z.coerce.number().int().min(0).optional(),
  mrp: z.coerce.number().min(0).optional(),
  purchasePrice: z.coerce.number().min(0).optional(),
  isControlled: z.boolean().default(false),
  storageCondition: z.string().default('ROOM_TEMP'),
  manufacturer: z.string().optional(),
  supplierId: z.string().optional(),
  batchNumber: z.string().optional(),
});

function formatStock(item: any) {
  return {
    ...item,
    drugName: item.name,
    quantity: item.stock,
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
    include: { supplier: true },
    orderBy: { name: 'asc' },
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
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = stockSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 },
    );

  const data = parsed.data;
  const expiryDate = new Date(data.expiryDate);
  if (Number.isNaN(expiryDate.getTime())) {
    return NextResponse.json({ error: 'Invalid expiryDate' }, { status: 422 });
  }

  const item = await prisma.drugStock.create({
    data: {
      hospitalId: access.hospitalId,
      name: data.drugName,
      genericName: data.genericName,
      stock: data.quantity,
      minLevel: data.minLevel ?? 10,
      reorderPoint: data.reorderPoint ?? 20,
      expiryDate,
      formulation: data.formulation || data.type,
      strength: data.strength,
      packSize: data.packSize,
      mrp: data.mrp,
      purchasePrice: data.purchasePrice,
      isControlled: data.isControlled,
      storageCondition: data.storageCondition,
      manufacturer: data.manufacturer,
      supplierId: data.supplierId,
      batchNumber: data.batchNumber,
    },
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

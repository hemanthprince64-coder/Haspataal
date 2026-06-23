import { z } from 'zod';

import { NextRequest, NextResponse } from 'next/server';

import { getHospitalIdFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const assignSchema = z.object({
  serviceIds: z.array(z.string()).min(0),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = assignSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 },
    );

  const pkg = await prisma.billingPackage.findUnique({
    where: { id },
    select: { hospitalId: true },
  });

  if (!pkg || pkg.hospitalId !== hospitalId)
    return NextResponse.json({ error: 'Package not found' }, { status: 404 });

  // Unlink all services from this package first
  await prisma.serviceCatalog.updateMany({
    where: { hospitalId, packageId: id },
    data: { packageId: null },
  });

  // Assign selected services to this package
  if (parsed.data.serviceIds.length > 0) {
    await prisma.serviceCatalog.updateMany({
      where: {
        id: { in: parsed.data.serviceIds },
        hospitalId,
      },
      data: { packageId: id },
    });
  }

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const services = await prisma.serviceCatalog.findMany({
    where: { hospitalId, packageId: id },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ services });
}

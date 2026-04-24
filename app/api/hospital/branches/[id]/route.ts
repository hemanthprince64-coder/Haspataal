import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const branchId = params.id;

  const branch = await prisma.branch.update({
    where: { id: branchId, hospitalId },
    data: {
      name: body.name,
      address: body.address,
      city: body.city,
      contactNumber: body.contactNumber,
      isActive: body.isActive,
      isMainBranch: body.isMainBranch,
    }
  });

  if (body.isMainBranch) {
    await prisma.branch.updateMany({
      where: { hospitalId, id: { not: branchId } },
      data: { isMainBranch: false }
    });
  }

  return NextResponse.json({ branch });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.branch.delete({
    where: { id: params.id, hospitalId }
  });

  return NextResponse.json({ ok: true });
}

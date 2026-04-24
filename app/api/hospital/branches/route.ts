import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const branches = await prisma.branch.findMany({
    where: { hospitalId },
    orderBy: { createdAt: 'asc' }
  });

  return NextResponse.json({ branches });
}

export async function POST(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const branch = await prisma.branch.create({
    data: {
      hospitalId,
      name: body.name,
      code: body.code,
      address: body.address,
      city: body.city,
      contactNumber: body.contactNumber,
      isMainBranch: body.isMainBranch ?? false,
      isActive: true,
    }
  });

  // If this is set as main branch, unset others
  if (body.isMainBranch) {
    await prisma.branch.updateMany({
      where: { hospitalId, id: { not: branch.id } },
      data: { isMainBranch: false }
    });
  }

  return NextResponse.json({ branch });
}

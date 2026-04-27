import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const invites = await prisma.staffInvite.findMany({
    where: { hospitalId, isAccepted: false },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ invites });
}

export async function DELETE(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { id } = await req.json();
  await prisma.staffInvite.deleteMany({
    where: { id, hospitalId }
  });

  return NextResponse.json({ ok: true });
}

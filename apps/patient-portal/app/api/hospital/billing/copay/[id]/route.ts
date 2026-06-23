import { NextRequest, NextResponse } from 'next/server';

import { getHospitalIdFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const rule = await prisma.coPayRule.findUnique({
    where: { id },
    select: { hospitalId: true },
  });

  if (!rule || rule.hospitalId !== hospitalId)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.coPayRule.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { unitIds } = await req.json();
  const departmentId = params.id;

  // Use a transaction to update all sort orders
  await prisma.$transaction(
    unitIds.map((id: string, index: number) =>
      prisma.unit.update({
        where: { id, departmentId },
        data: { sortOrder: index }
      })
    )
  );

  return NextResponse.json({ ok: true });
}

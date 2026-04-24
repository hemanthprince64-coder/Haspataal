import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const permissions = await prisma.hospitalRole.findMany({ where: { hospitalId } });
  return NextResponse.json({ permissions });
}

export async function PUT(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { permissions } = await req.json();
  // Store per-role permissions in HospitalRole table
  for (const [roleName, perms] of Object.entries(permissions as Record<string, unknown>)) {
    await prisma.hospitalRole.upsert({
      where: { id: `${hospitalId}_${roleName}` },
      update: { permissions: perms as object },
      create: { id: `${hospitalId}_${roleName}`, hospitalId, roleName, permissions: perms as object },
    });
  }
  return NextResponse.json({ ok: true });
}

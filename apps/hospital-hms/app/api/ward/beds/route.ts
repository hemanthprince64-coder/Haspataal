/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from '@haspataal/db';

import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';

async function requireRole(role: string, headerName = 'authorization') {
  const user = (await checkRole({} as Request, [role as any])) as any;
  return user;
}

export async function GET(req: Request) {
  try {
    const user = (await requireRole('admin', 'session_user')) as any;
    const { searchParams } = new URL(req.url);
    const hospitalId = user.hospitalId;
    const type = searchParams.get('type') || undefined; // GENERAL, ICU, NICU, PRIVATE
    const status = searchParams.get('status') || undefined;

    const beds = await prisma.bed.findMany({
      where: {
        hospitalId,
        ...(type && { type: type as any }),
        ...(status && { status: status as any }),
      },
      include: {
        unit: true,
        department: true,
        patient: { select: { name: true, phone: true } },
      },
      orderBy: { bedNumber: 'asc' },
    });

    const formatted = beds.map((bed) => ({
      id: bed.id,
      bedNumber: bed.bedNumber,
      type: bed.type,
      status: bed.status,
      patientName: bed.patient?.name || null,
      unitName: bed.unit?.name || null,
      departmentName: bed.department?.name || null,
      admittedAt: bed.admittedAt,
      expectedDischargeAt: bed.expectedDischargeAt,
      notes: bed.notes,
    }));

    return NextResponse.json({ beds: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = (await requireRole('admin', 'session_user')) as any;
    const body = await req.json();
    const { bedId, status, patientId, notes } = body;

    const bed = await prisma.bed.findFirst({
      where: { id: bedId, hospitalId: user.hospitalId },
    });

    if (!bed) {
      return NextResponse.json({ error: 'Bed not found' }, { status: 404 });
    }

    const updated = await prisma.bed.update({
      where: { id: bedId },
      data: {
        status: status || 'AVAILABLE',
        patientId: patientId || null,
        admittedAt: status === 'OCCUPIED' ? new Date() : bed.admittedAt,
        notes: notes || bed.notes,
      },
    });

    return NextResponse.json({ success: true, bed: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = (await requireRole('admin', 'session_user')) as any;
    const body = await req.json();
    const { action } = body;

    if (action === 'allocate') {
      const { bedId, patientId } = body;
      const updated = await prisma.bed.update({
        where: { id: bedId, hospitalId: user.hospitalId },
        data: { status: 'OCCUPIED', patientId, admittedAt: new Date() },
      });
      return NextResponse.json({ success: true, bed: updated });
    }

    if (action === 'discharge') {
      const { bedId } = body;
      const updated = await prisma.bed.update({
        where: { id: bedId, hospitalId: user.hospitalId },
        data: { status: 'AVAILABLE', patientId: null, admittedAt: null },
      });
      return NextResponse.json({ success: true, bed: updated });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

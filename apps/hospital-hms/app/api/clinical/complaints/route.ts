import { prisma } from '@haspataal/db';

import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';

async function requireRole(role: string, headerName = 'authorization') {
  const user = (await checkRole({} as Request, [role as any])) as any;
  return user;
}

export async function GET(req: Request) {
  try {
    const user = (await requireRole(Roles.DOCTOR, 'session_user')) as any;
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const visitId = searchParams.get('visitId');

    if (!patientId && !visitId) {
      return NextResponse.json({ error: 'Patient ID or Visit ID required' }, { status: 400 });
    }

    const complaints = await prisma.chiefComplaint.findMany({
      where: patientId ? { visitId } : { visitId: visitId as string },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ complaints });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = (await requireRole(Roles.DOCTOR, 'session_user')) as any;
    const body = await req.json();
    const { visitId, complaint, duration, severity } = body;

    if (!visitId || !complaint) {
      return NextResponse.json({ error: 'Visit ID and complaint are required' }, { status: 400 });
    }

    const created = await prisma.chiefComplaint.create({
      data: {
        visitId,
        complaint,
        duration: duration || null,
        severity: severity || 'MEDIUM',
      },
    });

    return NextResponse.json({ success: true, complaint: created });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

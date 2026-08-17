import { prisma } from '@haspataal/db';

import { NextRequest, NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';

export async function GET(request: NextRequest) {
  try {
    const user = await checkRole(request, [
      Roles.ADMIN,
      Roles.DOCTOR,
      Roles.NURSE,
      Roles.RECEPTIONIST,
    ]);
    if (!user || !user.hospital_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = { hospitalId: user.hospital_id };
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const includeResolved = searchParams.get('includeResolved') === 'true';

    const where: any = {
      hospitalId: session.hospitalId,
    };

    if (patientId) {
      where.patientId = patientId;
    }

    if (!includeResolved) {
      where.resolvedAt = null;
    }

    const alerts = await prisma.clinicalAlert.findMany({
      where,
      orderBy: [
        { severity: 'asc' }, // Warning: ensure string sort matches expected severity order, or sort in memory if needed
        { createdAt: 'desc' },
      ],
      include: {
        patient: {
          select: { name: true, phone: true },
        },
      },
    });

    // In-memory sort to ensure severity ordering: CRITICAL > HIGH > WARNING > INFO
    const severityMap: Record<string, number> = { CRITICAL: 4, HIGH: 3, WARNING: 2, INFO: 1 };
    alerts.sort((a, b) => {
      const diff = (severityMap[b.severity] || 0) - (severityMap[a.severity] || 0);
      if (diff !== 0) return diff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return NextResponse.json({ alerts });
  } catch (error: any) {
    console.error('Error fetching clinical alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

import { prisma } from '@haspataal/db';

import { NextRequest, NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {

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

    const session = { hospitalId: user.hospital_id, userId: user.user_id };

    const { note } = await request.json().catch(() => ({ note: undefined }));
    const alertId = (await params).id;

    const alert = await prisma.clinicalAlert.findFirst({
      where: {
        id: alertId,
        hospitalId: session.hospitalId,
      },
    });

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    const updatedAlert = await prisma.clinicalAlert.update({
      where: { id: alertId },
      data: {
        isAcknowledged: true,
        acknowledgedAt: new Date(),
        acknowledgedBy: session.userId,
        ackNote: note || null,
      },
    });

    return NextResponse.json({ success: true, alert: updatedAlert });
  } catch (error: any) {
    console.error('Error acknowledging alert:', error);
    return NextResponse.json({ error: 'Failed to acknowledge alert' }, { status: 500 });
  }
}

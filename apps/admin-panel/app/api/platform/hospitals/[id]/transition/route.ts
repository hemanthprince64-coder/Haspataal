import { requirePlatformRole } from '@haspataal/auth';
import { prisma } from '@haspataal/db';
import { HospitalWorkflow, HospitalAction, HospitalState } from '@haspataal/workflows';

import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requirePlatformRole(['PLATFORM_ADMIN', 'NETWORK_ADMIN']);
    const hospitalId = params.id;
    const body = await request.json();
    const { action, reason, metadata, expectedState } = body as {
      action: HospitalAction;
      reason: string;
      metadata: Record<string, any>;
      expectedState: HospitalState;
    };

    if (!action || !reason || !expectedState) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get current state
    const hospital = await prisma.hospitalsMaster.findUnique({
      where: { id: hospitalId },
      select: { onboardingState: true },
    });

    if (!hospital) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
    }

    const result = await HospitalWorkflow.transition(
      'HOSPITAL',
      hospitalId,
      hospital.onboardingState as HospitalState,
      action,
      reason,
      { id: user.id, role: user.role as string },
      metadata || {},
      expectedState,
      async (entityId: string, newState: string, tx: any) => {
        await tx.hospitalsMaster.update({
          where: { id: entityId },
          data: { onboardingState: newState },
        });
      },
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

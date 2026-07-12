import { AuthorizationService } from '@haspataal/core/domain/authorization/service';
import { DomainAction, AuthorizationDecision } from '@haspataal/core/domain/authorization/types';
import { prisma } from '@haspataal/db';

import { NextResponse } from 'next/server';

import { IPDService } from '@/lib/services/ipd';

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const admissionId = params.id;
    const body = await req.json();
    const pathway = body.pathway || 'STANDARD'; // 'STANDARD' | 'LAMA' | 'WITHOUT_NOTICE'

    // Auth context (in reality extracted from session, mocking for structure)
    const userHeader = req.headers.get('x-user-id');
    const roleHeader = req.headers.get('x-user-role');
    if (!userHeader || !roleHeader)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admission = await prisma.admission.findUniqueOrThrow({ where: { id: admissionId } });

    const authService = new AuthorizationService(prisma);
    const actionMap: Record<string, DomainAction> = {
      STANDARD: DomainAction.DEPARTURE_CONFIRM_STANDARD,
      LAMA: DomainAction.DEPARTURE_CONFIRM_LAMA,
      WITHOUT_NOTICE: DomainAction.DEPARTURE_CONFIRM_WITHOUT_NOTICE,
    };

    const authResult = await authService.authorize({
      actor: { id: userHeader, role: roleHeader },
      action: actionMap[pathway],
      resource: {
        patientId: admission.patientId,
        episodeId: admissionId,
        hospitalId: admission.hospitalId,
      },
    });

    if (authResult.decision === AuthorizationDecision.DENY) {
      return NextResponse.json({ error: authResult.reason }, { status: 403 });
    }

    const data = await IPDService.confirmPhysicalDeparture(
      admissionId,
      pathway,
      userHeader,
      roleHeader,
      body.evidenceType || 'MANUAL_ENTRY',
      'API_DISCHARGE',
    );

    if (data.status === 'already_confirmed') {
      return NextResponse.json(data, { status: 200 }); // Idempotent success
    }
    return NextResponse.json(data);
  } catch (err: any) {
    if (err.message?.includes('Conflict')) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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
    const action = body.action; // 'SUSPECT' | 'RESOLVE'

    const userHeader = req.headers.get('x-user-id');
    const roleHeader = req.headers.get('x-user-role');
    if (!userHeader || !roleHeader)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admission = await prisma.admission.findUniqueOrThrow({ where: { id: admissionId } });
    const authService = new AuthorizationService(prisma);

    const actionMap: Record<string, DomainAction> = {
      SUSPECT: DomainAction.ABSENCE_SUSPECT,
      RESOLVE: DomainAction.ABSENCE_RESOLVE,
    };

    if (!actionMap[action])
      return NextResponse.json({ error: 'Invalid Abscond action' }, { status: 400 });

    const authResult = await authService.authorize({
      actor: { id: userHeader, role: roleHeader },
      action: actionMap[action],
      resource: {
        patientId: admission.patientId,
        episodeId: admissionId,
        hospitalId: admission.hospitalId,
      },
    });

    if (authResult.decision === AuthorizationDecision.DENY) {
      return NextResponse.json({ error: authResult.reason }, { status: 403 });
    }

    if (action === 'SUSPECT') {
      const data = await IPDService.suspectAbsence(admissionId, userHeader);
      return NextResponse.json(data);
    } else if (action === 'RESOLVE') {
      const data = await IPDService.resolveAbsence(admissionId, userHeader);
      return NextResponse.json(data);
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

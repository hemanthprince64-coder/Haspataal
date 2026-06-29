import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { LabService } from '@/lib/services/diagnostics';

export async function PATCH(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.LAB_TECH]);
    const body = await req.json();

    let data;
    switch (body.action) {
      case 'collect':
        data = await LabService.collectSample(
          body.sampleId,
          user.user_id,
          body.collectionTime,
          body.notes,
        );
        break;
      case 'process':
        data = await LabService.processResult(body.sampleId, body.resultValue, body.resultFlag);
        break;
      case 'verify':
        data = await LabService.verifyResult(body.sampleId, user.user_id, body.reportFileUrl);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    if (err.message.startsWith('Forbidden') || err.message.startsWith('Unauthorized')) {
      return NextResponse.json(
        { error: err.message },
        { status: err.message.startsWith('Unauthorized') ? 401 : 403 },
      );
    }
    return NextResponse.json({ error: 'Failed to process sample' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import * as TimelineService from '@/lib/services/timeline';

export async function GET(req: Request, context: { params: Promise<{ jobId: string }> }) {
  try {
    await checkRole(req, [Roles.PATIENT, Roles.DOCTOR, Roles.ADMIN]);
    const { jobId } = await context.params;
    const status = await TimelineService.getExportStatus(jobId);

    if (!status) {
      return NextResponse.json({ error: 'Export job not found' }, { status: 404 });
    }

    return NextResponse.json(status);
  } catch (err: unknown) {
    const e = err as Error;
    if (e.message?.startsWith('Forbidden') || e.message?.startsWith('Unauthorized')) {
      return NextResponse.json(
        { error: e.message },
        { status: e.message.startsWith('Unauthorized') ? 401 : 403 },
      );
    }
    return NextResponse.json({ error: 'Failed to fetch export status' }, { status: 500 });
  }
}

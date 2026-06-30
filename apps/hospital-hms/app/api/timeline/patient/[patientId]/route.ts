import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import * as TimelineService from '@/lib/services/timeline';

export async function GET(req: Request, { params }: { params: { patientId: string } }) {
  try {
    const user = await checkRole(req, [Roles.PATIENT]);
    const { patientId } = await params;

    // Patients can only access their own timeline
    if (user.user_id !== patientId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor') ?? undefined;
    const filters = {
      category: searchParams.get('category') ?? undefined,
      severity: searchParams.get('severity') ?? undefined,
      dateFrom: searchParams.get('dateFrom') ?? undefined,
      dateTo: searchParams.get('dateTo') ?? undefined,
      module: searchParams.get('module') ?? undefined,
    };

    const result = await TimelineService.getPatientTimeline(patientId, cursor, filters);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const e = err as Error;
    if (e.message?.startsWith('Forbidden') || e.message?.startsWith('Unauthorized')) {
      return NextResponse.json(
        { error: e.message },
        { status: e.message.startsWith('Unauthorized') ? 401 : 403 },
      );
    }
    return NextResponse.json({ error: 'Failed to load timeline' }, { status: 500 });
  }
}

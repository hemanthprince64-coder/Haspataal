import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import * as TimelineService from '@/lib/services/timeline';

export async function GET(req: Request, { params }: { params: { patientId: string } }) {
  try {
    const user = await checkRole(req, [Roles.DOCTOR, Roles.ADMIN]);
    const { patientId } = await params;
    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get('cursor') ?? undefined;
    const summary = searchParams.get('summary') === 'true';
    const filters = {
      category: searchParams.get('category') ?? undefined,
      severity: searchParams.get('severity') ?? undefined,
      dateFrom: searchParams.get('dateFrom') ?? undefined,
      dateTo: searchParams.get('dateTo') ?? undefined,
    };

    if (summary) {
      const clinicalSummary = await TimelineService.getClinicalSummary(patientId, user.hospital_id);
      return NextResponse.json({ clinicalSummary });
    }

    const result = await TimelineService.getDoctorTimeline(
      patientId,
      user.hospital_id,
      cursor,
      filters,
    );
    return NextResponse.json(result);
  } catch (err: unknown) {
    const e = err as Error;
    if (e.message?.startsWith('Forbidden') || e.message?.startsWith('Unauthorized')) {
      return NextResponse.json(
        { error: e.message },
        { status: e.message.startsWith('Unauthorized') ? 401 : 403 },
      );
    }
    return NextResponse.json({ error: 'Failed to load clinical timeline' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { TimelineQueryHandler } from '@haspataal/timeline';
import { createPlatformQueryContext } from '@/lib/platform';

export async function GET(req: Request, context: { params: Promise<{ patientId: string }> }) {
  try {
    const user = await checkRole(req, [Roles.DOCTOR, Roles.ADMIN]);
    const { patientId } = await context.params;
    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get('cursor') ?? undefined;
    const summary = searchParams.get('summary') === 'true';
    const filters = {
      patientId,
      category: searchParams.get('category') ?? undefined,
      severity: searchParams.get('severity') ?? undefined,
      dateFrom: searchParams.get('dateFrom') ?? undefined,
      dateTo: searchParams.get('dateTo') ?? undefined,
    };

    const platformContext = await createPlatformQueryContext(req);
    // Explicitly set the hospitalId to the user's hospital to prevent data leakage
    platformContext.tenantScope.hospitalId = user.hospital_id;

    const query = {
      ...platformContext,
      filters,
      pagination: { cursor, limit: 50 }
    };

    if (summary) {
      const clinicalSummary = await TimelineQueryHandler.getClinicalSummary(query);
      return NextResponse.json({ clinicalSummary });
    }

    const result = await TimelineQueryHandler.getDoctorTimeline(query);
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

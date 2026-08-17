import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { TimelineQueryHandler } from '@haspataal/timeline';
import { createPlatformQueryContext } from '@/lib/platform';

export async function GET(req: Request, context: { params: Promise<{ patientId: string }> }) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.NURSE, Roles.RECEPTIONIST]);
    const { patientId } = await context.params;
    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get('cursor') ?? undefined;
    const filters = {
      patientId,
      category: searchParams.get('category') ?? undefined,
      severity: searchParams.get('severity') ?? undefined,
      dateFrom: searchParams.get('dateFrom') ?? undefined,
      dateTo: searchParams.get('dateTo') ?? undefined,
    };

    const platformContext = await createPlatformQueryContext(req);
    platformContext.tenantScope.hospitalId = user.hospital_id;

    const query = {
      ...platformContext,
      filters,
      pagination: { cursor, limit: 50 }
    };

    const result = await TimelineQueryHandler.getHospitalTimeline(query);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const e = err as Error;
    if (e.message?.startsWith('Forbidden') || e.message?.startsWith('Unauthorized')) {
      return NextResponse.json(
        { error: e.message },
        { status: e.message.startsWith('Unauthorized') ? 401 : 403 },
      );
    }
    return NextResponse.json({ error: 'Failed to load hospital timeline' }, { status: 500 });
  }
}

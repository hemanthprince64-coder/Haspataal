import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { TimelineQueryHandler } from '@haspataal/timeline';
import { createPlatformQueryContext } from '@/lib/platform';

export async function GET(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.PATIENT]);
    const { searchParams } = new URL(req.url);

    const q = searchParams.get('q');
    if (!q || q.trim().length === 0) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const platformContext = await createPlatformQueryContext(req);
    platformContext.tenantScope.hospitalId = user.hospital_id;

    const query = {
      ...platformContext,
      filters: {
        q,
        patientId: searchParams.get('patientId') ?? undefined,
        category: searchParams.get('category') ?? undefined,
        severity: searchParams.get('severity') ?? undefined,
        dateFrom: searchParams.get('dateFrom') ?? undefined,
        dateTo: searchParams.get('dateTo') ?? undefined,
        module: searchParams.get('module') ?? undefined,
      },
      pagination: {
        cursor: searchParams.get('cursor') ?? undefined,
        limit: Number(searchParams.get('limit') ?? 20),
      }
    };

    const result = await TimelineQueryHandler.searchTimeline(query);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const e = err as Error;
    if (e.message?.startsWith('Forbidden') || e.message?.startsWith('Unauthorized')) {
      return NextResponse.json(
        { error: e.message },
        { status: e.message.startsWith('Unauthorized') ? 401 : 403 },
      );
    }
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { TimelineQueryHandler } from '@haspataal/timeline';
import { createPlatformQueryContext } from '@/lib/platform';

export async function GET(req: Request) {
  try {
    await checkRole(req, [Roles.SUPER_ADMIN]);
    const { searchParams } = new URL(req.url);
    const hospitalId = searchParams.get('hospitalId') ?? undefined;

    const platformContext = await createPlatformQueryContext(req);
    if (hospitalId) {
        platformContext.tenantScope.hospitalId = hospitalId;
    }

    const query = {
      ...platformContext,
      filters: {},
    };

    const analytics = await TimelineQueryHandler.getAdminAnalytics(query);
    return NextResponse.json(analytics);
  } catch (err: unknown) {
    const e = err as Error;
    if (e.message?.startsWith('Forbidden') || e.message?.startsWith('Unauthorized')) {
      return NextResponse.json(
        { error: e.message },
        { status: e.message.startsWith('Unauthorized') ? 401 : 403 },
      );
    }
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

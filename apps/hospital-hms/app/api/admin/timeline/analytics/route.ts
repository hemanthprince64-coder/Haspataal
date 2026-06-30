import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import * as TimelineService from '@/lib/services/timeline';

export async function GET(req: Request) {
  try {
    await checkRole(req, [Roles.SUPER_ADMIN]);
    const { searchParams } = new URL(req.url);
    const hospitalId = searchParams.get('hospitalId') ?? undefined;

    const analytics = await TimelineService.getAdminAnalytics(hospitalId);
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

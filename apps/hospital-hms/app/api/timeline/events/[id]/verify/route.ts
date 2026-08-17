import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { TimelineQueryHandler } from '@haspataal/timeline';
import { createPlatformQueryContext } from '@/lib/platform';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.PATIENT]);
    const { id } = await context.params;
    
    const platformContext = await createPlatformQueryContext(req);
    const query = {
      ...platformContext,
      filters: { eventId: id },
    };

    const result = await TimelineQueryHandler.verifyIntegrity(query);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const e = err as Error;
    if (e.message?.startsWith('Forbidden') || e.message?.startsWith('Unauthorized')) {
      return NextResponse.json(
        { error: e.message },
        { status: e.message.startsWith('Unauthorized') ? 401 : 403 },
      );
    }
    return NextResponse.json({ error: 'Integrity check failed' }, { status: 500 });
  }
}

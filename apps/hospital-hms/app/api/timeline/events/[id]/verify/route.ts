import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import * as TimelineService from '@/lib/services/timeline';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.PATIENT]);
    const { id } = await params;
    const result = await TimelineService.verifyIntegrity(id);
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

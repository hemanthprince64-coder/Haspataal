import { z } from 'zod';

import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import * as TimelineService from '@/lib/services/timeline';

const PinSchema = z.object({
  isPinned: z.boolean(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await checkRole(req, [Roles.DOCTOR, Roles.ADMIN]);
    const { id } = await params;
    const body = await req.json();
    const { isPinned } = PinSchema.parse(body);

    const updated = await TimelineService.pinEvent(id, isPinned);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const e = err as Error;
    if (e.message?.startsWith('Forbidden') || e.message?.startsWith('Unauthorized')) {
      return NextResponse.json(
        { error: e.message },
        { status: e.message.startsWith('Unauthorized') ? 401 : 403 },
      );
    }
    return NextResponse.json({ error: 'Failed to update pin status' }, { status: 500 });
  }
}

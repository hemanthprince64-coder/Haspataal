import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { TimelineMutationHandler } from '@haspataal/timeline';

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await checkRole(req, [Roles.PATIENT, Roles.DOCTOR, Roles.ADMIN]);
    const { id } = await context.params;

    await TimelineMutationHandler.removeBookmark(id, user.user_id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const e = err as Error;
    if (e.message?.startsWith('Forbidden') || e.message?.startsWith('Unauthorized')) {
      return NextResponse.json(
        { error: e.message },
        { status: e.message.startsWith('Unauthorized') ? 401 : 403 },
      );
    }
    return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 });
  }
}

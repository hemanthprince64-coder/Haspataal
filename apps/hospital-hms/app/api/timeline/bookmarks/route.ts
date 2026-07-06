import { z } from 'zod';

import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { TimelineQueryHandler, TimelineMutationHandler } from '@haspataal/timeline';
import { createPlatformQueryContext } from '@/lib/platform';

const BookmarkSchema = z.object({
  eventId: z.string().uuid(),
  note: z.string().max(500).optional(),
});

export async function GET(req: Request) {
  try {
    const user = await checkRole(req, [Roles.PATIENT, Roles.DOCTOR, Roles.ADMIN]);
    
    const platformContext = await createPlatformQueryContext(req);
    // Explicitly set actorId to the user to only get their bookmarks
    platformContext.actorScope.actorId = user.user_id;

    const query = {
      ...platformContext,
      filters: {},
    };

    const bookmarks = await TimelineQueryHandler.getBookmarks(query);
    return NextResponse.json({ data: bookmarks });
  } catch (err: unknown) {
    const e = err as Error;
    if (e.message?.startsWith('Forbidden') || e.message?.startsWith('Unauthorized')) {
      return NextResponse.json(
        { error: e.message },
        { status: e.message.startsWith('Unauthorized') ? 401 : 403 },
      );
    }
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await checkRole(req, [Roles.PATIENT, Roles.DOCTOR, Roles.ADMIN]);
    const body = await req.json();
    const { eventId, note } = BookmarkSchema.parse(body);

    const bookmark = await TimelineMutationHandler.addBookmark(user.user_id, eventId, note);
    return NextResponse.json(bookmark, { status: 201 });
  } catch (err: unknown) {
    const e = err as Error;
    if (e.message?.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Already bookmarked' }, { status: 409 });
    }
    if (e.message?.startsWith('Forbidden') || e.message?.startsWith('Unauthorized')) {
      return NextResponse.json(
        { error: e.message },
        { status: e.message.startsWith('Unauthorized') ? 401 : 403 },
      );
    }
    return NextResponse.json({ error: 'Failed to add bookmark' }, { status: 500 });
  }
}

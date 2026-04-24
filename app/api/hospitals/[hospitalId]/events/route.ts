import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { getEventLogFeed } from '@/services/dashboard.service';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ hospitalId: string }> }
) {
    try {
        const session = await verifySession('session_user');
        if (!session?.isAuth) {
            return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED', statusCode: 401 }, { status: 401 });
        }

        const { hospitalId } = await params;
        if (session.user.hospitalId !== hospitalId && session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN', statusCode: 403 }, { status: 403 });
        }

        const url = new URL(req.url);
        const rawLimit = url.searchParams.get('limit');
        let limit = parseInt(rawLimit || '20', 10);
        if (isNaN(limit) || limit <= 0) limit = 20;
        limit = Math.min(limit, 50);

        const data = await getEventLogFeed(hospitalId, limit);
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message, code: 'INTERNAL_ERROR', statusCode: 500 }, { status: 500 });
    }
}

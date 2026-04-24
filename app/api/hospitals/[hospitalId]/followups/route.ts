import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { getFollowUpQueue } from '@/services/dashboard.service';

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
        const status = url.searchParams.get('status') || 'pending';

        let limit = parseInt(url.searchParams.get('limit') || '20', 10);
        if (isNaN(limit) || limit <= 0) limit = 20;
        limit = Math.min(limit, 50);

        let offset = parseInt(url.searchParams.get('offset') || '0', 10);
        if (isNaN(offset) || offset < 0) offset = 0;

        const data = await getFollowUpQueue(hospitalId, status, limit, offset);
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message, code: 'INTERNAL_ERROR', statusCode: 500 }, { status: 500 });
    }
}

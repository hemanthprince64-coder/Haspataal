import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { sendFollowUpReminder } from '@/services/dashboard.service';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ hospitalId: string; followupId: string }> }
) {
    try {
        const session = await verifySession('session_user');
        if (!session?.isAuth) {
            return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED', statusCode: 401 }, { status: 401 });
        }

        const { hospitalId, followupId } = await params;
        if (session.user.hospitalId !== hospitalId && session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN', statusCode: 403 }, { status: 403 });
        }

        const body = await req.json().catch(() => ({}));
        const channel = body.channel || 'auto';

        if (!['whatsapp', 'sms', 'auto'].includes(channel)) {
            return NextResponse.json({ error: 'Invalid channel', code: 'BAD_REQUEST', statusCode: 400 }, { status: 400 });
        }

        const result = await sendFollowUpReminder(hospitalId, followupId, channel);
        return NextResponse.json(result);
    } catch (e: any) {
        return NextResponse.json({ error: e.message, code: 'INTERNAL_ERROR', statusCode: 500 }, { status: 500 });
    }
}

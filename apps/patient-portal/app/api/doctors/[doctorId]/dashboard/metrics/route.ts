import { NextRequest, NextResponse } from 'next/server';

import logger from '@/lib/logger';
import { services } from '@/lib/services';
import { verifySession } from '@/lib/session';

export async function GET(req: NextRequest, { params }: { params: Promise<{ doctorId: string }> }) {
  try {
    const session = await verifySession('session_doctor');

    if (!session?.isAuth || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED', statusCode: 401 },
        { status: 401 },
      );
    }

    const { doctorId } = await params;

    // Authorization: Only the doctor themselves can view their metrics
    if (session.user.id !== doctorId && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN', statusCode: 403 },
        { status: 403 },
      );
    }

    const data = await services.doctor.getDashboardStats(doctorId);
    return NextResponse.json(data);
  } catch (e: any) {
    logger.error({ err: e }, 'Error fetching doctor dashboard metrics');
    return NextResponse.json(
      { error: e.message, code: 'INTERNAL_ERROR', statusCode: 500 },
      { status: 500 },
    );
  }
}

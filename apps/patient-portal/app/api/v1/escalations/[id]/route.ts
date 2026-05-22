import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/requireRole';
import { UserRole } from '@/types';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const acknowledgeSchema = z.object({ escalationId: z.string().uuid() });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const requestId = uuidv4();
  let user;
  try {
    user = await requireRole(UserRole.DOCTOR, 'session_user');
  } catch (err: any) {
    const msg = err.message || 'UNAUTHORIZED';
    const status = msg === 'FORBIDDEN' ? 403 : 401;
    return NextResponse.json(
      { error: status === 401 ? 'Unauthorized' : 'Forbidden', code: msg },
      { status, headers: { 'X-Request-ID': requestId } },
    );
  }

  try {
    const { id } = await params;

    const body = await req.json().catch(() => ({}));
    const parsed = acknowledgeSchema.safeParse({ escalationId: id });
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid escalation ID', code: 'VALIDATION_ERROR' },
        { status: 422, headers: { 'X-Request-ID': requestId } },
      );
    }

    // Idempotent update — scoped to the claim-ing doctor so no cross-doctor ack is possible
    const result = await prisma.escalationAlert.updateMany({
      where: { id, isAcknowledged: false, doctorId: user.id },
      data:  { isAcknowledged: true, acknowledgedAt: new Date() },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Escalation not found or already resolved', code: 'NOT_FOUND' },
        { status: 404, headers: { 'X-Request-ID': requestId } },
      );
    }

    return new NextResponse(null, {
      status: 204,
      headers: { 'X-Request-ID': requestId },
    });
  } catch (e: any) {
    const rId = uuidv4();
    return NextResponse.json(
      { error: 'Internal error', code: 'INTERNAL_ERROR', requestId: rId },
      { status: 500, headers: { 'X-Request-ID': rId } },
    );
  }
}

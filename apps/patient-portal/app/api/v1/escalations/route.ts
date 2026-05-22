import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/requireRole';
import { UserRole } from '@/types';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const limitSchema = z.coerce.number().int().min(1).max(100).default(50);
const offsetSchema = z.coerce.number().int().min(0).default(0);

export async function GET(req: NextRequest) {
  const requestId = uuidv4();

  // Auth: require an authenticated DOCTOR session
  let sessionUser;
  try {
    sessionUser = await requireRole(UserRole.DOCTOR, 'session_user');
  } catch (err: any) {
    const msg  = err.message || 'UNAUTHORIZED';
    const code = msg === 'FORBIDDEN' ? 'FORBIDDEN' : 'UNAUTHORIZED';
    return NextResponse.json(
      { error: code === 'UNAUTHORIZED' ? 'Unauthorized' : 'Forbidden', code },
      { status: code === 'UNAUTHORIZED' ? 401 : 403, headers: { 'X-Request-ID': requestId } },
    );
  }

  // Parse pagination
  const { limit, offset } = z
    .object({ limit: limitSchema, offset: offsetSchema })
    .parse({
      limit:  req.nextUrl.searchParams.get('limit'),
      offset: req.nextUrl.searchParams.get('offset'),
    });

  try {
    const [total, rows] = await Promise.all([
      prisma.escalationAlert.count({ where: { isAcknowledged: false } }),
      prisma.escalationAlert.findMany({
        where:  { isAcknowledged: false },
        include: {
          hospital: { select: { id: true, displayName: true } },
          patient:  { select: { id: true, name: true, phone: true } },
        },
        orderBy: { createdAt: 'asc' },
        take: limit,
        skip: offset,
      }),
    ]);

    return NextResponse.json(
      {
        requestId,
        escalations: rows.map((e) => ({
          id: e.id, hospitalId: e.hospitalId,
          hospitalName: e.hospital?.displayName,
          patientId: e.patientId, patientName: e.patient?.name, patientPhone: e.patient?.phone,
          doctorId: e.doctorId,
          missedCount: e.missedCount, chronicTag: e.chronicTag,
          notificationSent: e.notificationSent, sentVia: e.sentVia,
          createdAt: e.createdAt,
        })),
        pagination: { total, limit, offset, hasMore: offset + rows.length < total },
      },
      { headers: { 'X-Request-ID': requestId } },
    );
  } catch (e: any) {
    const rId = uuidv4();
    return NextResponse.json(
      { error: 'Internal error', code: 'INTERNAL_ERROR', requestId: rId },
      { status: 500, headers: { 'X-Request-ID': rId } },
    );
  }
}

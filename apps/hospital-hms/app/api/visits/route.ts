/* eslint-disable */
import { NextResponse } from 'next/server';
import { VisitService } from '@/lib/services/visits';
import { checkRole, Roles } from '@/lib/auth/roleGuard';

export async function GET(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.RECEPTIONIST]);
    // @ts-expect-error
    const data = await VisitService.getRecent(user.hospital_id);
    // Note: For strict doctor visibility (own visits only), filtering should happen here or in service.
    // Current implementation returns all hospital visits.
    // Improvement: Pass user.id and user.role to Service to filter if role is DOCTOR.

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.RECEPTIONIST]);
    const body = await req.json();

    const visitData = {
      ...body,
      // @ts-expect-error
      hospital_id: user.hospital_id,
      // @ts-expect-error
      doctor_id: body.doctor_id || user.user_id,
    };

    const data = await VisitService.create(visitData);

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 403 });
  }
}

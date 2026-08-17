import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { WardService } from '@/lib/services/ward';

export async function GET(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.RECEPTIONIST, Roles.NURSE]);
    const data = await WardService.getBedDashboard(user.hospital_id);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await checkRole(req, [Roles.ADMIN, Roles.RECEPTIONIST, Roles.NURSE]);
    const body = await req.json();
    const data = await WardService.updateBedStatus(body.bedId, body.status);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

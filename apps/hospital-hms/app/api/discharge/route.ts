import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { DischargeService } from '@/lib/services/discharge';

export async function GET(req: Request) {
  try {
    await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.NURSE]);
    const { searchParams } = new URL(req.url);
    const admissionId = searchParams.get('admissionId');
    if (!admissionId) {
      return NextResponse.json({ error: 'Missing admissionId' }, { status: 400 });
    }
    const summary = await DischargeService.generateDischargeSummary(admissionId);
    return NextResponse.json(summary);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await checkRole(req, [Roles.ADMIN, Roles.DOCTOR]);
    const body = await req.json();
    const data = await DischargeService.scheduleDischargeFollowUp(
      body.admissionId,
      new Date(body.followUpDate),
    );
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

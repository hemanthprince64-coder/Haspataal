import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { RecordsService } from '@/lib/services/records';

export async function GET(req: Request) {
  try {
    await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.NURSE]);
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    if (!patientId) {
      return NextResponse.json({ error: 'Missing patientId' }, { status: 400 });
    }
    const timeline = await RecordsService.getEMRTimeline(patientId);
    return NextResponse.json(timeline);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

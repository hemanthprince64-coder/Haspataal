import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { IPDService } from '@/lib/services/ipd';

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    await checkRole(req, [Roles.ADMIN, Roles.DOCTOR]);
    const body = await req.json();
    const admissionId = params.id;
    const data = await IPDService.dischargePatient(
      admissionId,
      body.notes || '',
      body.dischargeSummary || '',
    );
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

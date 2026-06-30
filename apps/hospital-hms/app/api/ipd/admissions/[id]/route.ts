import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { IPDService } from '@/lib/services/ipd';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.RECEPTIONIST]);
    const body = await req.json();
    const admissionId = params.id;

    if (body.newBedId) {
      const data = await IPDService.transferWard(admissionId, body.newBedId);
      return NextResponse.json(data);
    } else if (body.expectedDischargeAt) {
      const data = await IPDService.expectedDischarge(
        admissionId,
        new Date(body.expectedDischargeAt),
      );
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ error: 'Missing transfer parameters' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

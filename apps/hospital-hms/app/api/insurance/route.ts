import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { InsuranceService } from '@/lib/services/insurance';

export async function POST(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.BILLING]);
    const body = await req.json();

    if (body.action === 'CLAIM') {
      const data = await InsuranceService.submitClaim(body.invoiceId, body.claimAmount);
      return NextResponse.json(data);
    } else {
      const data = await InsuranceService.verifyInsurance(
        user.hospital_id,
        body.patientId,
        body.policyNumber,
        body.insurerName,
        body.tpaName,
      );
      return NextResponse.json(data);
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await checkRole(req, [Roles.ADMIN, Roles.BILLING]);
    const body = await req.json();
    const data = await InsuranceService.settleClaim(
      body.claimId,
      body.approvedAmount,
      body.settledAmount,
    );
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

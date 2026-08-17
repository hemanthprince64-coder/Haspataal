import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { BillingService } from '@/lib/services/billing';

export async function POST(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.BILLING]);
    const body = await req.json();

    if (body.action === 'PACKAGE') {
      const data = await BillingService.applyPackageBilling(
        user.hospital_id,
        body.patientId,
        body.packageId,
      );
      return NextResponse.json(data);
    } else if (body.action === 'REFUND') {
      const data = await BillingService.refundBill(body.invoiceId, body.amount, body.reason);
      return NextResponse.json(data);
    } else {
      const data = await BillingService.createDynamicBill(
        user.hospital_id,
        body.patientId,
        body.items,
        body.admissionId,
        body.diagnosticOrderId,
      );
      return NextResponse.json(data);
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

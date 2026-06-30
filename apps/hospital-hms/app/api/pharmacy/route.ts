import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { PharmacyService } from '@/lib/services/pharmacy';

export async function GET(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.PHARMACIST]);
    const data = await PharmacyService.getInventory(user.hospital_id);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.PHARMACIST]);
    const body = await req.json();
    if (body.action === 'AUDIT') {
      await PharmacyService.logInventoryAudit(
        user.hospital_id,
        body.drugStockId,
        body.type,
        body.changeQty,
        body.reason,
      );
      return NextResponse.json({ success: true });
    } else {
      const data = await PharmacyService.dispenseDrug(
        user.hospital_id,
        body.patientId,
        body.items,
        body.visitId,
        body.admissionId,
      );
      return NextResponse.json(data);
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

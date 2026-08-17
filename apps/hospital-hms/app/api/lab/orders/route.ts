import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { LabService } from '@/lib/services/diagnostics';

export async function GET(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.RECEPTIONIST]);
    const data = await LabService.getOrders(user.hospital_id);
    return NextResponse.json(data);
  } catch (err: any) {
    if (err.message.startsWith('Forbidden') || err.message.startsWith('Unauthorized')) {
      return NextResponse.json(
        { error: err.message },
        { status: err.message.startsWith('Unauthorized') ? 401 : 403 },
      );
    }
    return NextResponse.json({ error: 'Failed to fetch lab orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR]);
    const body = await req.json();
    const data = await LabService.createOrder(
      user.hospital_id,
      body.patientId,
      user.user_id,
      body.tests,
      body.appointmentId,
      body.visitId,
      body.priority,
      body.clinicalInfo,
    );

    const { AuditService } = await import('@/lib/services/audit');
    await AuditService.log(
      'LAB_ORDER_CREATED',
      user.hospital_id,
      user.user_id,
      'lab_orders',
      data.order.id,
      { tests: body.tests },
    );

    return NextResponse.json(data);
  } catch (err: any) {
    if (err.message.startsWith('Forbidden') || err.message.startsWith('Unauthorized')) {
      return NextResponse.json(
        { error: err.message },
        { status: err.message.startsWith('Unauthorized') ? 401 : 403 },
      );
    }
    return NextResponse.json({ error: 'Failed to create lab order' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { AlertService } from '@haspataal/core';
import { prisma } from '@/lib/util/prisma-singleton';
import { requireHospitalAccess, hospitalAccessError } from '@/lib/auth/hospital-access';

const alertService = new AlertService(prisma as any);

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const access = await requireHospitalAccess('clinical', 'update');
    
    // Only doctors and nurses can resolve alerts
    if (!['DOCTOR', 'NURSE'].includes(access.user.role)) {
      return NextResponse.json({ error: 'Only clinical staff can resolve alerts' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const note = body.note;

    if (!note) {
      return NextResponse.json({ error: 'Resolution note is required' }, { status: 400 });
    }

    const updated = await alertService.resolve(id, access.hospitalId, access.user.id, note);

    return NextResponse.json({ success: true, alert: updated });
  } catch (error: any) {
    console.error('Alerts Resolve PATCH Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to resolve alert' }, { status: 400 });
  }
}

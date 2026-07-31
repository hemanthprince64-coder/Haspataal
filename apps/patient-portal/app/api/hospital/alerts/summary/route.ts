import { AlertService } from '@haspataal/alerts';

import { NextRequest, NextResponse } from 'next/server';

import { requireHospitalAccess, hospitalAccessError } from '@/lib/auth/hospital-access';
import { prisma } from '@/lib/util/prisma-singleton';

const alertService = new AlertService(prisma as any);

export async function GET(req: NextRequest) {
  try {
    const access = await requireHospitalAccess('clinical', 'read');

    if (!['DOCTOR', 'NURSE', 'HOSPITAL_ADMIN'].includes(access.user.role)) {
      return NextResponse.json({ error: 'Unauthorized role for alerts' }, { status: 403 });
    }

    const summary = await alertService.getSummary(access.hospitalId);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Alerts Summary GET Error:', error);
    return hospitalAccessError(error);
  }
}

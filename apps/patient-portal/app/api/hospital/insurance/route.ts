import { NextRequest, NextResponse } from 'next/server';

import { requireHospitalAccess, hospitalAccessError } from '@/lib/auth/hospital-access';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('billing', 'read');
  } catch (error) {
    return hospitalAccessError(error);
  }

  try {
    const insurances = await prisma.hospitalInsurance.findMany({
      where: {
        hospitalId: access.hospitalId,
        isActive: true,
      },
      orderBy: { insurerName: 'asc' },
    });

    return NextResponse.json(insurances);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

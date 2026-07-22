/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';

import { requireHospitalAccess, hospitalAccessError } from '@/lib/auth/hospital-access';
import { prisma } from '@/lib/prisma';

export async function GET() {
  let access;
  try {
    access = await requireHospitalAccess('setup', 'read');
  } catch (error) {
    return hospitalAccessError(error);
  }

  try {
    const staff = await prisma.staff.findMany({
      where: { hospitalId: access.hospitalId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(staff);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 550 });
  }
}

export async function DELETE(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('setup', 'write');
  } catch (error) {
    return hospitalAccessError(error);
  }

  try {
    const { searchParams } = new URL(req.url);
    const mobile = searchParams.get('mobile');
    if (!mobile) {
      return NextResponse.json({ error: 'Mobile is required' }, { status: 400 });
    }

    await prisma.staff.deleteMany({
      where: {
        hospitalId: access.hospitalId,
        mobile: mobile,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 550 });
  }
}

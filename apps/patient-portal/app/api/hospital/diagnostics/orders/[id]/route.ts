import { NextRequest, NextResponse } from 'next/server';

import { hospitalAccessError, requireHospitalAccess } from '@/lib/auth/hospital-access';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let access;
  try {
    access = await requireHospitalAccess('diagnostics', 'read');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const { id } = await params;

  const order = await prisma.diagnosticOrder.findUnique({
    where: { id, hospitalId: access.hospitalId },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      doctor: { select: { id: true, fullName: true } },
      hospital: { select: { id: true, legalName: true } },
      items: {
        include: {
          test: true,
          results: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ order });
}

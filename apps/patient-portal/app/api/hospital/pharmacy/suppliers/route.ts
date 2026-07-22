/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hospitalAccessError, requireHospitalAccess } from '@/lib/auth/hospital-access';

export async function GET(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('pharmacy', 'read');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const suppliers = await prisma.supplier.findMany({
    where: { hospitalId: access.hospitalId },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ suppliers });
}

export async function POST(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('pharmacy', 'create');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const body = await req.json();

  const supplier = await prisma.supplier.create({
    data: {
      hospitalId: access.hospitalId,
      name: body.name,
      contactName: body.contactName,
      phone: body.phone,
      email: body.email,
      address: body.address,
      gstNumber: body.gstNumber,
      leadTime: body.leadTime || 7,
    },
  });

  return NextResponse.json({ supplier }, { status: 201 });
}

/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const branches = await prisma.branch.findMany({
    where: { hospitalId },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ branches });
}

export async function POST(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Branch name is required' }, { status: 400 });
  }

  try {
    const branch = await prisma.branch.create({
      data: {
        hospitalId,
        name: body.name,
        code: body.code ? body.code.toUpperCase() : null,
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        phone: body.phone,
        branchType: body.branchType || 'MAIN',
        facilities: body.facilities || [],
        openTime: body.openTime,
        closeTime: body.closeTime,
        isHeadquarters: Boolean(body.isHeadquarters),
        isActive: true,
      },
    });

    if (body.isHeadquarters) {
      await prisma.branch.updateMany({
        where: { hospitalId, id: { not: branch.id } },
        data: { isHeadquarters: false },
      });

      // Sync hospital isMultiBranch flag
      const branchCount = await prisma.branch.count({ where: { hospitalId } });
      if (branchCount > 1) {
        await prisma.hospitalsMaster.update({
          where: { id: hospitalId },
          data: { isMultiBranch: true },
        });
      }
    }

    return NextResponse.json({ branch }, { status: 201 });
  } catch (error: any) {
    console.error('[branches POST] Error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Branch code already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create branch' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const branches = await prisma.branch.findMany({
    where: { hospitalId },
    orderBy: { createdAt: 'asc' }
  });

  return NextResponse.json({ branches });
}

export async function POST(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  // Validate required fields
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Branch name is required' }, { status: 400 });
  }

  try {
    // Create branch
    const branch = await prisma.branch.create({
      data: {
        hospitalId,
        name: body.name,
        code: body.code ? body.code.toUpperCase() : null,
        address: body.address,
        city: body.city,
        pincode: body.pincode,
        phone: body.phone,
        isHeadquarters: Boolean(body.isHeadquarters),
        isActive: true,
      }
    });

    // If this is set as main branch, unset others (idempotent)
    if (body.isHeadquarters) {
      await prisma.branch.updateMany({
        where: { hospitalId, id: { not: branch.id } },
        data: { isHeadquarters: false }
      });
    }

    return NextResponse.json({ branch }, { status: 201 });
  } catch (error: any) {
    console.error('[branches POST] Error:', error);

    // Handle unique constraint violation on code
    if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
      return NextResponse.json({ error: 'Branch code already exists. Use a unique code.' }, { status: 409 });
    }

    // Handle unique constraint violation for headquarters (if DB constraint added later)
    if (error.code === 'P2002' && error.meta?.target?.includes('is_headquarters')) {
      return NextResponse.json({ error: 'Only one main branch per hospital is allowed.' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Failed to create branch' }, { status: 500 });
  }
}

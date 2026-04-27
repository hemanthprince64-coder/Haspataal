import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  try {
    const branch = await prisma.branch.update({
      where: { id, hospitalId },
      data: {
        name: body.name,
        code: body.code ? body.code.toUpperCase() : undefined,
        address: body.address,
        city: body.city,
        pincode: body.pincode,
        phone: body.phone,
        isActive: body.isActive,
        isHeadquarters: body.isHeadquarters,
      }
    });

    if (body.isHeadquarters) {
      await prisma.branch.updateMany({
        where: { hospitalId, id: { not: id } },
        data: { isHeadquarters: false }
      });
    }

    return NextResponse.json({ branch });
  } catch (error: any) {
    console.error('[branches PUT] Error:', error);
    
    if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
      return NextResponse.json({ error: 'Branch code already exists.' }, { status: 409 });
    }
    if (error.code === 'P2002' && error.meta?.target?.includes('is_headquarters')) {
      return NextResponse.json({ error: 'Only one main branch per hospital is allowed.' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Failed to update branch' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.branch.delete({
    where: { id: id, hospitalId }
  });

  return NextResponse.json({ ok: true });
}

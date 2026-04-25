import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  capacity: z.number().optional(),
  bedType: z.enum(['GENERAL', 'ICU', 'NICU', 'PRIVATE', 'SEMI_PRIVATE', 'EMERGENCY']).optional(),
  floor: z.string().optional(),
  type: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 422 });

  const unit = await prisma.unit.findUnique({
    where: { id },
    include: { department: true }
  });

  if (!unit || unit.department.hospitalId !== hospitalId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // If capacity changed, we might need to adjust beds
  // For now, simplicity: if capacity increases, add beds. If decreases, delete only AVAILABLE beds from the end.
  const updatedUnit = await prisma.$transaction(async (tx) => {
    const u = await tx.unit.update({
      where: { id },
      data: parsed.data,
      include: { beds: true }
    });

    if (parsed.data.capacity !== undefined && parsed.data.capacity !== unit.capacity) {
      const diff = parsed.data.capacity - unit.capacity;
      if (diff > 0) {
        // Add beds
        const lastBedNum = unit.beds.length;
        const newBeds = Array.from({ length: diff }, (_, i) => ({
          hospitalId,
          unitId: id,
          bedNumber: `B${lastBedNum + i + 1}`,
          type: u.bedType,
          status: 'AVAILABLE' as const,
        }));
        await tx.bed.createMany({ data: newBeds });
      } else if (diff < 0) {
        // Remove beds (only if they are available and starting from the highest number)
        const bedsToDelete = await tx.bed.findMany({
          where: { unitId: id, status: 'AVAILABLE' },
          orderBy: { bedNumber: 'desc' },
          take: Math.abs(diff)
        });
        
        if (bedsToDelete.length > 0) {
          await tx.bed.deleteMany({
            where: { id: { in: bedsToDelete.map(b => b.id) } }
          });
        }
      }
    }

    return tx.unit.findUnique({
      where: { id },
      include: { beds: true }
    });
  });

  return NextResponse.json({ unit: updatedUnit });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const unit = await prisma.unit.findUnique({
    where: { id },
    include: { 
      department: true,
      beds: true
    }
  });

  if (!unit || unit.department.hospitalId !== hospitalId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Rule: Cannot delete unit with occupied beds
  const occupiedBeds = unit.beds.filter(b => b.status === 'OCCUPIED');
  if (occupiedBeds.length > 0) {
    return NextResponse.json({ 
      error: 'Cannot delete unit with occupied beds', 
      occupiedCount: occupiedBeds.length 
    }, { status: 400 });
  }

  await prisma.unit.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}

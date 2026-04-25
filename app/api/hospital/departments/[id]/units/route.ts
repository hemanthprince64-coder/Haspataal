import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';

const unitSchema = z.object({
  name: z.string().min(1),
  capacity: z.number().default(0),
  bedType: z.enum(['GENERAL', 'ICU', 'NICU', 'PRIVATE', 'SEMI_PRIVATE', 'EMERGENCY']).default('GENERAL'),
  wardNumber: z.string().optional(),
  floor: z.string().optional(),
  type: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id: departmentId } = await params;
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify department belongs to hospital
  const dept = await prisma.department.findFirst({ where: { id: departmentId, hospitalId } });
  if (!dept) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = unitSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 422 });

  const count = await prisma.unit.count({ where: { departmentId } });
  
  // Create Unit and Beds in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const unit = await tx.unit.create({
      data: { ...parsed.data, departmentId, sortOrder: count },
    });

    // Auto-generate beds
    if (unit.capacity > 0) {
      const bedsData = Array.from({ length: unit.capacity }, (_, i) => ({
        hospitalId,
        unitId: unit.id,
        bedNumber: `B${i + 1}`,
        type: unit.bedType,
        status: 'AVAILABLE' as const,
      }));

      await tx.bed.createMany({
        data: bedsData,
      });
    }

    return tx.unit.findUnique({
      where: { id: unit.id },
      include: { beds: true },
    });
  });

  return NextResponse.json({ unit: result }, { status: 201 });
}

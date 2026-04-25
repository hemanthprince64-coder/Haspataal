import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';

const deptSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).max(10),
  type: z.enum(['OPD', 'IPD', 'BOTH', 'EMERGENCY']).default('OPD'),
  headDoctorId: z.string().optional(),
  billingRules: z.any().optional(),
  analyticsEnabled: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

const seedSchema = z.object({
  seed: z.literal(true),
  departments: z.array(z.object({ name: z.string(), code: z.string(), type: z.string() })),
});

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const departments = await prisma.department.findMany({
    where: { hospitalId },
    include: {
      units: {
        include: { beds: { orderBy: { bedNumber: 'asc' } } },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });

  return NextResponse.json({ departments });
}

export async function POST(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  // Handle seed request
  const seedParsed = seedSchema.safeParse(body);
  if (seedParsed.success) {
    const seeded = await prisma.$transaction(
      seedParsed.data.departments.map((d, idx) =>
        prisma.department.upsert({
          where: { hospitalId_code: { hospitalId, code: d.code } },
          update: {},
          create: {
            hospitalId,
            name: d.name,
            code: d.code,
            type: d.type as 'OPD' | 'IPD' | 'BOTH' | 'EMERGENCY',
            sortOrder: idx,
          },
        })
      )
    );
    const departments = await prisma.department.findMany({ where: { hospitalId }, include: { units: true }, orderBy: { sortOrder: 'asc' } });
    return NextResponse.json({ departments });
  }

  const parsed = deptSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });

  const count = await prisma.department.count({ where: { hospitalId } });
  const department = await prisma.department.create({
    data: { ...parsed.data, hospitalId, sortOrder: count },
    include: { units: true },
  });

  return NextResponse.json({ department }, { status: 201 });
}

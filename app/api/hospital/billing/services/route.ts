import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';
import { z } from 'zod';

const serviceSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['CONSULTATION', 'PROCEDURE', 'LAB_TEST', 'IMAGING', 'BED_CHARGE', 'MEDICINE', 'PACKAGE']).default('CONSULTATION'),
  departmentId: z.string().optional(),
  basePrice: z.number().positive(),
  gstRate: z.number().min(0).max(28).default(0),
  gstInclusive: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const services = await prisma.serviceCatalog.findMany({
    where: { hospitalId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ services });
}

export async function POST(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });

  const service = await prisma.serviceCatalog.create({
    data: { ...parsed.data, hospitalId },
  });

  return NextResponse.json({ service }, { status: 201 });
}

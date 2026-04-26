import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hospitalAccessError, requireHospitalAccess, writeAuditLog } from '@/lib/auth/hospital-access';
import { z } from 'zod';

const pricingSchema = z.object({
  testId: z.string().optional(),
  testName: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).default('LAB'),
  price: z.coerce.number().positive().optional(),
  hospitalPrice: z.coerce.number().nonnegative().optional(),
  patientMrp: z.coerce.number().positive().optional(),
  tatOverrideHours: z.coerce.number().int().positive().optional(),
  turnaroundHours: z.coerce.number().int().positive().optional(),
}).refine((data) => Boolean(data.testId || data.testName), {
  message: 'testId or testName is required',
  path: ['testName'],
});

function formatPricing(row: any) {
  const price = Number(row.price);
  return {
    ...row,
    testName: row.test?.testName ?? row.testName ?? '',
    category: row.test?.category?.name ?? row.category ?? 'LAB',
    hospitalPrice: price,
    patientMrp: price,
    turnaroundHours: row.tatOverrideHours ?? row.test?.turnaroundTimeHours ?? 24,
  };
}

export async function GET(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('diagnostics', 'read');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const pricing = await prisma.hospitalDiagnosticPricing.findMany({
    where: { hospitalId: access.hospitalId },
    include: { test: { include: { category: true } } },
    orderBy: { test: { testName: 'asc' } }
  });

  return NextResponse.json({ pricing: pricing.map(formatPricing) });
}

export async function POST(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('diagnostics', 'create');
  } catch (error) {
    return hospitalAccessError(error);
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = pricingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });

  const price = parsed.data.patientMrp ?? parsed.data.price ?? parsed.data.hospitalPrice;
  if (!price || price <= 0) {
    return NextResponse.json({ error: 'A positive price is required' }, { status: 422 });
  }

  const testId = parsed.data.testId ?? await prisma.$transaction(async (tx) => {
    const category = await tx.diagnosticCategory.upsert({
      where: { name: parsed.data.category },
      update: {},
      create: { name: parsed.data.category },
    });

    const test = await tx.diagnosticMasterTest.create({
      data: {
        categoryId: category.id,
        testName: parsed.data.testName!,
        turnaroundTimeHours: parsed.data.turnaroundHours ?? parsed.data.tatOverrideHours ?? 24,
      },
    });

    return test.id;
  });

  const test = await prisma.hospitalDiagnosticPricing.upsert({
    where: { hospitalId_testId: { hospitalId: access.hospitalId, testId } },
    update: {
      price,
      tatOverrideHours: parsed.data.turnaroundHours ?? parsed.data.tatOverrideHours,
      isAvailable: true,
    },
    create: {
      hospitalId: access.hospitalId,
      testId,
      price,
      tatOverrideHours: parsed.data.turnaroundHours ?? parsed.data.tatOverrideHours,
      isAvailable: true,
    },
    include: { test: { include: { category: true } } },
  });

  await writeAuditLog({
    hospitalId: access.hospitalId,
    userId: access.user.id,
    action: 'diagnostics.pricing.upsert',
    entity: 'HospitalDiagnosticPricing',
    entityId: test.id,
    details: { testId, price },
  });

  return NextResponse.json({ test: formatPricing(test) }, { status: 201 });
}

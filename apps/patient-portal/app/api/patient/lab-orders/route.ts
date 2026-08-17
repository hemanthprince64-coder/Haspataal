import { z } from 'zod';

import { NextRequest, NextResponse } from 'next/server';

import { requireRole } from '@/lib/auth/requireRole';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types';

const createOrderSchema = z.object({
  hospitalId: z.string().min(1),
  testIds: z.array(z.string().min(1)).min(1),
  doctorId: z.string().optional().nullable(),
});

export async function GET() {
  const patient = await requireRole(UserRole.PATIENT, 'session_patient');

  const orders = await prisma.diagnosticOrder.findMany({
    where: { patientId: patient.id },
    orderBy: { createdAt: 'desc' },
    include: {
      hospital: { select: { id: true, displayName: true, legalName: true } },
      doctor: { select: { id: true, fullName: true } },
      items: {
        include: {
          test: { select: { id: true, testName: true, testCode: true, sampleType: true } },
          results: true,
        },
      },
      invoices: { select: { id: true, invoiceNumber: true, status: true, totalAmount: true } },
    },
    take: 50,
  });

  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const patient = await requireRole(UserRole.PATIENT, 'session_patient');

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 },
    );

  const { hospitalId, testIds, doctorId } = parsed.data;

  const pricing = await prisma.hospitalDiagnosticPricing.findMany({
    where: { hospitalId, testId: { in: testIds }, isAvailable: true },
    include: { test: true },
  });

  if (pricing.length !== testIds.length) {
    return NextResponse.json(
      { error: 'One or more tests are not available at this hospital' },
      { status: 422 },
    );
  }

  const totalAmount = pricing.reduce((sum, item) => sum + Number(item.price), 0);

  const order = await prisma.diagnosticOrder.create({
    data: {
      hospitalId,
      patientId: patient.id,
      doctorId: doctorId || null,
      orderStatus: 'ORDERED',
      totalAmount,
      items: {
        create: pricing.map((item) => ({
          testId: item.testId,
          priceAtOrder: item.price,
          status: 'ORDERED',
        })),
      },
    },
    include: {
      items: { include: { test: true } },
      hospital: { select: { id: true, displayName: true, legalName: true } },
      doctor: { select: { id: true, fullName: true } },
    },
  });

  return NextResponse.json({ order }, { status: 201 });
}

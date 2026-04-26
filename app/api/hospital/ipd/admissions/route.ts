import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hospitalAccessError, requireHospitalAccess, writeAuditLog } from '@/lib/auth/hospital-access';

const admissionSchema = z.object({
  patientId: z.string().min(1),
  bedId: z.string().optional().nullable(),
  attendingDoctorId: z.string().optional().nullable(),
  reason: z.string().optional(),
  expectedDischargeAt: z.string().optional().nullable(),
  dailyBedCharge: z.number().nonnegative().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

function admissionNumber() {
  const now = new Date();
  return `IPD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export async function GET() {
  let access;
  try {
    access = await requireHospitalAccess('ipd', 'read');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const admissions = await prisma.admission.findMany({
    where: { hospitalId: access.hospitalId },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      bed: true,
      attendingDoctor: { select: { id: true, fullName: true, mobile: true } },
      invoices: { select: { id: true, invoiceNumber: true, status: true, totalAmount: true } },
    },
    orderBy: { admittedAt: 'desc' },
    take: 100,
  });
  return NextResponse.json({ admissions });
}

export async function POST(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('ipd', 'create');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const body = await req.json().catch(() => null);
  const parsed = admissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });
  }

  const data = parsed.data;
  const admission = await prisma.$transaction(async (tx) => {
    if (data.bedId) {
      const bed = await tx.bed.findFirst({ where: { id: data.bedId, hospitalId: access.hospitalId, status: 'AVAILABLE' } });
      if (!bed) throw new Error('BED_NOT_AVAILABLE');
    }

    const created = await tx.admission.create({
      data: {
        hospitalId: access.hospitalId,
        patientId: data.patientId,
        bedId: data.bedId ?? null,
        attendingDoctorId: data.attendingDoctorId ?? null,
        admissionNumber: admissionNumber(),
        reason: data.reason,
        expectedDischargeAt: data.expectedDischargeAt ? new Date(data.expectedDischargeAt) : null,
        dailyBedCharge: data.dailyBedCharge,
        payload: (data.payload ?? {}) as any,
      },
      include: { patient: true, bed: true },
    });

    if (data.bedId) {
      await tx.bed.update({
        where: { id: data.bedId },
        data: { status: 'OCCUPIED', patientId: data.patientId, admittedAt: created.admittedAt, expectedDischargeAt: created.expectedDischargeAt },
      });
    }
    return created;
  }).catch((error) => {
    if (error instanceof Error && error.message === 'BED_NOT_AVAILABLE') return null;
    throw error;
  });

  if (!admission) return NextResponse.json({ error: 'Bed is not available' }, { status: 409 });

  await writeAuditLog({
    hospitalId: access.hospitalId,
    userId: access.user.id,
    action: 'create',
    entity: 'admission',
    entityId: admission.id,
    details: { patientId: data.patientId, bedId: data.bedId },
  });

  return NextResponse.json({ admission }, { status: 201 });
}

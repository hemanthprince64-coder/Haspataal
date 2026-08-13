import { NextResponse } from 'next/server';

import { requireRole } from '@/lib/auth/requireRole';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types';

export async function GET() {
  const patient = await requireRole(UserRole.PATIENT, 'session_patient');

  const [prescriptions, labOrders, invoices, records] = await Promise.all([
    prisma.patientPrescription.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
      include: {
        doctor: { select: { id: true, fullName: true } },
        items: true,
        appointment: { select: { id: true, date: true } },
      },
    }),
    prisma.diagnosticOrder.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
      include: {
        hospital: { select: { id: true, displayName: true, legalName: true } },
        doctor: { select: { id: true, fullName: true } },
        items: {
          include: {
            test: { select: { id: true, testName: true, testCode: true } },
            results: true,
          },
        },
      },
    }),
    prisma.invoice.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
      include: {
        hospital: { select: { id: true, displayName: true, legalName: true } },
        lineItems: true,
      },
    }),
    prisma.patientRecord.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
      include: {
        doctor: { select: { id: true, fullName: true } },
      },
    }),
  ]);

  return NextResponse.json({
    prescriptions,
    labOrders,
    invoices,
    records,
  });
}

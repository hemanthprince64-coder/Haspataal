import { z } from 'zod';

import { NextRequest, NextResponse } from 'next/server';

import {
  hospitalAccessError,
  requireHospitalAccess,
  writeAuditLog,
} from '@/lib/auth/hospital-access';
import { invoiceNumber, summarizeInvoice } from '@/lib/billing/invoice';
import { prisma } from '@/lib/prisma';

const billAppointmentSchema = z.object({
  appointmentId: z.string().min(1),
  consultationFee: z.number().nonnegative(),
  doctorFee: z.number().nonnegative(),
  gstRate: z.number().min(0).max(28).default(0),
});

export async function POST(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('billing', 'create');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const body = await req.json().catch(() => null);
  const parsed = billAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const appointment = await prisma.appointment.findFirst({
    where: {
      id: data.appointmentId,
      hospitalId: access.hospitalId,
      patientId: { not: null },
    },
    include: { patient: true, doctor: true },
  });

  if (!appointment) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  }

  const existingInvoice = await prisma.invoice.findFirst({
    where: { appointmentId: data.appointmentId },
  });

  if (existingInvoice) {
    return NextResponse.json(
      { error: 'Invoice already exists for this appointment', invoiceId: existingInvoice.id },
      { status: 409 },
    );
  }

  const summary = summarizeInvoice([
    {
      description: `Consultation - ${appointment.doctor?.fullName || 'Doctor'}`,
      type: 'CONSULTATION',
      quantity: 1,
      unitPrice: data.consultationFee,
      gstRate: data.gstRate,
    },
    ...(data.doctorFee > 0
      ? [
          {
            description: 'Doctor fee',
            type: 'CONSULTATION',
            quantity: 1,
            unitPrice: data.doctorFee,
            gstRate: data.gstRate,
          },
        ]
      : []),
  ]);

  const invoice = await prisma.invoice.create({
    data: {
      hospitalId: access.hospitalId,
      patientId: appointment.patientId,
      appointmentId: appointment.id,
      invoiceNumber: invoiceNumber('OPD'),
      source: 'DIRECT',
      status: 'FINALIZED',
      finalizedAt: new Date(),
      subtotal: summary.subtotal,
      gstTotal: summary.gstTotal,
      discountTotal: summary.discountTotal,
      totalAmount: summary.totalAmount,
      balanceAmount: summary.totalAmount,
      lineItems: {
        create: summary.lines.map(({ input, amounts }) => ({
          description: input.description,
          type: input.type,
          quantity: amounts.quantity,
          unitPrice: input.unitPrice,
          gstRate: input.gstRate ?? 0,
          gstInclusive: false,
          discountAmount: amounts.discountAmount,
          taxableAmount: amounts.taxableAmount,
          gstAmount: amounts.gstAmount,
          totalAmount: amounts.totalAmount,
        })),
      },
    },
    include: { lineItems: true },
  });

  await writeAuditLog({
    hospitalId: access.hospitalId,
    userId: access.user.id,
    action: 'create',
    entity: 'invoice',
    entityId: invoice.id,
    details: { appointmentId: appointment.id, totalAmount: invoice.totalAmount },
  });

  return NextResponse.json({ invoice }, { status: 201 });
}

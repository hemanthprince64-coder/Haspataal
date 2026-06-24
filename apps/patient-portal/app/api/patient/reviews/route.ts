import { z } from 'zod';

import { NextRequest, NextResponse } from 'next/server';

import { requireRole } from '@/lib/auth/requireRole';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types';

const reviewSchema = z.object({
  appointmentId: z.string().min(1),
  doctorId: z.string().optional().nullable(),
  hospitalId: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const patient = await requireRole(UserRole.PATIENT, 'session_patient');

  const appointmentId = req.nextUrl.searchParams.get('appointmentId');
  const doctorId = req.nextUrl.searchParams.get('doctorId');

  if (appointmentId) {
    const review = await prisma.review.findFirst({
      where: { patientId: patient.id, appointmentId },
      include: { doctor: { select: { id: true, fullName: true } } },
    });
    return NextResponse.json({ review });
  }

  if (doctorId) {
    const reviews = await prisma.review.findMany({
      where: { patientId: patient.id, doctorId },
      orderBy: { createdAt: 'desc' },
      include: { doctor: { select: { id: true, fullName: true } } },
    });
    return NextResponse.json({ reviews });
  }

  const reviews = await prisma.review.findMany({
    where: { patientId: patient.id },
    orderBy: { createdAt: 'desc' },
    include: { doctor: { select: { id: true, fullName: true } } },
  });

  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest) {
  const patient = await requireRole(UserRole.PATIENT, 'session_patient');

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 },
    );

  const existing = await prisma.review.findFirst({
    where: { patientId: patient.id, appointmentId: parsed.data.appointmentId },
  });

  if (existing) {
    return NextResponse.json(
      { error: 'Review already submitted for this appointment' },
      { status: 409 },
    );
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: parsed.data.appointmentId },
    select: { doctorId: true, hospitalId: true, patientId: true },
  });

  if (!appointment || appointment.patientId !== patient.id) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  }

  const review = await prisma.review.create({
    data: {
      patientId: patient.id,
      doctorId: parsed.data.doctorId || appointment.doctorId,
      hospitalId: parsed.data.hospitalId || appointment.hospitalId,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    },
    include: {
      doctor: { select: { id: true, fullName: true } },
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}

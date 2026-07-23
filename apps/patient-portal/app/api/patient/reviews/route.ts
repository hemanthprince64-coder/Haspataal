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
    return NextResponse.json(
      { error: 'Review by appointmentId is not supported' },
      { status: 400 },
    );
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

  const appointment = await prisma.appointment.findUnique({
    where: { id: parsed.data.appointmentId },
    select: { doctorId: true, hospitalId: true, patientId: true },
  });

  if (!appointment || appointment.patientId !== patient.id) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  }

  const existing = await prisma.review.findFirst({
    where: { patientId: patient.id, doctorId: appointment.doctorId },
  });

  if (existing) {
    return NextResponse.json({ error: 'You have already reviewed this doctor' }, { status: 409 });
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

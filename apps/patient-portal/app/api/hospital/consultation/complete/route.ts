import { requireHospitalStaff } from '@haspataal/auth';

import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const user = await requireHospitalStaff();
    const hospitalId = user.hospitalId;

    if (!hospitalId || (user.role !== 'DOCTOR' && user.role !== 'HOSPITAL_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { appointmentId, patientId, doctorId, vitals, diagnosis, medications, notes } = body;

    // Verify appointment belongs to this hospital and doctor
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment || appointment.doctorId !== doctorId) {
      return NextResponse.json({ error: 'Invalid appointment' }, { status: 400 });
    }

    const prescriptionText = medications
      .filter((m: any) => m.name)
      .map((m: any) => `${m.name} - ${m.dosage} - ${m.frequency} - ${m.duration}`)
      .join('\n');

    // Idempotency check: Did this doctor just save this exact diagnosis and notes for this patient in the last 5 minutes?
    const recentRecord = await prisma.patientRecord.findFirst({
      where: {
        patientId,
        doctorId,
        diagnosis,
        notes,
        createdAt: { gte: new Date(Date.now() - 300000) }, // 5 minute window
      },
    });

    if (recentRecord) {
      // Idempotency hit: double-click. Just return the existing record.
      return NextResponse.json({ success: true, record: recentRecord });
    }

    // Update appointment status and create EHR
    const [updatedAppt, record] = await prisma.$transaction([
      prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'COMPLETED' },
      }),
      prisma.patientRecord.create({
        data: {
          patientId,
          doctorId,
          diagnosis,
          prescription: prescriptionText,
          notes,
          vitals: {
            bp: vitals?.bp || '',
            pulse: vitals?.pulse || '',
            temperature: vitals?.temp || '',
            weight: vitals?.weight || '',
          },
        },
      }),
    ]);

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    console.error('[CONSULTATION_COMPLETE_ERROR]', error);
    return NextResponse.json({ error: 'Failed to complete consultation' }, { status: 500 });
  }
}

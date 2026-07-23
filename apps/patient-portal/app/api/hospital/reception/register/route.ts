/* eslint-disable */
import { requireHospitalStaff } from '@haspataal/auth';

import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const user = await requireHospitalStaff();
    const hospitalId = user.hospitalId;

    if (!hospitalId) {
      return NextResponse.json({ error: 'No active hospital context' }, { status: 400 });
    }

    const body = await req.json();
    const { patientName, gender, age, isEmergency, doctorId, uhid } = body;
    let { patientMobile } = body;

    if (patientMobile) {
      patientMobile = patientMobile.replace(/\D/g, '').slice(-10);
    }

    if (!doctorId) {
      return NextResponse.json({ error: 'Doctor ID is required' }, { status: 400 });
    }

    const affiliation = await prisma.doctorHospitalAffiliation.findFirst({
      where: { doctorId, hospitalId },
    });

    if (!affiliation) {
      return NextResponse.json({ error: 'Invalid doctor selection' }, { status: 400 });
    }

    const consultationFee = affiliation.consultationFee || 500;

    // Fast Upsert Patient
    const patientData = {
      name: patientName,
      gender: gender,
      phone: patientMobile || null,
      password: 'password123',
    };

    let patient;
    if (isEmergency || !patientMobile) {
      patient = await prisma.patient.create({
        data: patientData,
      });
    } else {
      patient = await prisma.patient.upsert({
        where: { phone: patientMobile },
        update: { name: patientName, gender: gender },
        create: patientData,
      });
    }

    // Assign pseudo-UHID logic: if patient exists without one, we can't easily alter Prisma model without migration,
    // but we can generate an alias or just return the UHID to the frontend.
    // In our UI, we use the generated UHID from the client.

    // 2. Create Appointment (with Idempotency Guard for retries/double-clicks)
    // Check if an appointment was created in the last 5 minutes for this patient/doctor
    const recentAppointment = await prisma.appointment.findFirst({
      where: {
        patientId: patient.id,
        doctorId: doctorId,
        createdAt: { gte: new Date(Date.now() - 300000) }, // 5 minute window
      },
    });

    if (recentAppointment) {
      // 3. Find existing Visit
      const existingVisit = await prisma.visit.findFirst({
        where: { appointmentId: recentAppointment.id },
      });
      return NextResponse.json({ success: true, patient, visit: existingVisit, uhid });
    }

    let appointment;
    try {
      appointment = await prisma.appointment.create({
        data: {
          patientId: patient.id,
          doctorId: doctorId,
          date: new Date(),
          slot: `OPD-WALKIN`,
          status: 'COMPLETED',
          notes: `Age: ${age}, Gender: ${gender}${isEmergency ? ' [EMERGENCY]' : ''}`,
        },
      });
    } catch (createError: any) {
      if (createError.code === 'P2002') {
        // Perfect concurrency hit the unique constraint @@unique([doctorId, date, slot])
        // Fetch the one that successfully inserted
        appointment = await prisma.appointment.findFirst({
          where: { patientId: patient.id, doctorId: doctorId },
          orderBy: { createdAt: 'desc' },
        });
        if (!appointment) throw createError;
      } else {
        throw createError;
      }
    }

    // 3. Create Visit
    let visit;
    try {
      visit = await prisma.visit.create({
        data: {
          hospitalId: hospitalId,
          appointmentId: appointment.id,
          patientName: patientName,
          patientPhone: patientMobile || '',
          amount: Number(consultationFee),
        },
      });
    } catch (visitError: any) {
      if (visitError.code === 'P2002') {
        visit = await prisma.visit.findFirst({
          where: { appointmentId: appointment.id },
        });
      } else {
        throw visitError;
      }
    }

    return NextResponse.json({ success: true, patient, visit, uhid });
  } catch (error: any) {
    console.error('[RECEPTION_REGISTER_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to register patient', details: error?.message || String(error) },
      { status: 500 },
    );
  }
}

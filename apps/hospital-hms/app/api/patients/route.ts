/* eslint-disable no-console */
import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import prisma from '@/lib/prisma';
import { PatientService } from '@/lib/services/patients';

export async function GET(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.RECEPTIONIST]);
    const data = await PatientService.getAll(user.hospital_id);
    return NextResponse.json(data);
  } catch (err: any) {
    if (err.message.startsWith('Forbidden') || err.message.startsWith('Unauthorized')) {
      return NextResponse.json(
        { error: err.message },
        { status: err.message.startsWith('Unauthorized') ? 401 : 403 },
      );
    }
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Patient Portal Registration (no auth required)
    if (body.action === 'register') {
      const { mobile, name, dob, gender, abhaId, consents } = body;

      // Validate and sanitize mobile
      if (!mobile || !/^[6-9]\d{9}$/.test(mobile.replace(/\D/g, '').slice(-10))) {
        return NextResponse.json({ error: 'Invalid mobile number' }, { status: 400 });
      }

      const sanitizedMobile = mobile.replace(/\D/g, '').slice(-10);

      // Create patient
      const patient = await prisma.patient.create({
        data: {
          name,
          phone: sanitizedMobile,
          dob: dob ? new Date(dob) : undefined,
          gender,
          abhaAddress: abhaId,
        },
      });

      // Create consents
      if (consents?.length) {
        const consentData = consents.map((consent: string) => ({
          patientId: patient.id,
          purpose: ['APPOINTMENT_BOOKING', 'HEALTH_RECORDS', 'MARKETING'].includes(consent)
            ? (consent as any)
            : 'HEALTH_RECORDS',
        }));
        await prisma.consent.createMany({ data: consentData });
      }

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: patient.id,
          action: 'PATIENT_REGISTER',
          entity: 'patient',
          entityId: patient.id,
        },
      });

      return NextResponse.json({ success: true, patient });
    }

    // Hospital-staff patient creation
    const user = await checkRole(req, [Roles.ADMIN, Roles.RECEPTIONIST]);
    const data = await PatientService.create(body.hospitalId || user.hospital_id, body);

    // Audit Log
    const { AuditService } = await import('@/lib/services/audit');
    await AuditService.log(
      'PATIENT_CREATE',
      body.hospitalId || user.hospital_id,
      body.userId,
      'hospital_patients',
      data.id,
      { patient_name: body.name },
    );

    return NextResponse.json(data);
  } catch (err: any) {
    if (err.message.startsWith('Forbidden') || err.message.startsWith('Unauthorized')) {
      return NextResponse.json(
        { error: err.message },
        { status: err.message.startsWith('Unauthorized') ? 401 : 403 },
      );
    }
    console.error(err);
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
  }
}

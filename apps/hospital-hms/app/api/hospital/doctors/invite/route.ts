/* eslint-disable no-console */
import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import prisma from '@/lib/prisma';

// POST /api/hospital/doctors/invite - Hospital invites a doctor
export async function POST(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN]);

    const { doctorId, hospitalId, role = 'DOCTOR', department, consultationFee } = await req.json();

    const actualHospitalId = hospitalId || (user as any).hospital_id;

    if (!doctorId) {
      return NextResponse.json({ error: 'doctorId required' }, { status: 400 });
    }

    // Check if doctor exists
    const doctor = await prisma.doctorMaster.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    // Create invitation
    const affiliation = await prisma.doctorHospitalAffiliation.create({
      data: {
        doctorId,
        hospitalId: actualHospitalId,
        role,
        department,
        consultationFee,
        verificationStatus: 'UNDER_VERIFICATION',
      },
    });

    // TODO: Send notification to doctor

    return NextResponse.json({ success: true, affiliation });
  } catch (error: any) {
    console.error('Invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation', details: error.message },
      { status: 500 },
    );
  }
}

// GET /api/hospital/doctors/invite?doctorId=... - Get invitations for doctor
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');

    if (!doctorId) {
      return NextResponse.json({ error: 'doctorId required' }, { status: 400 });
    }

    const invitations = await prisma.doctorHospitalAffiliation.findMany({
      where: { doctorId, verificationStatus: { in: ['UNDER_VERIFICATION', 'PENDING'] } },
      include: { hospital: true },
    });

    return NextResponse.json({ success: true, invitations });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch invitations', details: error.message },
      { status: 500 },
    );
  }
}

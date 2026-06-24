import { NextRequest, NextResponse } from 'next/server';

import { requireHospitalAccess, hospitalAccessError } from '@/lib/auth/hospital-access';
import { prisma } from '@/lib/prisma';

export async function GET() {
  let access;
  try {
    access = await requireHospitalAccess('setup', 'read');
  } catch (error) {
    return hospitalAccessError(error);
  }

  try {
    const hospital = await prisma.hospitalsMaster.findUnique({
      where: { id: access.hospitalId },
      select: {
        accountStatus: true,
        verificationStatus: true,
        contactNumber: true,
        legalName: true,
      },
    });

    if (!hospital) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
    }

    if (hospital.accountStatus === 'active') {
      return NextResponse.json({ stage: 8, hospitalId: access.hospitalId });
    }

    // Check operational profile (Stage 2 completion)
    const profile = await prisma.clinicOperationalProfile.findUnique({
      where: { hospitalId: access.hospitalId },
    });

    if (!profile) {
      return NextResponse.json({
        stage: 1,
        hospitalName: hospital.verificationStatus,
        hospitalId: access.hospitalId,
        contactNumber: hospital.contactNumber ?? '',
      }); // default welcome stage
    }

    // Check staff count (Stage 4)
    const staffCount = await prisma.staff.count({
      where: { hospitalId: access.hospitalId },
    });

    if (staffCount === 0) {
      return NextResponse.json({
        stage: 4,
        hospitalId: access.hospitalId,
        contactNumber: hospital.contactNumber ?? '',
      });
    }

    // Check opd config (Stage 5)
    const opdConfig = await prisma.opdConfig.findUnique({
      where: { hospitalId: access.hospitalId },
    });

    if (!opdConfig) {
      return NextResponse.json({
        stage: 5,
        hospitalId: access.hospitalId,
        contactNumber: hospital.contactNumber ?? '',
      });
    }

    // Check if patient list is not empty (e.g. they skipped or completed migration)
    // We can default to Stage 7 Training if they completed everything else but are not active yet
    return NextResponse.json({
      stage: 7,
      hospitalId: access.hospitalId,
      contactNumber: hospital.contactNumber ?? '',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 550 });
  }
}

export async function POST(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('setup', 'write');
  } catch (error) {
    return hospitalAccessError(error);
  }

  try {
    const { stage } = await req.json();

    if (stage === 8 || stage === 9 || stage === 10 || stage === 14) {
      // Mark hospital active!
      await prisma.hospitalsMaster.update({
        where: { id: access.hospitalId },
        data: {
          accountStatus: 'active',
          verificationStatus: 'verified', // automatically verify upon going live in demo mode
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 550 });
  }
}

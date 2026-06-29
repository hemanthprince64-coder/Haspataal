/* eslint-disable no-console */
import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';
import prisma from '@/lib/prisma';

// GET /api/doctors/verification?doctorId=... - Get verification status
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');

    if (!doctorId) {
      return NextResponse.json({ error: 'doctorId required' }, { status: 400 });
    }

    const [verification, education, , documents] = await Promise.all([
      prisma.doctorVerification.findUnique({ where: { doctorId } }),
      prisma.doctorEducation.count({ where: { doctorId } }),
      prisma.doctorCertification.count({ where: { doctorId } }),
      prisma.doctorIdentityDoc.count({
        where: {
          doctorId,
          verificationStatus: { in: ['PENDING', 'UNDER_VERIFICATION'] },
        },
      }),
    ]);

    const profile = await prisma.doctorProfile.findUnique({ where: { doctorId } });

    const status = verification?.status || 'PENDING';
    const isComplete = Boolean(
      profile?.speciality &&
      profile?.experienceYears &&
      (await prisma.doctorRegistration.findFirst({ where: { doctorId } })) &&
      education > 0 &&
      documents === 0,
    );

    return NextResponse.json({
      success: true,
      status,
      isComplete,
      documentsPending: documents,
      hasProfile: !!profile?.speciality,
      hasEducation: education > 0,
      hasRegistration: !!(await prisma.doctorRegistration.findFirst({ where: { doctorId } })),
      verification,
      profile,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch verification status', details: error.message },
      { status: 500 },
    );
  }
}

// PUT /api/doctors/verification - Update verification status (admin only)
export async function PUT(req: Request) {
  try {
    await checkRole(req, [Roles.ADMIN]);

    const { doctorId, status, verifiedBy } = await req.json();

    if (!doctorId || !status) {
      return NextResponse.json({ error: 'doctorId and status required' }, { status: 400 });
    }

    const validStatuses = [
      'PENDING',
      'DOCUMENT_PENDING',
      'UNDER_VERIFICATION',
      'VERIFIED',
      'REJECTED',
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const verification = await prisma.doctorVerification.upsert({
      where: { doctorId },
      create: {
        doctorId,
        status: status as any,
        verifiedBy,
        verifiedAt: new Date(),
      },
      update: {
        status: status as any,
        verifiedBy,
        verifiedAt: new Date(),
      },
    });

    // Update doctor kyc_status
    await prisma.doctorMaster.update({
      where: { id: doctorId },
      data: { kycStatus: status as any },
    });

    return NextResponse.json({ success: true, verification });
  } catch (error: any) {
    console.error('Verification update error:', error);
    return NextResponse.json(
      { error: 'Failed to update verification', details: error.message },
      { status: 500 },
    );
  }
}

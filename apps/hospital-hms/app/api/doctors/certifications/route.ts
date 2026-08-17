/* eslint-disable no-console */
import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

// POST /api/doctors/certifications
export async function POST(req: Request) {
  try {
    const { doctorId, courseName, authority, certificateNo, expiryDate } = await req.json();

    if (!doctorId || !courseName) {
      return NextResponse.json({ error: 'doctorId and courseName required' }, { status: 400 });
    }

    const certification = await prisma.doctorCertification.create({
      data: {
        doctorId,
        courseName,
        authority,
        certificateNo,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      },
    });

    return NextResponse.json({ success: true, certification });
  } catch (error: any) {
    console.error('Certification creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create certification', details: error.message },
      { status: 500 },
    );
  }
}

// GET /api/doctors/certifications?doctorId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');

    if (!doctorId) {
      return NextResponse.json({ error: 'doctorId required' }, { status: 400 });
    }

    const certifications = await prisma.doctorCertification.findMany({
      where: { doctorId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, certifications });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch certifications', details: error.message },
      { status: 500 },
    );
  }
}

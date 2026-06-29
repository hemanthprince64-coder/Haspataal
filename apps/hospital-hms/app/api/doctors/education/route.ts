/* eslint-disable no-console */
import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

// POST /api/doctors/education
export async function POST(req: Request) {
  try {
    const { doctorId, degreeType, degreeName, collegeName, year, registrationNumber } =
      await req.json();

    if (!doctorId) {
      return NextResponse.json({ error: 'doctorId required' }, { status: 400 });
    }

    const education = await prisma.doctorEducation.create({
      data: {
        doctorId,
        degreeType,
        degreeName,
        collegeName,
        year,
        registrationNumber,
      },
    });

    return NextResponse.json({ success: true, education });
  } catch (error: any) {
    console.error('Education creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create education record', details: error.message },
      { status: 500 },
    );
  }
}

// GET /api/doctors/education?doctorId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');

    if (!doctorId) {
      return NextResponse.json({ error: 'doctorId required' }, { status: 400 });
    }

    const education = await prisma.doctorEducation.findMany({
      where: { doctorId },
      orderBy: { year: 'desc' },
    });

    return NextResponse.json({ success: true, education });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch education', details: error.message },
      { status: 500 },
    );
  }
}

// PUT /api/doctors/education/:id
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const data = await req.json();
    const education = await prisma.doctorEducation.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, education });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update education', details: error.message },
      { status: 500 },
    );
  }
}

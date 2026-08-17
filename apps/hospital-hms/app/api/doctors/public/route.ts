import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const publicProfileSchema = z.object({
  doctorId: z.string().uuid(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    const { doctorId } = publicProfileSchema.parse({
      doctorId: searchParams.get('doctorId'),
    });

    // Get doctor from search index (reads only from discovery tables)
    const doctor = await prisma.doctorSearchIndex.findUnique({
      where: { 
        doctorId,
        isActive: true,
      },
    });

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Get public profile
    const profile = await prisma.doctorPublicProfile.findUnique({
      where: { doctorId },
    });

    // Get affiliations
    const affiliations = await prisma.doctorHospitalAffiliation.findMany({
      where: {
        doctorId,
        verificationStatus: 'ACTIVE',
      },
      include: {
        hospital: {
          select: {
            id: true,
            legalName: true,
            displayName: true,
            city: true,
            state: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...doctor,
        profile,
        affiliations,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Fetch failed', details: error.message },
      { status: 500 }
    );
  }
}
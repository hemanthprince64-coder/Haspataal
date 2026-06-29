import { z } from 'zod';

import { NextResponse } from 'next/server';

import { DoctorDiscoveryService } from '@/lib/services/doctor-discovery';

const availabilitySchema = z.object({
  doctorId: z.string().uuid(),
  hospitalId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const { doctorId, hospitalId, date } = availabilitySchema.parse({
      doctorId: searchParams.get('doctorId'),
      hospitalId: searchParams.get('hospitalId'),
      date: searchParams.get('date') || new Date().toISOString().split('T')[0],
    });

    const discovery = new DoctorDiscoveryService();
    const availability = await discovery.getAvailability(doctorId, hospitalId, date);

    return NextResponse.json({
      success: true,
      data: availability,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Availability check failed', details: error.message },
      { status: 500 },
    );
  }
}

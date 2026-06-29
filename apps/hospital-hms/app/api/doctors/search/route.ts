import { z } from 'zod';

import { NextResponse } from 'next/server';

import { DoctorDiscoveryService } from '@/lib/services/doctor-discovery';

const searchSchema = z.object({
  query: z.string().optional(),
  specialty: z.string().optional(),
  city: z.string().optional(),
  department: z.string().optional(),
  availableToday: z.boolean().optional(),
  teleconsultation: z.boolean().optional(),
  minRating: z.number().min(1).max(5).optional(),
  maxFee: z.number().positive().optional(),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const params = {
      query: searchParams.get('query') || undefined,
      specialty: searchParams.get('specialty') || undefined,
      city: searchParams.get('city') || undefined,
      department: searchParams.get('department') || undefined,
      availableToday: searchParams.get('availableToday') === 'true' ? true : undefined,
      teleconsultation: searchParams.get('teleconsultation') === 'true' ? true : undefined,
      minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
      maxFee: searchParams.get('maxFee') ? Number(searchParams.get('maxFee')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
      offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : 0,
    };

    const validated = searchSchema.parse(params);
    const discovery = new DoctorDiscoveryService();
    const doctors = await discovery.searchDoctors(validated);

    return NextResponse.json({
      success: true,
      data: doctors,
      pagination: {
        limit: validated.limit,
        offset: validated.offset,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: 'Search failed', details: error.message }, { status: 500 });
  }
}

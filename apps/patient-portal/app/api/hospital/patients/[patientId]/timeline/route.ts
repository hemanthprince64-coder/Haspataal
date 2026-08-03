import { getLogger } from '@haspataal/logger';
import { GetPatientTimelineUseCase } from '@haspataal/timeline';
import { TimelineCategory } from '@haspataal/types';
import { z } from 'zod';

import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';

const logger = getLogger('timeline-api');

const QuerySchema = z.object({
  limit: z.coerce.number().min(1).max(200).default(50),
  category: z.nativeEnum(TimelineCategory).optional(),
});

export async function GET(request: NextRequest, { params }: { params: { patientId: string } }) {
  try {
    const user = await requireAuth('session_user');
    const hospitalId = user?.hospitalId;

    if (!hospitalId) {
      throw new Error('Unauthorized');
    }

    // In Next.js 15, dynamic route params must be awaited
    const { patientId } = await params;

    const searchParams = request.nextUrl.searchParams;
    const query = QuerySchema.parse({
      limit: searchParams.get('limit') || undefined,
      category: searchParams.get('category') || undefined,
    });

    const useCase = new GetPatientTimelineUseCase();
    const timeline = await useCase.execute({
      patientId,
      hospitalId,
      limit: query.limit,
      category: query.category,
    });

    return NextResponse.json({ success: true, data: timeline });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: error.issues },
        { status: 400 },
      );
    }

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    logger.error(
      { action: 'get_patient_timeline', error, patientId: params.patientId },
      'Failed to fetch timeline',
    );
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patient timeline' },
      { status: 500 },
    );
  }
}

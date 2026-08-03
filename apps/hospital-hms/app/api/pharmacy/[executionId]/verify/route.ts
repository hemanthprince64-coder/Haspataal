import { prisma } from '@haspataal/db';
import { VerifyPharmacyOrderUseCase } from '@haspataal/pharmacy';
import { getTimelinePublisher } from '@haspataal/timeline';

import { NextResponse } from 'next/server';

import { successResponse, errorResponse } from '@/lib/api-response';
import { requirePermission } from '@/lib/auth/roleGuard';

export async function POST(req: Request, { params }: { params: { executionId: string } }) {
  try {
    const user = await requirePermission(req, 'PHARMACY_VERIFY');
    const body = await req.json();
    const { expectedVersion } = body;

    if (expectedVersion === undefined) {
      return errorResponse(
        'BAD_REQUEST',
        'expectedVersion is required for optimistic locking',
        400,
      );
    }

    const useCase = new VerifyPharmacyOrderUseCase(prisma, getTimelinePublisher());

    const result = await useCase.execute({
      executionId: params.executionId,
      expectedVersion,
      actor: {
        id: user.user_id,
        name: user.user_id,
        role: user.role,
      },
    });

    return successResponse(result, 200);
  } catch (err: any) {
    if (err.message.includes('Concurrency conflict') || err.message.includes('version mismatch')) {
      return errorResponse('VERSION_CONFLICT', 'This prescription has already been modified.', 409);
    }
    return errorResponse('INTERNAL_ERROR', err.message, 500);
  }
}

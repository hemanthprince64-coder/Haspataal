import { prisma } from '@haspataal/db';
import { ProcessPharmacyOrderUseCase } from '@haspataal/pharmacy';

import { NextResponse } from 'next/server';

import { successResponse, errorResponse } from '@/lib/api-response';
import { requirePermission } from '@/lib/auth/roleGuard';

export async function POST(req: Request) {
  try {
    const user = await requirePermission(req, 'PHARMACY_VIEW'); // Wait, generating an execution is usually done automatically or by a pharmacist? Let's use PHARMACY_VIEW or PHARMACY_VERIFY

    // The ProcessUseCase usually runs automatically when a doctor prescribes,
    // but we'll expose it in the API for manual triggering if needed.
    const userContext = await requirePermission(req, 'PHARMACY_VIEW');
    const body = await req.json();
    const { clinicalOrderId } = body;

    if (!clinicalOrderId) {
      return errorResponse('BAD_REQUEST', 'clinicalOrderId is required', 400);
    }

    const useCase = new ProcessPharmacyOrderUseCase(prisma);
    const result = await useCase.execute({
      clinicalOrderId,
      actor: {
        id: user.user_id,
        name: user.user_id, // we don't have name in token, just use id for now
        role: user.role,
      },
    });

    return successResponse(result, 201);
  } catch (err: any) {
    return errorResponse('INTERNAL_ERROR', err.message, 500);
  }
}

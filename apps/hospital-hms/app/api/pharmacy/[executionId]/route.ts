import { prisma } from '@haspataal/db';

import { NextResponse } from 'next/server';

import { successResponse, errorResponse } from '@/lib/api-response';
import { requirePermission } from '@/lib/auth/roleGuard';

export async function GET(req: Request, { params }: { params: Promise<{ executionId: string }> }) {
  const executionId = (await params).executionId;
  try {
    await requirePermission(req, 'PHARMACY_VIEW');

    const execution = await prisma.pharmacyExecution.findUnique({
      where: { id: executionId },
      include: {
        clinicalOrder: {
          include: {
            patient: true,
            doctor: true,
            encounter: true,
          },
        },
        items: true,
      },
    });

    if (!execution) {
      return errorResponse('NOT_FOUND', 'Pharmacy execution not found', 404);
    }

    return successResponse(execution, 200);
  } catch (err: any) {
    return errorResponse('INTERNAL_ERROR', err.message, 500);
  }
}

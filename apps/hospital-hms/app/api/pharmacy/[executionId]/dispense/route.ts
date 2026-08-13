import { prisma } from '@haspataal/db';
import { DispenseMedicationUseCase } from '@haspataal/pharmacy';
import { getTimelinePublisher } from '@haspataal/timeline';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requirePermission } from '@/lib/auth/roleGuard';

export async function POST(req: Request, { params }: { params: Promise<{ executionId: string }> }) {
  const executionId = (await params).executionId;
  try {
    const user = await requirePermission(req, 'PHARMACY_DISPENSE');
    const body = await req.json();
    const { items, expectedVersion } = body;

    if (expectedVersion === undefined) {
      return errorResponse(
        'BAD_REQUEST',
        'expectedVersion is required for optimistic locking',
        400,
      );
    }
    if (!items || !Array.isArray(items)) {
      return errorResponse('BAD_REQUEST', 'items array is required', 400);
    }

    const result = await DispenseMedicationUseCase.execute({
      executionId,
      expectedVersion,
      itemsDispensed: items,
      isPartial: false,
      actorId: user.user_id,
      actorName: user.user_id,
      actorRole: user.role,
    });

    return successResponse(result, 200);
  } catch (err: any) {
    if (err.message.includes('Concurrency conflict') || err.message.includes('version mismatch')) {
      return errorResponse('VERSION_CONFLICT', 'This prescription has already been modified.', 409);
    }
    return errorResponse('INTERNAL_ERROR', err.message, 500);
  }
}

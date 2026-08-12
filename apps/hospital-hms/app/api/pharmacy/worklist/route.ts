import { prisma } from '@haspataal/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requirePermission } from '@/lib/auth/roleGuard';

export async function GET(req: Request) {
  try {
    const user = await requirePermission(req, 'PHARMACY_VIEW');
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const where: any = {
      hospitalId: user.hospital_id,
    };
    if (status) where.status = status;
    if (priority) where.clinicalOrder = { priority };
    if (doctorId) where.clinicalOrder = { ...where.clinicalOrder, doctorId };
    if (patientId) where.clinicalOrder = { ...where.clinicalOrder, patientId };
    // add drug search or date ranges if needed.

    const [executions, total] = await Promise.all([
      prisma.pharmacyExecution.findMany({
        where,
        include: {
          clinicalOrder: {
            include: {
              patient: true,
              doctor: true,
            },
          },
          items: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pharmacyExecution.count({ where }),
    ]);

    return successResponse(
      {
        data: executions,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      200,
    );
  } catch (err: any) {
    return errorResponse('INTERNAL_ERROR', err.message, 500);
  }
}

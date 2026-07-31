 
import { logger } from '@haspataal/logger';
import { z } from 'zod';

import { NextRequest, NextResponse } from 'next/server';

import {
  hospitalAccessError,
  requireHospitalAccess,
  writeAuditLog,
} from '@/lib/auth/hospital-access';
import prisma from '@/lib/prisma';

const updateSchema = z.object({
  documentType: z
    .enum(['BLOOD_REPORT', 'IMAGING', 'PATHOLOGY', 'MICROBIOLOGY', 'OTHER'])
    .optional(),
  description: z.string().max(2000).optional(),
  resultId: z.string().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  let access;
  try {
    access = await requireHospitalAccess('diagnostics', 'update');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const { documentId } = await params;

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 422 });
  }

  const data = parsed.data;

  const doc = await prisma.diagnosticDocument.findUnique({
    where: { id: documentId },
    include: { order: true },
  });

  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  if (doc.uploadedBy !== access.user.id && !['HOSPITAL_ADMIN', 'DOCTOR'].includes(access.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Validate resultId belongs to same order if provided
  if (data.resultId !== undefined && data.resultId !== null) {
    const orderItems = await prisma.diagnosticOrderItem.findMany({
      where: { orderId: doc.orderId },
      include: { results: true },
    });
    const belongs = orderItems.some((item) => item.results.some((r) => r.id === data.resultId));
    if (!belongs) {
      return NextResponse.json(
        { error: 'Result must belong to the same diagnostic order' },
        { status: 422 },
      );
    }
  }

  try {
    const updated = await prisma.diagnosticDocument.update({
      where: { id: documentId },
      data: {
        ...(data.documentType !== undefined && { documentType: data.documentType }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.resultId !== undefined && { resultId: data.resultId }),
      },
    });

    await writeAuditLog({
      hospitalId: access.hospitalId,
      userId: access.user.id,
      action: 'update',
      entity: 'diagnostic_document',
      entityId: documentId,
      details: { orderId: doc.orderId, ...data },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    logger.error({ action: 'diagnostic_document_update', error: error.message }, 'Update failed');
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

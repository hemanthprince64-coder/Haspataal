 
import { logger } from '@haspataal/logger';
import { z } from 'zod';

import { NextRequest, NextResponse } from 'next/server';

import {
  hospitalAccessError,
  requireHospitalAccess,
  writeAuditLog,
} from '@/lib/auth/hospital-access';
import prisma from '@/lib/prisma';

const documentTypeEnum = z.enum(['BLOOD_REPORT', 'IMAGING', 'PATHOLOGY', 'MICROBIOLOGY', 'OTHER']);

const MAX_FILE_SIZE_MB = 50;
const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'application/dicom'];

function isAllowedMime(mime: string): boolean {
  return ALLOWED_TYPES.includes(mime);
}

function isAllowedSize(bytes: number): boolean {
  return bytes <= MAX_FILE_SIZE_MB * 1024 * 1024;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let access;
  try {
    access = await requireHospitalAccess('diagnostics', 'create');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const { id } = await params;

  const order = await prisma.diagnosticOrder.findUnique({
    where: { id, hospitalId: access.hospitalId },
    include: { items: { include: { results: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const documentTypeRaw = formData.get('documentType') as string | null;
    const description = (formData.get('description') as string) || null;
    const resultIdRaw = (formData.get('resultId') as string) || null;

    if (!file || !documentTypeRaw) {
      return NextResponse.json({ error: 'Missing file or documentType' }, { status: 422 });
    }

    let documentType: string;
    try {
      documentType = documentTypeEnum.parse(documentTypeRaw);
    } catch {
      return NextResponse.json({ error: 'Invalid documentType' }, { status: 422 });
    }

    if (!isAllowedMime(file.type)) {
      return NextResponse.json({ error: 'Disallowed file type' }, { status: 422 });
    }
    if (!isAllowedSize(file.size)) {
      return NextResponse.json({ error: 'File exceeds 50 MB limit' }, { status: 422 });
    }

    let resultId: string | null = null;
    if (resultIdRaw) {
      const belongs = order.items.some((item) => item.results.some((r) => r.id === resultIdRaw));
      if (!belongs) {
        return NextResponse.json(
          { error: 'Result must belong to the same diagnostic order' },
          { status: 422 },
        );
      }
      resultId = resultIdRaw;
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileExt = file.name.split('.').pop() || 'bin';
    const uuid = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    const fileName = `${uuid}.${fileExt}`;
    let fileUrl = '';

    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey =
        process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const bucketName = 'diagnostics';
        const filePath = `${access.hospitalId}/${id}/${fileName}`;

        const { error } = await supabase.storage.from(bucketName).upload(filePath, buffer, {
          upsert: true,
          contentType: file.type,
        });

        if (!error) {
          const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
          fileUrl = data.publicUrl;
        }
      }
    } catch (e: any) {
      logger.warn({ action: 'supabase_upload_failed', error: e.message }, 'Supabase upload failed');
    }

    if (!fileUrl) {
      const fs = require('fs').promises;
      const path = require('path');
      const uploadDir = path.join(
        process.cwd(),
        'public',
        'uploads',
        'diagnostics',
        access.hospitalId,
        id,
      );
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);
      fileUrl = `/uploads/diagnostics/${access.hospitalId}/${id}/${fileName}`;
    }

    const doc = await prisma.diagnosticDocument.create({
      data: {
        orderId: id,
        resultId,
        documentType,
        description,
        fileUrl,
        fileSizeBytes: file.size,
        mimeType: file.type,
        uploadedBy: access.user.id,
      },
    });

    await writeAuditLog({
      hospitalId: access.hospitalId,
      userId: access.user.id,
      action: 'create',
      entity: 'diagnostic_document',
      entityId: doc.id,
      details: { orderId: id, resultId, documentType },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error: any) {
    logger.error({ action: 'diagnostic_document_upload', error: error.message }, 'Upload failed');
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let access;
  try {
    access = await requireHospitalAccess('diagnostics', 'read');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const { id } = await params;

  const order = await prisma.diagnosticOrder.findUnique({
    where: { id, hospitalId: access.hospitalId },
  });
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const docs = await prisma.diagnosticDocument.findMany({
    where: { orderId: id },
    include: {
      result: { select: { id: true } },
    },
    orderBy: { uploadedAt: 'desc' },
  });

  return NextResponse.json({ documents: docs });
}

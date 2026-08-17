/* eslint-disable no-console */
import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const doctorId = formData.get('doctorId') as string;
    const documentType = formData.get('documentType') as string;
    const file = formData.get('file') as File;

    if (!doctorId || !documentType || !file) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate doctor exists
    const doctor = await prisma.doctorMaster.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // File size validation (10MB max)
    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // In production: upload to Supabase/encrypted storage
    // For now, store as base64 (DO NOT use in production)
    const fileUrl = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Create document record
    const document = await prisma.doctorIdentityDoc.create({
      data: {
        doctorId,
        documentType,
        documentUrl: fileUrl,
        verificationStatus: 'PENDING',
      },
    });

    // Update doctor verification status
    await prisma.doctorVerification.upsert({
      where: { doctorId },
      create: {
        doctorId,
        status: 'DOCUMENT_PENDING',
      },
      update: {
        status: 'DOCUMENT_PENDING',
      },
    });

    return NextResponse.json({ success: true, document });
  } catch (error: any) {
    console.error('Document upload error:', error);
    return NextResponse.json({ error: 'Upload failed', details: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');

    if (!doctorId) {
      return NextResponse.json({ error: 'doctorId required' }, { status: 400 });
    }

    const documents = await prisma.doctorIdentityDoc.findMany({
      where: { doctorId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, documents });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch documents', details: error.message },
      { status: 500 },
    );
  }
}

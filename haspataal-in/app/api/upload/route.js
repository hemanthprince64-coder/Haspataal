import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { uploadFile } from '@/lib/storage';

export async function POST(req) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
        }

        // Upload to Supabase Storage
        // Note: 'file' from formData is a Blob/File object.
        // supabase-js expects Blob/File/Buffer.
        const { publicUrl } = await uploadFile(file, session.user.id);

        // Save to DB
        const record = await prisma.medicalRecord.create({
            data: {
                patientId: session.user.id, // Ensure session.user has ID (set in auth.js)
                fileName: file.name,
                fileUrl: publicUrl,
                fileType: file.type
            }
        });

        return NextResponse.json({ success: true, record });

    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ message: 'Upload failed' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json([], { status: 401 });
    }

    try {
        const records = await prisma.medicalRecord.findMany({
            where: { patientId: session.user.id },
            orderBy: { uploadedAt: 'desc' }
        });
        return NextResponse.json(records);
    } catch (error) {
        return NextResponse.json([], { status: 500 });
    }
}

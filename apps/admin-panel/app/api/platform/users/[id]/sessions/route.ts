/* eslint-disable */
import { requirePlatformRole } from '@haspataal/auth';
import { prisma } from '@haspataal/db';

import { NextResponse } from 'next/server';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePlatformRole(['PLATFORM_ADMIN']);

    // In real app, invalidate tokens / delete sessions in Redis or DB
    // await prisma.adminSession.deleteMany({ where: { adminId: (await params).id } })

    return NextResponse.json({ success: true, message: 'Sessions revoked' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

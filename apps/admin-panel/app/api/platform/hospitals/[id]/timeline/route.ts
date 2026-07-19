import { requirePlatformRole } from '@haspataal/auth';
import { prisma } from '@haspataal/db';

import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await requirePlatformRole(['PLATFORM_ADMIN', 'NETWORK_ADMIN', 'HOSPITAL_ADMIN']);
    const hospitalId = params.id;

    const timeline = await prisma.platformTimelineEvent.findMany({
      where: {
        entityType: 'HOSPITAL',
        entityId: hospitalId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ timeline });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

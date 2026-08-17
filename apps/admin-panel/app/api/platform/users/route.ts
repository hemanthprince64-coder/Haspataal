import { requirePlatformRole } from '@haspataal/auth';
import { prisma } from '@haspataal/db';

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await requirePlatformRole(['PLATFORM_ADMIN']);

    const users = await prisma.platformAdmin.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    await requirePlatformRole(['PLATFORM_ADMIN']);
    const data = await request.json();

    const user = await prisma.platformAdmin.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role || 'PLATFORM_ADMIN',
      },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

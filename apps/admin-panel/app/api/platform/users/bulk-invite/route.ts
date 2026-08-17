/* eslint-disable */
import { requirePlatformRole } from '@haspataal/auth';
import { prisma } from '@haspataal/db';

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    await requirePlatformRole(['PLATFORM_ADMIN']);
    const { invites } = await request.json();

    // MVP: In real app, send invite emails and create accounts
    // const created = await prisma.platformAdmin.createMany({...})

    return NextResponse.json({ success: true, count: invites?.length || 0 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

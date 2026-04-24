import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';
import { randomBytes } from 'crypto';
import { z } from 'zod';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['DOCTOR', 'NURSE', 'RECEPTIONIST', 'BILLING', 'PHARMACIST', 'LAB_TECH', 'HOSPITAL_ADMIN', 'SUPER_ADMIN']),
});

export async function POST(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 422 });

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invite = await prisma.staffInvite.create({
    data: {
      hospitalId,
      email: parsed.data.email,
      role: parsed.data.role,
      token,
      expiresAt,
    },
  });

  // In production: send email with invite link
  // await sendInviteEmail({ email: parsed.data.email, token, role: parsed.data.role });
  console.log(`[Staff Invite] Token for ${parsed.data.email}: ${token}`);

  return NextResponse.json({ ok: true, inviteId: invite.id });
}

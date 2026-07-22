import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import logger from '@/lib/logger';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum([
    'DOCTOR',
    'NURSE',
    'RECEPTIONIST',
    'BILLING',
    'PHARMACIST',
    'LAB_TECH',
    'HOSPITAL_ADMIN',
    'SUPER_ADMIN',
  ]),
});

export async function POST(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 },
    );

  // Check for existing pending invite for same email (idempotency/duplicate prevention)
  const existingPending = await prisma.staffInvite.findFirst({
    where: {
      hospitalId,
      email: parsed.data.email,
      isAccepted: false,
      expiresAt: { gt: new Date() },
    },
  });
  if (existingPending) {
    return NextResponse.json(
      {
        error:
          'An invite has already been sent to this email. Please wait for them to accept or resend.',
      },
      { status: 409 },
    );
  }

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

  // TODO: Integrate email service — send invite link to parsed.data.email
  // await sendInviteEmail({ email: parsed.data.email, role: parsed.data.role, inviteId: invite.id });
  logger.info({ action: 'staff_invite_created', inviteId: invite.id, hospitalId, role: parsed.data.role });

  return NextResponse.json({ ok: true, inviteId: invite.id });
}

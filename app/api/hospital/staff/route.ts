import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';
import { randomBytes } from 'crypto';

const staffUpdateSchema = z.object({
  name: z.string().optional(),
  role: z.enum(['DOCTOR', 'NURSE', 'RECEPTIONIST', 'BILLING', 'PHARMACIST', 'LAB_TECH', 'HOSPITAL_ADMIN', 'SUPER_ADMIN']).optional(),
  shift: z.enum(['MORNING', 'EVENING', 'NIGHT', 'ROTATIONAL']).optional(),
  isActive: z.boolean().optional(),
  departmentId: z.string().optional(),
  permissions: z.any().optional(),
});

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const staff = await prisma.staff.findMany({
    where: { hospitalId },
    select: { id: true, name: true, email: true, mobile: true, role: true, shift: true, isActive: true, departmentId: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ staff });
}

export async function POST(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = staffUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 422 });

  // Minimal create — full flow uses invite
  return NextResponse.json({ error: 'Use invite flow for staff creation' }, { status: 400 });
}

// Invite route (separate file handles /staff/invite)
// Staff [id] route handles PUT/DELETE per member

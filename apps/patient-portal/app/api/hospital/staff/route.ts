import { z } from 'zod';

import { NextRequest, NextResponse } from 'next/server';

import { getHospitalIdFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const staffCreateSchema = z.object({
  name: z.string().min(1),
  mobile: z.string().min(1),
  email: z.string().optional(),
  role: z
    .enum([
      'DOCTOR',
      'NURSE',
      'RECEPTIONIST',
      'BILLING',
      'PHARMACIST',
      'LAB_TECH',
      'HOSPITAL_ADMIN',
      'SUPER_ADMIN',
    ])
    .default('RECEPTIONIST'),
  shift: z.enum(['MORNING', 'EVENING', 'NIGHT', 'ROTATIONAL']).optional(),
  isActive: z.boolean().default(true),
  departmentId: z.string().optional(),
  permissions: z.any().optional(),
  designation: z.string().optional(),
  qualifications: z.array(z.string()).optional(),
  bloodGroup: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const staff = await prisma.staff.findMany({
    where: { hospitalId },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      shift: true,
      isActive: true,
      departmentId: true,
      designation: true,
      qualifications: true,
      bloodGroup: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ staff });
}

export async function POST(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = staffCreateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 },
    );

  const staff = await prisma.staff.create({
    data: {
      hospitalId,
      name: parsed.data.name,
      mobile: parsed.data.mobile,
      email: parsed.data.email || null,
      role: parsed.data.role,
      shift: parsed.data.shift || null,
      isActive: parsed.data.isActive,
      departmentId: parsed.data.departmentId || null,
      permissions: parsed.data.permissions || {},
      designation: parsed.data.designation || null,
      qualifications: parsed.data.qualifications || [],
      bloodGroup: parsed.data.bloodGroup || null,
    } as any,
  });

  return NextResponse.json({ staff }, { status: 201 });
}

// Invite route (separate file handles /staff/invite)
// Staff [id] route handles PUT/DELETE per member

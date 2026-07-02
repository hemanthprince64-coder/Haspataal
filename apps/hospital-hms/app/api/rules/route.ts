import { prisma } from '@haspataal/db';
import { RuleRegistry } from '@haspataal/rules';
import { z } from 'zod';

import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';

const CreateRuleSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.enum([
    'CLINICAL',
    'BUSINESS',
    'NOTIFICATION',
    'RETENTION',
    'BILLING',
    'SECURITY',
    'VALIDATION',
  ]),
  triggerType: z.enum(['EVENT', 'SCHEDULED', 'MANUAL', 'BATCH']),
  triggerEvent: z.string().optional(),
  conditionJson: z.array(z.any()),
  actionJson: z.array(z.any()),
  isActive: z.boolean().default(true),
  priority: z.number().int().min(1).max(1000).default(100),
});

const registry = new RuleRegistry(prisma as any);

export async function POST(req: Request) {
  try {
    const user = await checkRole(req, ['admin']);
    const body = CreateRuleSchema.parse(await req.json());

    const rule = await registry.create({
      ...body,
      hospitalId: (user as any).hospital_id,
    });

    return NextResponse.json({ success: true, data: rule });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await checkRole(req, ['admin']);
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as any;
    const rules = await registry.list((user as any).hospital_id, category);
    return NextResponse.json({ success: true, data: rules });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

import { prisma } from '@haspataal/db';
import { ExecutionEngine } from '@haspataal/rules';
import { z } from 'zod';

import { NextResponse } from 'next/server';

import { checkRole } from '@/lib/auth/roleGuard';

const ExecuteRuleSchema = z.object({
  ruleId: z.string().uuid(),
  event: z.any().optional(),
  patientId: z.string().uuid().optional(),
});

const engine = new ExecutionEngine(prisma as any);

export async function POST(req: Request) {
  try {
    const user = await checkRole(req, ['admin']);
    const body = ExecuteRuleSchema.parse(await req.json());

    const rule = await prisma.rule.findUnique({
      where: { id: body.ruleId },
    });

    if (!rule || !rule.isActive) {
      return NextResponse.json(
        { success: false, error: 'Rule not found or inactive' },
        { status: 404 },
      );
    }

    const result = await engine.execute(
      {
        id: rule.id,
        hospitalId: rule.hospitalId,
        name: rule.name,
        description: rule.description,
        category: rule.category,
        triggerType: rule.triggerType,
        triggerEvent: rule.triggerEvent,
        conditionJson: rule.conditionJson,
        actionJson: rule.actionJson,
        isActive: rule.isActive,
        priority: rule.priority,
      } as any,
      {
        event: body.event,
        patientId: body.patientId,
        hospitalId: (user as any).hospital_id,
        timestamp: new Date(),
      },
    );

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

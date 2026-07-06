import { RuleCommandHandler, ExecuteRuleCommandSchema } from '@haspataal/rules';
import { NextResponse } from 'next/server';
import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { createPlatformQueryContext } from '@/lib/platform';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN]);
    const body = await req.json();

    const platformContext = await createPlatformQueryContext(req);
    platformContext.tenantScope.hospitalId = user.hospital_id;
    platformContext.actorScope.actorId = user.user_id;

    const command = {
      commandId: uuidv4(),
      commandVersion: 1,
      target: 'rules',
      tenantContext: platformContext.tenantScope,
      actorContext: platformContext.actorScope,
      correlationId: platformContext.correlationId,
      idempotencyKey: `execute-rule-${uuidv4()}`,
      timestamp: new Date().toISOString(),
      payload: body,
    };

    const parsedCommand = ExecuteRuleCommandSchema.parse(command);
    const result = await RuleCommandHandler.handleExecuteRule(parsedCommand as any);

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    if (err.message === 'Rule not found, inactive, or belongs to a different tenant') {
        return NextResponse.json(
            { success: false, error: 'Rule not found or inactive' },
            { status: 404 },
        );
    }
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

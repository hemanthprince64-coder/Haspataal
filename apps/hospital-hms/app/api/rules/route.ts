import { RuleQueryHandler, RuleCommandHandler, CreateRuleCommandSchema } from '@haspataal/rules';
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
      idempotencyKey: `create-rule-${uuidv4()}`,
      timestamp: new Date().toISOString(),
      payload: body,
    };

    // Validate and handle the command securely
    const parsedCommand = CreateRuleCommandSchema.parse(command);
    const rule = await RuleCommandHandler.handleCreateRule(parsedCommand as any);

    return NextResponse.json({ success: true, data: rule });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN]);
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;

    const platformContext = await createPlatformQueryContext(req);
    platformContext.tenantScope.hospitalId = user.hospital_id;

    const query = {
      ...platformContext,
      filters: { category },
    };

    const rules = await RuleQueryHandler.getRules(query);
    return NextResponse.json({ success: true, data: rules });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

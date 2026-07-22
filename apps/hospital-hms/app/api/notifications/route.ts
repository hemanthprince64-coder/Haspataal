/* eslint-disable @typescript-eslint/no-unused-vars */
import { NotificationCommandHandler, NotificationQueryHandler, NotificationInputSchema } from '@haspataal/notify';
import { NextResponse } from 'next/server';
import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { createPlatformQueryContext } from '@/lib/platform';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.NURSE]);
    const body = await req.json();

    const platformContext = await createPlatformQueryContext(req);
    platformContext.tenantScope.hospitalId = user.hospital_id;
    platformContext.actorScope.actorId = user.user_id;

    const command = {
      commandId: uuidv4(),
      commandVersion: 1,
      target: 'notifications',
      tenantContext: platformContext.tenantScope,
      actorContext: platformContext.actorScope,
      correlationId: platformContext.correlationId,
      idempotencyKey: `send-notification-${uuidv4()}`,
      timestamp: new Date().toISOString(),
      payload: body,
    };

    const handler = new NotificationCommandHandler();
    const result = await handler.handleSendNotification(command as any);

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.NURSE]);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;

    const platformContext = await createPlatformQueryContext(req);
    platformContext.tenantScope.hospitalId = user.hospital_id;
    platformContext.actorScope.actorId = user.user_id;

    const query = {
      ...platformContext,
      filters: { status },
    };

    const notifications = await NotificationQueryHandler.getNotifications(query);
    return NextResponse.json({ success: true, data: notifications });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

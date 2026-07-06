import { NotificationCommandHandler, NotificationQueryHandler } from '@haspataal/notify';
import { NextResponse } from 'next/server';
import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { createPlatformQueryContext } from '@/lib/platform';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.NURSE]);
    const platformContext = await createPlatformQueryContext(req);
    platformContext.tenantScope.hospitalId = user.hospital_id;

    const campaigns = await NotificationQueryHandler.getCampaigns(platformContext as any);
    return NextResponse.json({ success: true, data: campaigns });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN]);
    const body = await req.json();

    const platformContext = await createPlatformQueryContext(req);
    platformContext.tenantScope.hospitalId = user.hospital_id;

    const command = {
      commandId: uuidv4(),
      target: 'notifications.campaigns',
      tenantContext: platformContext.tenantScope,
      payload: body,
    };

    const handler = new NotificationCommandHandler();
    const campaign = await handler.handleCreateCampaign(command as any);

    return NextResponse.json({ success: true, data: campaign });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

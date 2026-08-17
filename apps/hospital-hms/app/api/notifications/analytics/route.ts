import { NotificationQueryHandler } from '@haspataal/notify';
import { NextResponse } from 'next/server';
import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { createPlatformQueryContext } from '@/lib/platform';

export async function GET(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.NURSE]);

    const platformContext = await createPlatformQueryContext(req);
    platformContext.tenantScope.hospitalId = user.hospital_id;
    platformContext.actorScope.actorId = user.user_id;

    const query = {
      ...platformContext,
      filters: {},
    };

    const analytics = await NotificationQueryHandler.getAnalytics(query);

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

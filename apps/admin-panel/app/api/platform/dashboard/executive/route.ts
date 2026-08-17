import { requirePermission, Permission } from '@haspataal/auth';
import { logger } from '@haspataal/logger';
import { PlatformDashboardService } from '@haspataal/platform';

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await requirePermission(Permission.PLATFORM_DASHBOARD_VIEW);

    const dashboardData = await PlatformDashboardService.getExecutiveDashboard();

    return NextResponse.json(dashboardData);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    logger.error({ err: error }, 'Failed to fetch executive dashboard');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

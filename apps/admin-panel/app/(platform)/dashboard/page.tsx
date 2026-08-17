import { requirePermission, Permission } from '@haspataal/auth';

import React from 'react';

import { DashboardClient } from './DashboardClient';

export default async function PlatformDashboard() {
  // Guard the page load with RBAC
  await requirePermission(Permission.PLATFORM_DASHBOARD_VIEW);

  return <DashboardClient />;
}

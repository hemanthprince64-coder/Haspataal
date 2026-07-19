import { getSession } from '@haspataal/auth';

import React from 'react';

export async function PermissionGate({
  resource,
  action,
  children,
  fallback = null,
}: {
  resource: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    return <>{fallback}</>;
  }

  // TODO: Check against PlatformPermission table.
  // For MVP, if PLATFORM_ADMIN allow all
  if (session.user.role === 'PLATFORM_ADMIN') {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

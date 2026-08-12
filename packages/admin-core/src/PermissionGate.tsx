import { verifySession } from '@haspataal/auth';

import React from 'react';

export async function PermissionGate({

  children,
  fallback = null,
}: {
  resource: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const session = await verifySession('session_admin');

  if (!session) {
    return <>{fallback}</>;
  }

  // TODO: Check against PlatformPermission table.
  // For MVP, if PLATFORM_ADMIN allow all
  if ((session.user.role as string) === 'PLATFORM_ADMIN') {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

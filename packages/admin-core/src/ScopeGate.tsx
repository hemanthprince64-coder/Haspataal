import { verifySession } from '@haspataal/auth';

import React from 'react';

import { redirect } from 'next/navigation';

export async function ScopeGate({
  scope,
  children,
}: {
  scope: 'PLATFORM' | 'NETWORK' | 'HOSPITAL';
  children: React.ReactNode;
}) {
  const session = await verifySession('session_admin');

  if (!session) {
    redirect('/login');
  }

  // Assuming role implies scope for now.
  // PLATFORM_ADMIN can access PLATFORM, NETWORK, HOSPITAL
  // NETWORK_ADMIN can access NETWORK, HOSPITAL
  // HOSPITAL_ADMIN can access HOSPITAL
  const userRole = session.user.role as string;
  let hasAccess = false;

  if (scope === 'PLATFORM' && userRole === 'PLATFORM_ADMIN') {
    hasAccess = true;
  } else if (
    scope === 'NETWORK' &&
    (userRole === 'PLATFORM_ADMIN' || userRole === 'NETWORK_ADMIN')
  ) {
    hasAccess = true;
  } else if (
    scope === 'HOSPITAL' &&
    (userRole === 'PLATFORM_ADMIN' ||
      userRole === 'NETWORK_ADMIN' ||
      userRole === 'HOSPITAL_ADMIN' ||
      userRole === 'HOSPITAL_STAFF' ||
      userRole === 'HOSPITAL_DOCTOR')
  ) {
    hasAccess = true;
  }

  if (!hasAccess) {
    redirect('/dashboard'); // Redirect to their default scope
  }

  return <>{children}</>;
}

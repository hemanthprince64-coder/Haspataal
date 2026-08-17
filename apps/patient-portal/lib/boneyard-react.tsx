/* eslint-disable */
'use client';

import type { ReactNode } from 'react';

type SkeletonProps = {
  loading?: boolean;
  children: ReactNode;
  name?: string;
};

export function Skeleton({ loading, children }: SkeletonProps) {
  if (!loading) return <>{children}</>;

  return (
    <div
      aria-hidden="true"
      className="animate-pulse rounded-md bg-slate-100 dark:bg-slate-800"
      style={{ minHeight: 120 }}
    />
  );
}

export function registerBones(_bones: Record<string, unknown>) {
  // Compatibility no-op for generated boneyard registry files.
}

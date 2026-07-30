'use client';

import React from 'react';

import { AuthCard } from './AuthCard/AuthCard';
import { OtpFlow } from './OtpFlow/OtpFlow';
import { ActionResult } from './OtpFlow/useOtpVerification';

export interface OtpVerificationFormProps {
  title: string;
  description: string;
  icon: React.ElementType;
  requestAction: (prevState: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  verifyAction: (prevState: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  bottomLink?: {
    icon: React.ElementType;
    title: string;
    subtitle: string;
    href: string;
  };
}

export function OtpVerificationForm({
  title,
  description,
  icon,
  requestAction,
  verifyAction,
  bottomLink,
}: OtpVerificationFormProps) {
  return (
    <AuthCard title={title} description={description} icon={icon} bottomLink={bottomLink}>
      <OtpFlow requestAction={requestAction} verifyAction={verifyAction} />
    </AuthCard>
  );
}

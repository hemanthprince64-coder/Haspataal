'use client';

import { Stethoscope } from 'lucide-react';

import React, { useState } from 'react';

import { loginDoctorWithOtp, requestDoctorOtp } from '@/app/actions';
import { AuthCard } from '@/components/auth/AuthCard/AuthCard';
import { OtpFlow } from '@/components/auth/OtpFlow/OtpFlow';

export default function DoctorLogin() {
  const [sharedPhone, setSharedPhone] = useState('');

  return (
    <main className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50/50 text-slate-900">
      <AuthCard
        title="Doctor Login"
        description="Access your clinical dashboard and patient records via secure OTP"
        icon={Stethoscope}
        bottomLink={{
          icon: Stethoscope,
          subtitle: 'Not registered yet?',
          title: 'Register as Doctor',
          href: '/doctor/register',
        }}
      >
        <OtpFlow
          requestAction={requestDoctorOtp as any}
          verifyAction={loginDoctorWithOtp as any}
          initialPhone={sharedPhone}
          onPhoneChange={setSharedPhone}
        />
      </AuthCard>
    </main>
  );
}

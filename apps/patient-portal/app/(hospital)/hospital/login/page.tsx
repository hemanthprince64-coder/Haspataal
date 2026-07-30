'use client';

import { Building2 } from 'lucide-react';

import React, { useState } from 'react';

import { loginHospital, loginHospitalWithOtp, requestHospitalOtp } from '@/app/actions';
import { AuthCard } from '@/components/auth/AuthCard/AuthCard';
import { AuthModeToggle, AuthMode } from '@/components/auth/AuthModeToggle';
import { OtpFlow } from '@/components/auth/OtpFlow/OtpFlow';
import { PasswordFlow } from '@/components/auth/PasswordFlow/PasswordFlow';

export default function HospitalLogin() {
  const [mode, setMode] = useState<AuthMode>('password');
  const [sharedPhone, setSharedPhone] = useState('');

  return (
    <main className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50/50 text-slate-900 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <AuthCard
        title="Hospital Login"
        description="Access your hospital administrative dashboard"
        icon={Building2}
        bottomLink={{
          icon: Building2,
          subtitle: 'New hospital?',
          title: 'Register your facility',
          href: '/hospital/register',
        }}
      >
        <AuthModeToggle mode={mode} onModeChange={setMode} />

        {mode === 'password' ? (
          <PasswordFlow
            loginAction={loginHospital as any}
            initialPhone={sharedPhone}
            onPhoneChange={setSharedPhone}
          />
        ) : (
          <OtpFlow
            requestAction={requestHospitalOtp as any}
            verifyAction={loginHospitalWithOtp as any}
            initialPhone={sharedPhone}
            onPhoneChange={setSharedPhone}
          />
        )}
      </AuthCard>
    </main>
  );
}

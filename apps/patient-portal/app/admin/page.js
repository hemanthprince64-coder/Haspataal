'use client';

import { Shield, User } from 'lucide-react';

import { adminLogin } from '@/app/actions';
import { AuthCard } from '@/components/auth/AuthCard/AuthCard';
import { PasswordFlow } from '@/components/auth/PasswordFlow/PasswordFlow';

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <AuthCard title="Admin Portal" description="Haspataal Platform Administration" icon={Shield}>
        <PasswordFlow
          loginAction={adminLogin}
          identifierName="username"
          identifierLabel="Username"
          identifierType="text"
          identifierPlaceholder="Admin username"
          identifierIcon={User}
        />
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
            <p className="text-xs text-blue-600 font-medium">
              💡 Demo: <strong>admin</strong> / <strong>{'<ADMIN_PASSWORD>'}</strong>
            </p>
          </div>
        )}
      </AuthCard>
    </div>
  );
}

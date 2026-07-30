import { Hospital } from 'lucide-react';

import { patientLogin, requestOtpAction } from '@/app/actions';
import { OtpVerificationForm } from '@/components/auth/OtpVerificationForm';

export default function PatientLogin() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50/50 text-slate-900">
      <OtpVerificationForm
        title="Patient Login"
        description="Access your clinical records and book verified appointments."
        icon={Hospital}
        requestAction={requestOtpAction}
        verifyAction={patientLogin}
        bottomLink={{
          icon: Hospital,
          subtitle: 'Medical Partner?',
          title: 'Hospital HMS Access',
          href: '/hospital/login',
        }}
      />
    </main>
  );
}

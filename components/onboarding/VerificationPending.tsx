import React, { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function VerificationPending({ hospitalId }: { hospitalId: string }) {
  const [status, setStatus] = useState<'pending' | 'verified' | 'rejected'>('pending');

  useEffect(() => {
    // Poll the backend for onboarding status
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/hospitals/${hospitalId}/onboarding-status`);
        const data = await res.json();
        
        if (data.status === 'verified') {
          setStatus('verified');
          clearInterval(interval);
          // Redirect to HMS core
          window.location.href = '/hms/dashboard';
        } else if (data.status === 'rejected') {
          setStatus('rejected');
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Failed to poll status', err);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [hospitalId]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg border-0">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            {status === 'verified' ? (
              <ShieldCheck className="w-8 h-8 text-green-600" />
            ) : (
              <Clock className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === 'verified' ? 'Verification Complete' : 'Verification in Progress'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'pending' && (
            <div className="space-y-4">
              <p className="text-slate-600 text-sm">
                Your hospital profile and documents are currently being reviewed by the Haspataal Trust & Safety team.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-blue-600 bg-blue-50 py-3 rounded-lg border border-blue-100">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Polling for updates...</span>
              </div>
              <p className="text-xs text-slate-500 mt-6">
                HMS Access is blocked until verification is confirmed. You will be automatically redirected.
              </p>
            </div>
          )}
          {status === 'verified' && (
            <p className="text-green-600 text-sm font-medium">
              Redirecting to your new Hospital Management System...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

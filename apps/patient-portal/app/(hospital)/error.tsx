/* eslint-disable */
'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

export default function HospitalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Hospital Module Error:', error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="rounded-full bg-red-100 p-6 mb-6 shadow-sm">
        <AlertTriangle className="h-12 w-12 text-red-600" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-slate-900 tracking-tight">
        Something went wrong
      </h2>
      <p className="mb-8 max-w-md text-slate-500">
        An unexpected error occurred in the hospital module. Please try again or contact support if
        the issue persists.
      </p>
      <div className="flex gap-4">
        <Button
          onClick={() => reset()}
          className="bg-teal-600 hover:bg-teal-700 text-white min-w-[120px]"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        <Button
          variant="outline"
          onClick={() => (window.location.href = '/hospital')}
          className="min-w-[120px]"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import { getPatientFullProfile } from '@/app/actions';
import { MaternalHealthAnalytics, PatientProfile } from '@/components/anc/MaternalHealthAnalytics';

export default function TrackerPage() {
  const [patient, setPatient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getPatientFullProfile()
      .then((data) => {
        setPatient(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <main className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-48 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-96 w-full bg-slate-100 rounded-[2.5rem] animate-pulse" />
        </div>
      </main>
    );
  }

  if (error || !patient) {
    return (
      <main className="container mx-auto px-6 py-12">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <p className="font-semibold text-rose-700">Unable to load pregnancy tracker.</p>
          <p className="text-sm text-rose-600">
            {error ? error.message : 'Please sign in again or contact support if this continues.'}
          </p>
        </div>
      </main>
    );
  }

  const profile: PatientProfile = {
    id: patient.id,
    gestationalAge: patient.pregnancyProfile?.gestationalAge ?? null,
    edd: patient.pregnancyProfile?.edd ?? null,
    highRisk: patient.pregnancyProfile?.highRisk ?? false,
    highRiskReasons: patient.pregnancyProfile?.highRiskReasons ?? [],
    schemeEnrolled: patient.pregnancyProfile?.schemeEnrolled ?? [],
    ashaWorkerId: patient.pregnancyProfile?.ashaWorkerId ?? null,
    visits: patient.pregnancyProfile?.visits ?? [],
    supplements: patient.pregnancyProfile?.supplements ?? [],
  };

  return (
    <main className="container mx-auto px-6 py-10">
      <MaternalHealthAnalytics profile={profile} patientId={patient.id} />
    </main>
  );
}

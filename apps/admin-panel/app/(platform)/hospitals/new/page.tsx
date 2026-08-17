import { Button } from '@haspataal/ui/button';
import React from 'react';
import Link from 'next/link';

export default function NewHospitalPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Onboard Hospital</h1>
        <p className="text-muted-foreground">
          Register a new healthcare facility or invite an organization to join Haspataal.
        </p>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow p-6 space-y-4">
        <p className="text-sm text-slate-600">
          Hospitals can register directly via the self-service onboarding portal at <code className="bg-slate-100 px-1 py-0.5 rounded">/register</code> or through Platform Admin invitations.
        </p>

        <div className="flex gap-3 pt-4">
          <Button asChild>
            <Link href="/hospitals">Back to Hospitals</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

import { Button } from '@haspataal/ui/button';
import React from 'react';
import Link from 'next/link';

export default function NewNetworkPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Hospital Network</h1>
        <p className="text-muted-foreground">
          Group multiple hospital branches and clinical centers under a unified network.
        </p>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow p-6 space-y-4">
        <p className="text-sm text-slate-600">
          Hospital networks allow shared governance, consolidated reporting, and cross-facility care team management.
        </p>

        <div className="flex gap-3 pt-4">
          <Button asChild>
            <Link href="/networks">Back to Networks</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

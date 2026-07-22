import { prisma } from '@haspataal/db';
import { Button } from '@haspataal/ui/button';

import React from 'react';

import { notFound } from 'next/navigation';

export default async function NetworkDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const network = await prisma.network.findUnique({
    where: { id: (await params).id },
    include: {
      hospitals: {
        include: { hospital: true },
      },
    },
  });

  if (!network) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{network.name}</h1>
          <p className="text-muted-foreground">Type: Organization</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Add Hospital</Button>
          <Button>Network Settings</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
            <h3 className="font-semibold text-lg mb-4">Hospitals in Network</h3>
            <div className="space-y-4">
              {network.hospitals.map((membership) => (
                <div
                  key={membership.id}
                  className="flex justify-between items-center p-3 border rounded"
                >
                  <div>
                    <div className="font-medium">{membership.hospital.legalName}</div>
                    <div className="text-xs text-muted-foreground">
                      Joined {membership.joinedAt.toLocaleDateString()}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Remove
                  </Button>
                </div>
              ))}
              {network.hospitals.length === 0 && (
                <p className="text-muted-foreground text-sm">No hospitals assigned yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
            <h3 className="font-semibold text-lg mb-4">Shared Resources</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border rounded">
                <span className="font-medium text-sm">Shared Doctors</span>
                <span className="text-xs font-bold text-emerald-600">ENABLED</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded">
                <span className="font-medium text-sm">Cross-site Analytics</span>
                <span className="text-xs font-bold text-emerald-600">ENABLED</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded bg-slate-50">
                <span className="font-medium text-sm text-slate-500">Shared Billing</span>
                <span className="text-xs font-bold text-slate-400">DISABLED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

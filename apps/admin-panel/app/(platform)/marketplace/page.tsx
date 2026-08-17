import { prisma } from '@haspataal/db';
import { Button } from '@haspataal/ui/button';

import React from 'react';

export default async function MarketplacePage() {
  const capabilities = await prisma.capabilityRegistry.findMany({
    orderBy: { category: 'asc' },
  });

  // Group capabilities by category
  const suites: Record<string, typeof capabilities> = {};
  capabilities.forEach((cap) => {
    if (!suites[cap.category]) suites[cap.category] = [];
    suites[cap.category].push(cap);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Capability Marketplace</h1>
          <p className="text-muted-foreground">
            Manage integration suites and platform features across the network.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Analytics</Button>
          <Button>Register Capability</Button>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(suites).map(([category, caps]) => (
          <div key={category} className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">{category} Suite</h2>
            <div className="grid grid-cols-3 gap-6">
              {caps.map((cap) => (
                <div key={cap.id} className="border bg-card shadow rounded-xl p-6 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="font-bold text-lg">{cap.name}</div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cap.visibility === 'PUBLIC'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {cap.visibility}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground flex-1 mb-6">{cap.description}</p>
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-4 font-mono border-t pt-4">
                    <span>Key: {cap.key}</span>
                    <span>v{cap.version}</span>
                  </div>
                  <Button variant={cap.defaultEnabled ? 'outline' : 'default'} className="w-full">
                    {cap.defaultEnabled ? 'Manage Settings' : 'Enable Globally'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
        {capabilities.length === 0 && (
          <div className="rounded-xl border bg-card text-card-foreground shadow p-12 text-center text-muted-foreground">
            No capabilities registered yet. Run the Capability seed script.
          </div>
        )}
      </div>
    </div>
  );
}

import { prisma } from '@haspataal/db';
import { Button } from '@haspataal/ui/button';

import React from 'react';

import Link from 'next/link';

export default async function NetworksPage() {
  const networks = await prisma.network.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { hospitals: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Networks</h1>
          <p className="text-muted-foreground">
            Manage multi-hospital chains, parent organizations, and regions.
          </p>
        </div>
        <Button asChild>
          <Link href="/networks/new">Create Network</Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
        <div className="space-y-4">
          <table className="w-full text-sm text-left">
            <thead className="border-b bg-gray-50/50">
              <tr>
                <th className="py-3 px-4 font-medium">Network Name</th>
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Hospitals</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {networks.map((network) => (
                <tr key={network.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{network.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      Organization
                    </span>
                  </td>
                  <td className="py-3 px-4">{network._count.hospitals}</td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/networks/${network.id}`}>Manage</Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {networks.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-muted-foreground">
                    No networks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

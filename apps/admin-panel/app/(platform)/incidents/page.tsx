import { prisma } from '@haspataal/db';
import { Button } from '@haspataal/ui/button';

import React from 'react';

export default async function IncidentManagementPage() {
  const incidents = await prisma.incident.findMany({
    orderBy: { detectedAt: 'desc' },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incident Management</h1>
          <p className="text-muted-foreground">Platform-level incident response tracking.</p>
        </div>
        <Button variant="destructive">Declare Incident</Button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
        <table className="w-full text-sm text-left">
          <thead className="border-b bg-gray-50/50">
            <tr>
              <th className="py-3 px-4 font-medium">Incident</th>
              <th className="py-3 px-4 font-medium">Severity</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Component</th>
              <th className="py-3 px-4 font-medium">Detected</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{incident.title}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      incident.severity === 'CRITICAL'
                        ? 'bg-red-100 text-red-800'
                        : incident.severity === 'HIGH'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {incident.severity}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                    {incident.status}
                  </span>
                </td>
                <td className="py-3 px-4">{incident.component}</td>
                <td className="py-3 px-4">{incident.detectedAt.toLocaleString()}</td>
                <td className="py-3 px-4 text-right">
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </td>
              </tr>
            ))}
            {incidents.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-muted-foreground">
                  No active incidents. Systems operating normally.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

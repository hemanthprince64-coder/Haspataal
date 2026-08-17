import { prisma } from '@haspataal/db';

import React from 'react';

export default async function AuditExplorerPage() {
  const audits = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Explorer</h1>
          <p className="text-muted-foreground">Global search across all platform audit events.</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
        <div className="flex space-x-4 mb-6">
          <input
            type="text"
            placeholder="Search actor, hospital, workflow, or event..."
            className="flex-1 px-4 py-2 border rounded-md"
          />
          <button className="px-4 py-2 bg-slate-800 text-white rounded-md">Search</button>
        </div>

        <table className="w-full text-sm text-left">
          <thead className="border-b bg-gray-50/50">
            <tr>
              <th className="py-3 px-4 font-medium">Timestamp</th>
              <th className="py-3 px-4 font-medium">Action</th>
              <th className="py-3 px-4 font-medium">Entity</th>
              <th className="py-3 px-4 font-medium">Actor</th>
              <th className="py-3 px-4 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {audits.map((audit) => (
              <tr key={audit.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3 px-4">{audit.createdAt.toLocaleString()}</td>
                <td className="py-3 px-4 font-medium">{audit.action}</td>
                <td className="py-3 px-4 text-xs font-mono">
                  {audit.entity}: {audit.entityId}
                </td>
                <td className="py-3 px-4 text-xs font-mono text-indigo-600">{audit.userId}</td>
                <td className="py-3 px-4 text-xs text-muted-foreground truncate max-w-[200px]">
                  {JSON.stringify(audit.details)}
                </td>
              </tr>
            ))}
            {audits.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-muted-foreground">
                  No audit logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

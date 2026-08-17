import { prisma } from '@haspataal/db';
import { Button } from '@haspataal/ui/button';

import React from 'react';

export default async function OrchestrationInstances() {
  const metrics = await prisma.workflowMetric.findMany({
    orderBy: { startedAt: 'desc' },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflow Instances</h1>
          <p className="text-muted-foreground">Search and inspect specific workflow executions.</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
        <table className="w-full text-sm text-left">
          <thead className="border-b bg-gray-50/50">
            <tr>
              <th className="py-3 px-4 font-medium">Instance ID</th>
              <th className="py-3 px-4 font-medium">Workflow</th>
              <th className="py-3 px-4 font-medium">Entity Type</th>
              <th className="py-3 px-4 font-medium">Started At</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3 px-4 font-mono text-xs text-indigo-600">
                  {metric.instanceId.slice(0, 12)}...
                </td>
                <td className="py-3 px-4 font-medium">{metric.workflowId}</td>
                <td className="py-3 px-4">{metric.entityType}</td>
                <td className="py-3 px-4">{metric.startedAt.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      metric.finalStatus === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {metric.finalStatus}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button variant="outline" size="sm">
                    Inspect
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

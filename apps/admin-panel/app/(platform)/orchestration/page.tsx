import { prisma } from '@haspataal/db';
import { Button } from '@haspataal/ui/button';

import React from 'react';

import Link from 'next/link';

export default async function OrchestrationDashboard() {
  const recentMetrics = await prisma.workflowMetric.findMany({
    orderBy: { completedAt: 'desc' },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflow Console</h1>
          <p className="text-muted-foreground">Platform orchestration visibility and control.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href="/orchestration/definitions">Definitions</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/orchestration/queue">Queue</Link>
          </Button>
          <Button asChild>
            <Link href="/orchestration/instances">All Instances</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="border bg-card shadow rounded-xl p-4">
          <div className="text-sm font-medium text-muted-foreground">Running</div>
          <div className="text-2xl font-bold mt-1 text-blue-600">42</div>
        </div>
        <div className="border bg-card shadow rounded-xl p-4">
          <div className="text-sm font-medium text-muted-foreground">Waiting (Manual)</div>
          <div className="text-2xl font-bold mt-1 text-amber-600">12</div>
        </div>
        <div className="border bg-card shadow rounded-xl p-4">
          <div className="text-sm font-medium text-muted-foreground">Failed (Retry)</div>
          <div className="text-2xl font-bold mt-1 text-rose-600">3</div>
        </div>
        <div className="border bg-card shadow rounded-xl p-4">
          <div className="text-sm font-medium text-muted-foreground">Dead Letter</div>
          <div className="text-2xl font-bold mt-1 text-slate-800">1</div>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
        <h3 className="font-semibold text-lg mb-4">Recent Workflow Activity</h3>
        <table className="w-full text-sm text-left">
          <thead className="border-b bg-gray-50/50">
            <tr>
              <th className="py-3 px-4 font-medium">Workflow</th>
              <th className="py-3 px-4 font-medium">Entity</th>
              <th className="py-3 px-4 font-medium">Duration (ms)</th>
              <th className="py-3 px-4 font-medium">Wait Time (ms)</th>
              <th className="py-3 px-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentMetrics.map((metric) => (
              <tr key={metric.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{metric.workflowId}</td>
                <td className="py-3 px-4 text-xs font-mono">{metric.entityId.slice(0, 8)}...</td>
                <td className="py-3 px-4">{metric.durationMs}</td>
                <td className="py-3 px-4 text-muted-foreground">{metric.waitTimeMs}</td>
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
              </tr>
            ))}
            {recentMetrics.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-muted-foreground">
                  No recent orchestration activity.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

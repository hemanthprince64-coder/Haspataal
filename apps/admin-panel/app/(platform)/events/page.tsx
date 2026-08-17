import { prisma } from '@haspataal/db';
import { Button } from '@haspataal/ui/button';

import React from 'react';

export default async function EventBusPage() {
  // Pulling from the timeline events to simulate Event Bus logs
  const events = await prisma.platformTimelineEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Bus Console</h1>
          <p className="text-muted-foreground">
            Live event streams, graph tracing, and DLQ management.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">DLQ Manager</Button>
          <Button>Replay Events</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 border bg-card shadow rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-4">Event Health</h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Throughput (1h)</div>
              <div className="text-2xl font-bold">14,204</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">DLQ Size</div>
              <div className="text-2xl font-bold text-amber-600">3</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Consumer Lag</div>
              <div className="text-2xl font-bold text-emerald-600">12ms</div>
            </div>
          </div>
        </div>

        <div className="col-span-3 border bg-card shadow rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-4">Live Event Stream</h3>
          <div className="overflow-hidden rounded-md border border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="py-2 px-3 font-medium">Timestamp</th>
                  <th className="py-2 px-3 font-medium">Event Type</th>
                  <th className="py-2 px-3 font-medium">Entity</th>
                  <th className="py-2 px-3 font-medium">Trace ID</th>
                </tr>
              </thead>
              <tbody className="divide-y font-mono text-xs">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-500">{event.createdAt.toISOString()}</td>
                    <td className="py-2 px-3 font-bold text-indigo-700">{event.eventType}</td>
                    <td className="py-2 px-3">
                      {event.entityType}:{event.entityId}
                    </td>
                    <td className="py-2 px-3 text-slate-400">{event.correlationId || 'none'}</td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No recent events.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

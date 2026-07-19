import React from 'react';

export default function QueueMonitorPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Queue Monitor</h1>
      <p className="text-muted-foreground">Visibility into BullMQ background jobs and events.</p>

      <div className="grid grid-cols-5 gap-4">
        <div className="border bg-card shadow rounded-xl p-4">
          <div className="text-sm font-medium text-muted-foreground">Workers</div>
          <div className="text-2xl font-bold mt-1 text-emerald-600">8</div>
        </div>
        <div className="border bg-card shadow rounded-xl p-4">
          <div className="text-sm font-medium text-muted-foreground">Active</div>
          <div className="text-2xl font-bold mt-1 text-blue-600">120</div>
        </div>
        <div className="border bg-card shadow rounded-xl p-4">
          <div className="text-sm font-medium text-muted-foreground">Delayed</div>
          <div className="text-2xl font-bold mt-1 text-slate-600">45</div>
        </div>
        <div className="border bg-card shadow rounded-xl p-4">
          <div className="text-sm font-medium text-muted-foreground">Retry</div>
          <div className="text-2xl font-bold mt-1 text-amber-600">3</div>
        </div>
        <div className="border bg-card shadow rounded-xl p-4">
          <div className="text-sm font-medium text-muted-foreground">Failed</div>
          <div className="text-2xl font-bold mt-1 text-rose-600">1</div>
        </div>
      </div>

      <div className="p-6 border rounded-xl shadow bg-card text-card-foreground">
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          [Placeholder for BullMQ job list]
        </div>
      </div>
    </div>
  );
}

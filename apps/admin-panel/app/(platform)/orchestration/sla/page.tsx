import React from 'react';

export default function SlaMonitorPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">SLA Monitor</h1>
      <p className="text-muted-foreground">
        Track average times, percentiles, breaches, and stuck instances.
      </p>

      <div className="grid grid-cols-4 gap-4">
        <div className="border bg-card shadow rounded-xl p-4">
          <div className="text-sm font-medium text-muted-foreground">Average Time</div>
          <div className="text-2xl font-bold mt-1">2.4h</div>
        </div>
        <div className="border bg-card shadow rounded-xl p-4">
          <div className="text-sm font-medium text-muted-foreground">95th Percentile</div>
          <div className="text-2xl font-bold mt-1">12.1h</div>
        </div>
        <div className="border bg-card shadow rounded-xl p-4">
          <div className="text-sm font-medium text-muted-foreground">Breached</div>
          <div className="text-2xl font-bold mt-1 text-rose-600">8</div>
        </div>
        <div className="border bg-card shadow rounded-xl p-4">
          <div className="text-sm font-medium text-muted-foreground">Stuck</div>
          <div className="text-2xl font-bold mt-1 text-amber-600">3</div>
        </div>
      </div>

      <div className="p-6 border rounded-xl shadow bg-card text-card-foreground">
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          [Placeholder for SLA Charts]
        </div>
      </div>
    </div>
  );
}

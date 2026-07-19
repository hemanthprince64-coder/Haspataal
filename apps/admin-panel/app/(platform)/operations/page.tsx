import React from 'react';

export default function OperationsCenterPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Operations Center</h1>
      <p className="text-muted-foreground">Four-quadrant perspective on platform health.</p>

      <div className="grid grid-cols-2 gap-6">
        {/* Quadrant 1: Infrastructure */}
        <div className="border bg-card shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Infrastructure</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Redis</div>
              <div className="text-lg font-bold text-emerald-600">Healthy (2ms)</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Postgres</div>
              <div className="text-lg font-bold text-emerald-600">Healthy (14ms)</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">CPU Usage</div>
              <div className="text-lg font-bold text-amber-600">78%</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Workers</div>
              <div className="text-lg font-bold text-emerald-600">12 / 12</div>
            </div>
          </div>
        </div>

        {/* Quadrant 2: Platform */}
        <div className="border bg-card shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Platform</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Active Hospitals</div>
              <div className="text-lg font-bold">142</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Active Sessions</div>
              <div className="text-lg font-bold">4,203</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Integrations</div>
              <div className="text-lg font-bold text-amber-600">3 Degraded</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Subscriptions</div>
              <div className="text-lg font-bold text-emerald-600">92% Active</div>
            </div>
          </div>
        </div>

        {/* Quadrant 3: Business */}
        <div className="border bg-card shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Business</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Appointments Today</div>
              <div className="text-lg font-bold">12,450</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Claims Processed</div>
              <div className="text-lg font-bold">3,892</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Revenue (24h)</div>
              <div className="text-lg font-bold text-emerald-600">₹4.2M</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">ABDM Hits</div>
              <div className="text-lg font-bold">8,201</div>
            </div>
          </div>
        </div>

        {/* Quadrant 4: AI */}
        <div className="border bg-card shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">AI Analytics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">LLM Requests</div>
              <div className="text-lg font-bold">84,200</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Avg Latency</div>
              <div className="text-lg font-bold text-emerald-600">850ms</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Hallucination Alerts</div>
              <div className="text-lg font-bold text-rose-600">12</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Est. Cost (24h)</div>
              <div className="text-lg font-bold">$142.50</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

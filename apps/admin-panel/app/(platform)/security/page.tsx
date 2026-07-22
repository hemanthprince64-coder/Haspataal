/* eslint-disable */
import { Button } from '@haspataal/ui/button';

import React from 'react';

export default function SecurityCenterPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Center</h1>
          <p className="text-muted-foreground">
            Platform security posture, threat timelines, and RBAC.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 border bg-card shadow rounded-xl p-6 flex flex-col items-center justify-center">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Platform Security Score
          </div>
          <div className="text-5xl font-bold text-emerald-600">
            92<span className="text-2xl text-slate-400">/100</span>
          </div>
        </div>

        <div className="col-span-3 border bg-card shadow rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-4">Threat Timeline</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-24 text-sm text-muted-foreground">10:42 AM</div>
              <div className="flex-1 bg-rose-50 text-rose-800 p-3 rounded text-sm font-mono">
                Failed Login (Admin Console) - IP 192.168.1.42
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-24 text-sm text-muted-foreground">10:43 AM</div>
              <div className="flex-1 bg-amber-50 text-amber-800 p-3 rounded text-sm font-mono">
                Rate Limit Exceeded (Admin API) - IP 192.168.1.42
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-24 text-sm text-muted-foreground">10:44 AM</div>
              <div className="flex-1 bg-slate-100 text-slate-800 p-3 rounded text-sm font-mono">
                Blocked IP (WAF Rule 442) - IP 192.168.1.42
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-24 text-sm text-muted-foreground">11:15 AM</div>
              <div className="flex-1 bg-emerald-50 text-emerald-800 p-3 rounded text-sm font-mono">
                Recovered (Manual Intervention)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

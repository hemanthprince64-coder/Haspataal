/* eslint-disable */
import { KpiCard, PermissionGate } from '@haspataal/admin-core';
import { Activity, Building2, ServerCrash, Users } from 'lucide-react';

import React from 'react';

export default function PlatformDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
        <p className="text-muted-foreground">
          Platform-wide overview of Haspataal network operations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Hospitals"
          value="1,248"
          icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 12, isUpward: true }}
        />
        <KpiCard
          title="Active Subscriptions"
          value="1,102"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 8, isUpward: true }}
        />
        <KpiCard
          title="Platform Users"
          value="45,231"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 15, isUpward: true }}
        />
        <KpiCard
          title="Active Incidents"
          value="3"
          icon={<ServerCrash className="h-4 w-4 text-muted-foreground" />}
          description="2 workers degraded, 1 webhook failing"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="font-semibold leading-none tracking-tight">Live Activity Feed</div>
          </div>
          <div className="p-6 pt-0">
            {/* Live SSE stream placeholder */}
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">hospital_created</p>
                  <p className="text-sm text-muted-foreground">Apollo Hospitals, Bangalore</p>
                </div>
                <div className="ml-auto font-medium text-xs text-muted-foreground">Just now</div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">invoice_paid</p>
                  <p className="text-sm text-muted-foreground">Aster Medcity, Kochi</p>
                </div>
                <div className="ml-auto font-medium text-xs text-muted-foreground">2m ago</div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">webhook_delivery_failed</p>
                  <p className="text-sm text-muted-foreground">ABDM Gateway Proxy</p>
                </div>
                <div className="ml-auto font-medium text-xs text-muted-foreground text-rose-500">
                  5m ago
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="font-semibold leading-none tracking-tight">System Health</div>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Event Bus (Redis)</span>
                <span className="text-emerald-500 text-sm">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Outbox Relay Worker</span>
                <span className="text-emerald-500 text-sm">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Rules Worker</span>
                <span className="text-emerald-500 text-sm">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Postgres Primary</span>
                <span className="text-emerald-500 text-sm">Healthy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

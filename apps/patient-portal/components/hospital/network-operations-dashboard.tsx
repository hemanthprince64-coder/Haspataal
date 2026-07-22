/* eslint-disable */
'use client';

import {
  Network,
  Activity,
  Server,
  Database,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react';

import React from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function NetworkOperationsDashboard() {
  const sites = [
    {
      id: 'S1',
      name: 'Muzaffarpur Pilot',
      status: 'ONLINE',
      uptime: '99.99%',
      mttr: '2m',
      pendingSyncs: 0,
      revenue: '₹1.2L',
      activeUsers: 45,
    },
    {
      id: 'S2',
      name: 'Urban Specialty',
      status: 'ONLINE',
      uptime: '99.95%',
      mttr: '8m',
      pendingSyncs: 0,
      revenue: '₹4.5L',
      activeUsers: 120,
    },
    {
      id: 'S3',
      name: 'Rural Polyclinic',
      status: 'OFFLINE_SYNCING',
      uptime: '94.20%',
      mttr: '4m',
      pendingSyncs: 42,
      revenue: '₹0.3L',
      activeUsers: 8,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Network className="w-6 h-6 text-indigo-600" />
          Network Operations Center (NOC)
        </h2>
        <div className="flex gap-4">
          <span className="flex items-center gap-2 text-sm font-medium">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Platform Healthy
          </span>
        </div>
      </div>

      {/* Aggregate KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Global Uptime</p>
                <p className="text-2xl font-bold">99.98%</p>
              </div>
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Avg MTTR</p>
                <p className="text-2xl font-bold">4.6m</p>
              </div>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Offline Queues</p>
                <p className="text-2xl font-bold text-amber-600">42</p>
              </div>
              <Server className="w-4 h-4 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Isolation Breaches</p>
                <p className="text-2xl font-bold text-emerald-600">0</p>
              </div>
              <ShieldAlert className="w-4 h-4 text-slate-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Site Telemetry */}
      <Card>
        <CardHeader>
          <CardTitle>Site Telemetry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sites.map((site) => (
              <div
                key={site.id}
                className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-4 w-1/3">
                  <div
                    className={`w-3 h-3 rounded-full ${site.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}
                  />
                  <div>
                    <p className="font-medium text-slate-900">{site.name}</p>
                    <p className="text-xs text-slate-500">{site.status}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-8 w-2/3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Uptime</p>
                    <p className="font-mono text-sm">{site.uptime}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">MTTR</p>
                    <p className="font-mono text-sm">{site.mttr}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Pending Syncs</p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-sm ${site.pendingSyncs > 0 ? 'text-amber-600 font-bold' : ''}`}
                      >
                        {site.pendingSyncs}
                      </span>
                      {site.pendingSyncs > 0 && (
                        <Database className="w-3 h-3 text-amber-500 animate-spin-slow" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Active Users</p>
                    <p className="font-mono text-sm">{site.activeUsers}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

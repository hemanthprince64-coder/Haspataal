'use client';

import { KpiCard } from '@haspataal/admin-core';
import { ExecutiveDashboardData, RecentHospital } from '@haspataal/platform';
import {
  Activity,
  Building2,
  Users,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
} from 'lucide-react';
import useSWR from 'swr';

import React from 'react';

import Link from 'next/link';

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  });

export function DashboardClient() {
  const { data, error, isLoading } = useSWR<ExecutiveDashboardData>(
    '/api/platform/dashboard/executive',
    fetcher,
    { refreshInterval: 15000 },
  );

  if (error) {
    return (
      <div className="p-6 text-center text-rose-500 bg-rose-50 rounded-lg">
        <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
        <p>Failed to load dashboard data. Please try again later.</p>
      </div>
    );
  }

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  const { kpis, recentHospitals, systemHealth, metadata } = data.dashboard;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-muted-foreground">
            Platform-wide overview of Haspataal network operations.
          </p>
        </div>
        <div className="text-xs text-muted-foreground text-right">
          <p>Last updated: {new Date(metadata.generatedAt).toLocaleTimeString()}</p>
          <p>Version: {metadata.version}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Hospitals"
          value={kpis.totalHospitals.toLocaleString()}
          icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Active Hospitals"
          value={kpis.activeHospitals.toLocaleString()}
          icon={<Activity className="h-4 w-4 text-emerald-500" />}
        />
        <KpiCard
          title="Pending Approval"
          value={kpis.pendingHospitals.toLocaleString()}
          icon={<Clock className="h-4 w-4 text-amber-500" />}
        />
        <KpiCard
          title="Platform Users"
          value={kpis.platformUsers.toLocaleString()}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="font-semibold leading-none tracking-tight">Recent Registrations</div>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-4">
              <table className="w-full text-sm text-left">
                <thead className="border-b bg-gray-50/50">
                  <tr>
                    <th className="py-2 px-3 font-medium">Name</th>
                    <th className="py-2 px-3 font-medium">Location</th>
                    <th className="py-2 px-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentHospitals.length > 0 ? (
                    recentHospitals.map((hospital: RecentHospital) => (
                      <tr key={hospital.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 px-3 font-medium text-blue-600">
                          <Link href={`/hospitals/${hospital.id}`}>{hospital.legalName}</Link>
                        </td>
                        <td className="py-3 px-3">
                          {hospital.city && hospital.state
                            ? `${hospital.city}, ${hospital.state}`
                            : 'N/A'}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              hospital.onboardingState === 'LIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : hospital.onboardingState === 'SUSPENDED'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {hospital.onboardingState}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-muted-foreground">
                        No recent hospitals found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow flex flex-col">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="font-semibold leading-none tracking-tight">System Health</div>
            {systemHealth?.status === 'HEALTHY' ? (
              <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" /> Healthy
              </span>
            ) : systemHealth?.status === 'DEGRADED' ? (
              <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" /> Degraded
              </span>
            ) : (
              <span className="px-2 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-medium flex items-center">
                <XCircle className="w-3 h-3 mr-1" /> Down
              </span>
            )}
          </div>
          <div className="p-6 pt-0 flex-1">
            <div className="space-y-4 mt-4">
              {systemHealth?.components.map((comp, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{comp.name}</span>
                  <span
                    className={`text-sm font-medium ${comp.status === 'connected' ? 'text-emerald-500' : 'text-rose-500'}`}
                  >
                    {comp.status === 'connected' ? 'Healthy' : 'Disconnected'}
                  </span>
                </div>
              ))}
              {/* Dummy data for remaining components to show MVP intent */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Event Bus (Redis)</span>
                <span className="text-emerald-500 text-sm font-medium">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">SMS Provider</span>
                <span className="text-emerald-500 text-sm font-medium">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Rules Worker</span>
                <span className="text-emerald-500 text-sm font-medium">Healthy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-64 bg-slate-200 rounded mb-2"></div>
        <div className="h-4 w-96 bg-slate-200 rounded"></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-6 h-[120px]">
            <div className="h-4 w-24 bg-slate-200 rounded mb-4"></div>
            <div className="h-8 w-16 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-card p-6 h-[400px]">
          <div className="h-6 w-48 bg-slate-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-4 w-32 bg-slate-200 rounded"></div>
                <div className="h-4 w-24 bg-slate-200 rounded"></div>
                <div className="h-4 w-16 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-3 rounded-xl border bg-card p-6 h-[400px]">
          <div className="h-6 w-32 bg-slate-200 rounded mb-6"></div>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-24 bg-slate-200 rounded"></div>
                <div className="h-4 w-16 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

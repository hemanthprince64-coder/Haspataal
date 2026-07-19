import { prisma } from '@haspataal/db';
import { Button } from '@haspataal/ui/button';

import React from 'react';

import { notFound } from 'next/navigation';

export default async function Hospital360Page({ params }: { params: { id: string } }) {
  const hospitalId = params.id;
  const hospital = await prisma.hospitalsMaster.findUnique({
    where: { id: hospitalId },
  });

  if (!hospital) {
    notFound();
  }

  const tabs = [
    'Overview',
    'Timeline',
    'Verification',
    'Automation',
    'Risks',
    'Configuration',
    'Departments',
    'Doctors',
    'Billing',
    'Subscription',
    'Integrations',
    'Feature Flags',
    'Audit',
    'Security',
    'Performance',
    'Analytics',
    'Storage',
    'Support',
    'Activity',
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{hospital.legalName}</h1>
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-sm text-muted-foreground">
              {hospital.city}, {hospital.state}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-bold ${
                hospital.onboardingState === 'LIVE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : hospital.onboardingState === 'SUSPENDED'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-blue-100 text-blue-800'
              }`}
            >
              {hospital.onboardingState}
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
              {hospital.operationalStatus}
            </span>
            {hospital.healthScore && (
              <span className="text-sm font-medium">Health: {hospital.healthScore}/100</span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Suspend</Button>
          <Button>Advance Workflow</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab, idx) => (
            <a
              key={tab}
              href={`#${tab.toLowerCase().replace(' ', '-')}`}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                idx === 0
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </a>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
            <h3 className="font-semibold text-lg mb-4">Timeline</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {/* Timeline nodes (dummy data for visual) */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-emerald-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  ✓
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white shadow">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-slate-900">Hospital Created</div>
                    <time className="text-xs font-medium text-indigo-500">Just now</time>
                  </div>
                  <div className="text-slate-500 text-sm">Action by Platform Admin</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
            <h3 className="font-semibold text-lg mb-4">Verification Engine</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border rounded bg-emerald-50">
                <span className="font-medium text-sm">Identity</span>
                <span className="text-xs text-emerald-700 font-bold">VERIFIED</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded">
                <span className="font-medium text-sm">License</span>
                <span className="text-xs text-muted-foreground font-bold">PENDING</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded">
                <span className="font-medium text-sm">ABDM</span>
                <span className="text-xs text-muted-foreground font-bold">PENDING</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded">
                <span className="font-medium text-sm">Tax</span>
                <span className="text-xs text-muted-foreground font-bold">PENDING</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

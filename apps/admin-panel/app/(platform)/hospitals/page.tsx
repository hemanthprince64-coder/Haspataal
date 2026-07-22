
import { prisma } from '@haspataal/db';
import { Button } from '@haspataal/ui/button';

import React from 'react';

import Link from 'next/link';

export default async function HospitalsPage() {
  const hospitals = await prisma.hospitalsMaster.findMany({
    select: {
      id: true,
      legalName: true,
      city: true,
      state: true,
      onboardingState: true,
      operationalStatus: true,
      healthScore: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hospitals</h1>
          <p className="text-muted-foreground">Manage hospital onboarding and lifecycle.</p>
        </div>
        <Button asChild>
          <Link href="/hospitals/new">Add Hospital</Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
        <div className="space-y-4">
          {/* Temporary native table. In reality, use DataTable component */}
          <table className="w-full text-sm text-left">
            <thead className="border-b bg-gray-50/50">
              <tr>
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4 font-medium">Location</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Health</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map((hospital) => (
                <tr key={hospital.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{hospital.legalName}</td>
                  <td className="py-3 px-4">
                    {hospital.city}, {hospital.state}
                  </td>
                  <td className="py-3 px-4">
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
                  <td className="py-3 px-4">
                    {hospital.healthScore ? `${hospital.healthScore}/100` : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/hospitals/${hospital.id}`}>View 360</Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {hospitals.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    No hospitals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

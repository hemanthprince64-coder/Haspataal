/* eslint-disable */
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, Clock, UserCheck } from 'lucide-react';

import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { requireHospitalAccess } from '@/lib/auth/hospital-access';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Unresolved Emergencies',
};

export default async function UnresolvedEmergenciesPage() {
  const access = await requireHospitalAccess('reception', 'read');

  const emergencies = await prisma.patient.findMany({
    where: {
      hospitalId: access.hospitalId,
      name: 'Unknown Emergency',
    },
    orderBy: { createdAt: 'asc' }, // Oldest first
    include: {
      appointments: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Unresolved Emergencies</h1>
        <p className="text-slate-500">
          Emergency patients that have not yet had their demographics reconciled. These must be
          updated before final billing or discharge.
        </p>
      </div>

      {emergencies.length === 0 ? (
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="flex flex-col items-center justify-center py-12 text-emerald-800">
            <CheckCircleIcon className="w-12 h-12 mb-4 text-emerald-500" />
            <h3 className="text-lg font-medium">All clear!</h3>
            <p className="text-sm">No unresolved emergency records found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {emergencies.map((patient) => {
            const isCritical =
              Date.now() - new Date(patient.createdAt).getTime() > 24 * 60 * 60 * 1000;

            return (
              <Card
                key={patient.id}
                className={isCritical ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2 rounded-full ${isCritical ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}
                    >
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        {patient.uhid}
                        {isCritical && <Badge variant="destructive">SLA Breach (&gt;24h)</Badge>}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Admitted {formatDistanceToNow(new Date(patient.createdAt))} ago
                        </span>
                        {patient.appointments[0] && (
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-4 h-4" />
                            Doctor ID: {patient.appointments[0].doctorId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button asChild variant={isCritical ? 'destructive' : 'default'}>
                    <Link href={`/hospital/dashboard/patients/${patient.id}/edit`}>
                      Reconcile Demographics
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CheckCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

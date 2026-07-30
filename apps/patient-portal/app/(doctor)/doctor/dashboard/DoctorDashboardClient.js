'use client';

import { Calendar, Users, FileText, Settings, LogOut, Activity } from 'lucide-react';

import { useActionState } from 'react';

import Link from 'next/link';

import { logoutDoctor } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoctorMetrics } from '@/hooks/useDashboard';

const initialState = { message: '' };

const QUICK_ACTIONS = [
  {
    title: 'Appointments',
    icon: Calendar,
    href: '/doctor/schedule',
  },
  {
    title: 'Prescriptions',
    icon: FileText,
    href: '/doctor/prescriptions',
  },
  {
    title: 'Patients',
    icon: Users,
    href: '/doctor/patients',
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/doctor/settings',
  },
];

function SkeletonMetricCard() {
  return (
    <Card className="border-slate-200/60 shadow-sm h-[120px]">
      <CardHeader className="pb-3">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-8 w-12" />
      </CardHeader>
    </Card>
  );
}

export default function DoctorDashboardClient({ user }) {
  const [, formAction, isPending] = useActionState(logoutDoctor, initialState);
  const { metrics, isLoading, isError } = useDoctorMetrics(user.id);

  const renderMetric = (label, value, subText, Icon, colorClass = 'text-slate-900') => (
    <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardDescription className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </CardDescription>
        <CardTitle className={`text-2xl font-black mt-1 ${colorClass}`}>{value}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Icon className="w-3.5 h-3.5" />
          <span>{subText}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Welcome, Dr. {user.name || user.mobile}
          </h1>
          <p className="text-slate-500 mt-1">Clinical dashboard and patient management</p>
        </div>

        {isError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            Failed to load dashboard metrics. Please refresh the page.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            <>
              <SkeletonMetricCard />
              <SkeletonMetricCard />
              <SkeletonMetricCard />
              <SkeletonMetricCard />
            </>
          ) : (
            <>
              {renderMetric(
                "Today's Appointments",
                metrics?.todayAppointments || '0',
                metrics?.upcomingAppointments
                  ? `${metrics.upcomingAppointments} upcoming`
                  : 'No appointments today',
                Calendar,
              )}
              {renderMetric(
                'Patients Seen',
                metrics?.patientsSeenThisWeek || '0',
                'This week',
                Users,
              )}
              {renderMetric(
                'Pending Records',
                metrics?.pendingRecords || '0',
                metrics?.pendingRecords > 0 ? 'Requires attention' : 'All clear',
                FileText,
                metrics?.pendingRecords > 0 ? 'text-amber-600' : 'text-slate-900',
              )}
              {renderMetric(
                'Clinic Status',
                metrics?.clinicStatus === 'ACTIVE'
                  ? 'Active'
                  : metrics?.clinicStatus === 'ON_LEAVE'
                    ? 'On Leave'
                    : 'Offline',
                metrics?.clinicStatus === 'ACTIVE'
                  ? 'Operating normally'
                  : 'Not accepting patients',
                Activity,
                metrics?.clinicStatus === 'ACTIVE' ? 'text-teal-600' : 'text-slate-400',
              )}
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-slate-200/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900">Quick Actions</CardTitle>
              <CardDescription>Common clinical tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link href={action.href} key={action.title}>
                      <Button
                        variant="outline"
                        className="w-full h-20 flex-col gap-2 border-slate-200 hover:border-teal-500 hover:text-teal-700 bg-white"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-semibold">{action.title}</span>
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900">Account</CardTitle>
              <CardDescription>Session management</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={formAction}>
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isPending}
                  className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300"
                >
                  {isPending ? (
                    'Signing out...'
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

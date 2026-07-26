'use client';

import { Calendar, Users, FileText, Settings, LogOut, Activity } from 'lucide-react';

import { useActionState } from 'react';

import { logoutDoctor } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const initialState = { message: '' };

export default function DoctorDashboardClient({ user }) {
  const [, formAction, isPending] = useActionState(logoutDoctor, initialState);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Welcome, Dr. {user.name || user.mobile}
          </h1>
          <p className="text-slate-500 mt-1">Clinical dashboard and patient management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Today&apos;s Appointments
              </CardDescription>
              <CardTitle className="text-2xl font-black text-slate-900 mt-1">12</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>Next: 10:30 AM</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Patients Seen
              </CardDescription>
              <CardTitle className="text-2xl font-black text-slate-900 mt-1">8</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Users className="w-3.5 h-3.5" />
                <span>This week: 45</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pending Records
              </CardDescription>
              <CardTitle className="text-2xl font-black text-slate-900 mt-1">3</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <FileText className="w-3.5 h-3.5" />
                <span>Requires attention</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Clinic Status
              </CardDescription>
              <CardTitle className="text-2xl font-black text-teal-600 mt-1">Active</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Activity className="w-3.5 h-3.5" />
                <span>Operating normally</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-slate-200/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900">Quick Actions</CardTitle>
              <CardDescription>Common clinical tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 border-slate-200 hover:border-teal-500 hover:text-teal-700"
                >
                  <Calendar className="w-5 h-5" />
                  <span className="text-xs font-semibold">Appointments</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 border-slate-200 hover:border-teal-500 hover:text-teal-700"
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-xs font-semibold">Prescriptions</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 border-slate-200 hover:border-teal-500 hover:text-teal-700"
                >
                  <Users className="w-5 h-5" />
                  <span className="text-xs font-semibold">Patients</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 border-slate-200 hover:border-teal-500 hover:text-teal-700"
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-xs font-semibold">Settings</span>
                </Button>
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

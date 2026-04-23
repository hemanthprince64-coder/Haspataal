import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Bed, FlaskConical, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DoctorDashboard() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Good Morning, Dr. Sharma</h1>
          <p className="text-slate-500">Here's your overview for today.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">Go to OPD Desk</Button>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Today's OPD Queue</CardTitle>
            <Users className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-slate-400 mt-1">12 waiting right now</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">My IPD Patients</CardTitle>
            <Bed className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-slate-400 mt-1">General Ward: 5, ICU: 3</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-amber-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending Lab Results</CardTitle>
            <FlaskConical className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-amber-600 mt-1 font-medium">1 Critical Result</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Follow-ups Today</CardTitle>
            <CalendarClock className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-slate-400 mt-1">from previous week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Live OPD Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-100 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                      #{i}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Patient Name {i}</p>
                      <p className="text-xs text-slate-500">Fever, Cough x3 days</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Call Next</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Lab Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex justify-between">
                  <p className="font-semibold text-red-800 text-sm">Rahul Verma (IPD-ICU)</p>
                  <span className="text-xs font-bold text-red-600">CRITICAL</span>
                </div>
                <p className="text-xs text-red-600 mt-1">WBC Count: 22,000 /mcL</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="font-semibold text-slate-700 text-sm">Priya Singh (OPD)</p>
                <p className="text-xs text-slate-500 mt-1">CBC, LFT - Normal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

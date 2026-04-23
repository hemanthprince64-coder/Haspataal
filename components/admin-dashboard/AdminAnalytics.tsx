import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, Users, ArrowUpRight, Target, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminAnalytics() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Hospital ROI Dashboard</h1>
          <p className="text-slate-500">Real-time performance metrics for Haspataal.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Download Monthly Report</Button>
          <Button className="bg-blue-600">Refresh Data</Button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm border-0 bg-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-sm font-medium">Revenue Today</p>
                <h3 className="text-3xl font-bold mt-1">₹42,500</h3>
              </div>
              <div className="p-2 bg-blue-500/50 rounded-lg">
                <IndianRupee className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-blue-100">
              <ArrowUpRight className="w-3 h-3 mr-1" /> 12% vs yesterday
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-medium">Daily Patient Volume</p>
                <h3 className="text-3xl font-bold mt-1 text-slate-800">128</h3>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg">
                <Users className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
              <ArrowUpRight className="w-3 h-3 mr-1" /> 5% vs average
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-medium">Retention Success</p>
                <h3 className="text-3xl font-bold mt-1 text-slate-800">74%</h3>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <Target className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-400">
              Patients returning for follow-ups
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-medium">Doctor Adoption</p>
                <h3 className="text-3xl font-bold mt-1 text-slate-800">92%</h3>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-400">
              Prescriptions via portal
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-lg">Revenue Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mock Chart Area */}
            <div className="h-[300px] bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400">
              Interactive Revenue Chart (Line Chart)
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-lg">Speciality Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Orthopedics', rev: '₹1.2L', pct: 45, color: 'bg-blue-500' },
                { name: 'Cardiology', rev: '₹85K', pct: 30, color: 'bg-green-500' },
                { name: 'Pediatrics', rev: '₹45K', pct: 15, color: 'bg-amber-500' },
                { name: 'General', rev: '₹25K', pct: 10, color: 'bg-slate-500' },
              ].map((s) => (
                <div key={s.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{s.name}</span>
                    <span className="text-slate-500">{s.rev}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`${s.color} h-full`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

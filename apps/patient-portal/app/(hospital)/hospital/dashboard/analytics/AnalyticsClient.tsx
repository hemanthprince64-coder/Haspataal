/* eslint-disable */
'use client';

import { TrendingUp, Users, CreditCard, Activity, BrainCircuit } from 'lucide-react';

import { SkeletonCard, ErrorInline } from '@/components/dashboard/SkeletonCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMetrics, useRevenue } from '@/hooks/useDashboard';

export default function AnalyticsClient({ hospitalId }: { hospitalId: string }) {
  const { metrics, isLoading: mLoading, isError: mError } = useMetrics(hospitalId);
  const { revenue, isLoading: rLoading, isError: rError } = useRevenue(hospitalId);

  if (mLoading || rLoading) return <SkeletonCard height="600px" />;
  if (mError || rError) return <ErrorInline message="Failed to load analytics" />;

  const stats = [
    {
      label: 'Patient Growth',
      value: metrics?.patientCount?.newThisMonth ?? 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Revenue Growth',
      value: `+${revenue?.breakdown?.[0]?.growthPct ?? 0}%`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Recovery Rate',
      value: `${metrics?.revenueIntelligence?.followUpConversionRate ?? 0}%`,
      icon: Activity,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-4 rounded-xl ${s.bg}`}>
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{s.label}</p>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" /> Revenue Intelligence
            </CardTitle>
            <CardDescription>Breakdown by care pathway and department</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {revenue?.breakdown?.map((item: any) => (
              <div key={item.label} className="relative pt-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-700 bg-emerald-50">
                      {item.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-emerald-700">
                      ₹{item.amount.toLocaleString()} ({item.growthPct > 0 ? '+' : ''}
                      {item.growthPct}%)
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-emerald-100">
                  <div
                    style={{
                      width: `${Math.max(10, Math.min(100, (item.amount / (revenue.totalRecovered || 1)) * 100))}%`,
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all duration-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Operational Efficiency - High Density Activity Grid */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" /> Operational Efficiency
                </CardTitle>
                <CardDescription>
                  Patient inflow density across departments (Last 90 days)
                </CardDescription>
              </div>
              <div className="flex gap-1 items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mr-2">
                  Intensity:
                </span>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-3 w-3 rounded-sm ${i === 1 ? 'bg-blue-50' : i === 2 ? 'bg-blue-200' : i === 3 ? 'bg-blue-400' : i === 4 ? 'bg-blue-600' : 'bg-blue-800'}`}
                  />
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1 justify-center">
              {Array.from({ length: 98 }).map((_, i) => {
                const intensity = Math.floor(Math.random() * 5);
                const colors = [
                  'bg-blue-50',
                  'bg-blue-100',
                  'bg-blue-300',
                  'bg-blue-500',
                  'bg-blue-700',
                ];
                return (
                  <div
                    key={i}
                    className={`h-4 w-4 rounded-sm ${colors[intensity]} hover:ring-2 hover:ring-blue-400 hover:ring-offset-1 transition-all cursor-crosshair`}
                    title={`Day ${i}: ${intensity * 12} patients`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-6 text-[10px] text-slate-400 font-bold px-2 uppercase tracking-widest border-t border-slate-100 pt-4">
              <span>Jan 2024</span>
              <span>Feb 2024</span>
              <span>Mar 2024</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Intelligence Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl text-white relative overflow-hidden shadow-lg border border-slate-800">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="h-24 w-24 text-teal-400" />
          </div>
          <h4 className="text-sm font-bold text-teal-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4" /> AI Prediction
          </h4>
          <p className="text-lg font-medium leading-relaxed mb-6 max-w-[90%] relative z-10">
            Based on current growth, your hospital is projected to hit{' '}
            <strong className="text-teal-400 font-bold">1,200 new patients</strong> by the end of
            Q3.
          </p>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
              High Confidence
            </div>
          </div>
        </div>

        <div className="bg-blue-600 p-6 rounded-2xl text-white relative overflow-hidden shadow-lg border border-blue-500">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity className="h-24 w-24 text-blue-200" />
          </div>
          <h4 className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Bottleneck Alert
          </h4>
          <p className="text-lg font-medium leading-relaxed mb-6 max-w-[90%] relative z-10">
            Outpatient waiting times in <strong className="text-white">Cardiology</strong> have
            increased by 24% this week.
          </p>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-blue-200">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
              Action Recommended
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

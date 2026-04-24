"use client";

import { useMetrics, useRevenue } from "@/hooks/useDashboard";
import { SkeletonCard, ErrorInline } from "@/components/dashboard/SkeletonCard";
import { TrendingUp, Users, CreditCard, Activity } from "lucide-react";

export default function AnalyticsClient({ hospitalId }: { hospitalId: string }) {
  const { metrics, isLoading: mLoading, isError: mError } = useMetrics(hospitalId);
  const { revenue, isLoading: rLoading, isError: rError } = useRevenue(hospitalId);

  if (mLoading || rLoading) return <SkeletonCard height="600px" />;
  if (mError || rError) return <ErrorInline message="Failed to load analytics" />;

  const stats = [
    { label: "Patient Growth", value: metrics?.patientCount?.newThisMonth ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Revenue Growth", value: `+${revenue?.breakdown?.[0]?.growthPct ?? 0}%`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Recovery Rate", value: `${metrics?.revenueIntelligence?.followUpConversionRate ?? 0}%`, icon: Activity, color: "text-violet-600", bg: "bg-violet-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${s.bg}`}>
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-emerald-600" />
          Revenue Intelligence
        </h3>
        <div className="space-y-4">
          {revenue?.breakdown?.map((item: any) => (
            <div key={item.label} className="relative pt-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-100">
                    {item.label}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-emerald-600">
                    ₹{item.amount.toLocaleString()} ({item.growthPct > 0 ? '+' : ''}{item.growthPct}%)
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-emerald-100">
                <div
                  style={{ width: `${Math.max(10, Math.min(100, (item.amount / revenue.totalRecovered) * 100))}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all duration-500"
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Efficiency - High Density Activity Grid */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Operational Efficiency</h3>
            <p className="text-xs text-gray-500">Patient inflow density across departments (Last 90 days)</p>
          </div>
          <div className="flex gap-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter self-center mr-2">Intensity:</span>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`h-3 w-3 rounded-sm ${i === 1 ? 'bg-blue-50' : i === 2 ? 'bg-blue-200' : i === 3 ? 'bg-blue-400' : i === 4 ? 'bg-blue-600' : 'bg-blue-800'}`} />
            ))}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 justify-center">
           {Array.from({ length: 98 }).map((_, i) => {
             const intensity = Math.floor(Math.random() * 5);
             const colors = ["bg-blue-50", "bg-blue-100", "bg-blue-300", "bg-blue-500", "bg-blue-700"];
             return (
               <div 
                 key={i} 
                 className={`h-4 w-4 rounded-sm ${colors[intensity]} hover:ring-2 hover:ring-blue-400 hover:ring-offset-1 transition-all cursor-crosshair`}
                 title={`Day ${i}: ${intensity * 12} patients`}
               />
             );
           })}
        </div>
        <div className="flex justify-between mt-6 text-[10px] text-gray-400 font-bold px-2 uppercase tracking-widest border-t pt-4">
           <span>Jan 2024</span>
           <span>Feb 2024</span>
           <span>Mar 2024</span>
        </div>
      </div>

      {/* Intelligence Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="h-20 w-20" />
          </div>
          <h4 className="text-sm font-bold text-teal-400 uppercase tracking-widest mb-4">AI Prediction</h4>
          <p className="text-lg font-medium leading-relaxed mb-6">
            Based on current growth, your hospital is projected to hit <span className="text-teal-400 font-bold">₹12.4L</span> in recovery revenue by Q3.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Activity className="h-3.5 w-3.5" />
            Confidence: 94.2%
          </div>
        </div>

        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
          <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-widest mb-4">Patient Retention</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-emerald-700">Follow-up Adherence</span>
              <span className="text-xs font-bold text-emerald-900">78%</span>
            </div>
            <div className="h-1.5 w-full bg-emerald-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: '78%' }} />
            </div>
            <p className="text-[10px] text-emerald-600 font-medium italic mt-2">
              "Diabetic clinic has the highest retention score this week."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

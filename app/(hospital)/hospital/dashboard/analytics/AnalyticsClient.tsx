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

      {/* Empty Chart Placeholder with Premium Look */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Operational Efficiency</h3>
        <p className="text-xs text-gray-500 mb-6">Patient inflow vs Bed occupancy (Last 30 days)</p>
        
        <div className="h-48 flex items-end justify-between gap-2 px-4">
           {[40, 70, 45, 90, 65, 80, 50, 85, 60, 75, 40, 95].map((h, i) => (
             <div 
               key={i} 
               style={{ height: `${h}%` }} 
               className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
             />
           ))}
        </div>
        <div className="flex justify-between mt-4 text-[10px] text-gray-400 font-medium px-2 uppercase tracking-wider">
           <span>Week 1</span>
           <span>Week 2</span>
           <span>Week 3</span>
           <span>Week 4</span>
        </div>
      </div>
    </div>
  );
}

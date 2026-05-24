'use client';

import { AlertCircle, ArrowRight } from 'lucide-react';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import AdminStatsGrid from '@/components/admin/AdminStatsGrid';
import PlatformGrowthCard from '@/components/admin/PlatformGrowthCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardClient() {
  const [stats, setStats] = useState({
    totalHospitals: 0,
    activeHospitals: 0,
    pendingHospitals: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalVisits: 0,
    cities: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('@/app/actions').then(({ getAdminDashboardData }) => {
      getAdminDashboardData().then((data) => {
        setStats(data.stats);
        setLoading(false);
      });
    });
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Platform Overview</h1>
        <p className="text-slate-400 text-sm">Haspataal admin control panel</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-28 bg-slate-900/60 border border-slate-800/80 rounded-2xl"
            />
          ))}
        </div>
      ) : (
        <AdminStatsGrid stats={stats} />
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Platform Revenue & Growth</h2>
        {loading ? (
          <Skeleton className="h-[300px] w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl" />
        ) : (
          <PlatformGrowthCard />
        )}
      </div>

      {stats.pendingHospitals > 0 && !loading && (
        <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Action Required</p>
              <p className="text-xs text-slate-400">
                {stats.pendingHospitals} hospital(s) are pending administrative review.
              </p>
            </div>
          </div>
          <Link href="/admin/dashboard/hospitals" passHref legacyBehavior>
            <a className="flex items-center gap-1 text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors bg-amber-500/5 hover:bg-amber-500/10 px-4.5 py-2 rounded-xl border border-amber-500/10">
              <span>Review Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </Link>
        </div>
      )}
    </div>
  );
}

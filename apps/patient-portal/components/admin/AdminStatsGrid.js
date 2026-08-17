import { Building2, CheckCircle2, Clock, UserCheck, Users, BarChart3, MapPin } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

export default function AdminStatsGrid({ stats }) {
  const statCards = [
    {
      label: 'Total Hospitals',
      value: stats.totalHospitals,
      icon: Building2,
      color: 'text-sky-500',
      bg: 'bg-sky-500/10',
      glow: 'shadow-sky-500/5',
    },
    {
      label: 'Active',
      value: stats.activeHospitals,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      glow: 'shadow-emerald-500/5',
    },
    {
      label: 'Pending Approval',
      value: stats.pendingHospitals,
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      glow: 'shadow-amber-500/5',
    },
    {
      label: 'Total Doctors',
      value: stats.totalDoctors,
      icon: UserCheck,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      glow: 'shadow-purple-500/5',
    },
    {
      label: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'text-teal-500',
      bg: 'bg-teal-500/10',
      glow: 'shadow-teal-500/5',
    },
    {
      label: 'Total Visits',
      value: stats.totalVisits,
      icon: BarChart3,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      glow: 'shadow-blue-500/5',
    },
    {
      label: 'Cities Covered',
      value: stats.cities,
      icon: MapPin,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      glow: 'shadow-rose-500/5',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {statCards.map((s) => {
        const Icon = s.icon;
        return (
          <Card
            key={s.label}
            className={`bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/60 transition-all duration-300 shadow-md ${s.glow} group overflow-hidden relative`}
          >
            <div className={`absolute top-0 left-0 w-1 h-full ${s.bg}`} />
            <CardContent className="p-6 flex items-center gap-5">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${s.bg} ${s.color}`}
              >
                <Icon className="w-6 h-6 transition-transform group-hover:scale-110 duration-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1.5 truncate">
                  {s.label}
                </p>
                <p className="text-2xl font-black text-white leading-none tracking-tight">
                  {s.value}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

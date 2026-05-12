import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@haspataal/ui';
import { redis } from '@/lib/redis';
import {
  Calendar,
  Users,
  UserRound,
  Clock,
  FileText,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export default async function HospitalDashboard() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('session_user');

  if (!userCookie) redirect('/login');
  const user = JSON.parse(userCookie.value);
  const hospitalId = user.hospitalId;

  // Fetch constraints
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 1. Real-time Data
  const [hospital, recentVisitsData] = await Promise.all([
    prisma.hospitalsMaster.findUnique({ where: { id: hospitalId } }),
    prisma.visit.findMany({
      where: { hospitalId },
      orderBy: { date: 'desc' },
      take: 5,
      include: { doctor: true },
    }),
  ]);

  // 2. Statistics (Cached)
  let stats = null;
  const cacheKey = `dashboard:stats:${hospitalId}`;

  try {
    stats = await redis.get(cacheKey);
  } catch (e) {
    console.error('Redis Get Error:', e);
  }

  if (!stats) {
    const [
      totalVisits,
      todayVisits,
      scheduledVisits,
      completedVisits,
      totalDoctors,
      uniquePatients,
    ] = await Promise.all([
      prisma.visit.count({ where: { hospitalId } }),
      prisma.visit.count({ where: { hospitalId, date: { gte: today, lt: tomorrow } } }),
      prisma.visit.count({ where: { hospitalId, status: 'PENDING' } }),
      prisma.visit.count({ where: { hospitalId, status: 'COMPLETED' } }),
      prisma.doctor.count({ where: { hospitalId } }),
      prisma.visit.groupBy({
        by: ['patientPhone'],
        where: { hospitalId },
      }),
    ]);

    stats = {
      totalVisits,
      todayVisits,
      scheduledVisits,
      completedVisits,
      totalDoctors,
      totalPatients: uniquePatients.length,
    };

    try {
      await redis.set(cacheKey, stats, { ex: 60 });
    } catch (e) {
      console.error('Redis Set Error:', e);
    }
  }

  const statCards = [
    {
      label: "Today's Visits",
      value: stats.todayVisits,
      icon: Calendar,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
    {
      label: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      label: 'Total Doctors',
      value: stats.totalDoctors,
      icon: UserRound,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      label: 'Scheduled',
      value: stats.scheduledVisits,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Total Visits',
      value: stats.totalVisits,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Completed',
      value: stats.completedVisits,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Welcome back, {user.name} • {hospital?.displayName || hospital?.legalName}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-6 w-6 ${s.color}`} />
                </div>
                <div>
                  <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-muted-foreground font-medium">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 flex-wrap mb-8">
        <a href="/dashboard/billing" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
          + New OPD Visit
        </a>
        <a href="/dashboard/reports" className="inline-flex items-center gap-2 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium rounded-lg transition-colors">
          View Reports
        </a>
        {user.role === 'ADMIN' && (
          <a href="/dashboard/doctors" className="inline-flex items-center gap-2 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium rounded-lg transition-colors">
            Manage Doctors
          </a>
        )}
      </div>

      {/* Recent Visits */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-bold">Recent Visits</CardTitle>
          <a href="/dashboard/reports" className="text-sm text-primary font-medium hover:underline">
            View All →
          </a>
        </CardHeader>
        <CardContent className="p-0">
          {recentVisitsData.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No visits yet. Create your first OPD visit.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Patient</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Doctor</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentVisitsData.map((v) => {
                    const statusColor =
                      v.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-700'
                        : v.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700';
                    return (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          {new Date(v.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>
                        <td className="px-4 py-3 font-medium">{v.patientName || v.patientPhone}</td>
                        <td className="px-4 py-3">{v.doctor?.name || 'Dr. Unknown'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColor}`}>
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

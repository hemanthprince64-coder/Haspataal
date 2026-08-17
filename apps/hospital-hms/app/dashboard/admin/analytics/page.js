import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAdminStats } from '@/app/actions/analytics';
import { HospitalGrowthChart, CityDistributionChart } from './AdminCharts';
import { Card, CardContent, CardHeader, CardTitle } from '@haspataal/ui';
import { Building2, Stethoscope, Users } from 'lucide-react';

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session || !session.user) redirect('/login');

  const { stats, error } = await getAdminStats();

  if (error) return <div className="animate-fade-in">Error: {error}</div>;

  const metricCards = [
    {
      title: 'Total Hospitals',
      value: stats.totalHospitals,
      sub: `${stats.activeHospitals} Active`,
      icon: Building2,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      accent: 'border-sky-500',
    },
    {
      title: 'Total Doctors',
      value: stats.totalDoctors,
      sub: null,
      icon: Stethoscope,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      accent: 'border-emerald-500',
    },
    {
      title: 'Total Patients',
      value: stats.totalPatients.toLocaleString(),
      sub: null,
      icon: Users,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      accent: 'border-violet-500',
    },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Platform Analytics (Admin)</h1>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {metricCards.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.title} className={`border-l-4 ${m.accent}`}>
              <CardContent className="pt-6 text-center">
                <div className={`w-12 h-12 rounded-lg ${m.bg} flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`h-6 w-6 ${m.color}`} />
                </div>
                <h3 className="text-sm text-muted-foreground mb-1">{m.title}</h3>
                <div className={`text-3xl font-extrabold ${m.color}`}>{m.value}</div>
                {m.sub && <div className="text-xs text-muted-foreground mt-1">{m.sub}</div>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hospital Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <HospitalGrowthChart data={stats.hospitalGrowth} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">City-wise Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <CityDistributionChart data={stats.cityDistribution} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

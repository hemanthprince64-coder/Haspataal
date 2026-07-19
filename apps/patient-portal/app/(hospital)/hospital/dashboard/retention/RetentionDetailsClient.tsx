'use client';

import { Activity, BellRing, Users, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

import { SkeletonCard, ErrorInline } from '@/components/dashboard/SkeletonCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRetentionKPI } from '@/hooks/useDashboard';

export default function RetentionDetailsClient({ hospitalId }: { hospitalId: string }) {
  const { kpi, isLoading, isError, mutate } = useRetentionKPI(hospitalId);

  const handleLaunchCampaign = () => {
    toast.success('Recall campaign launched via SMS & WhatsApp!');
  };

  if (isLoading) return <SkeletonCard height="400px" />;
  if (isError) return <ErrorInline message="Failed to load retention details" onRetry={mutate} />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Overall Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{kpi?.retentionRate || 0}%</div>
            <p className="text-xs text-slate-500 mt-1">
              {kpi?.deltaVsLastMonth > 0 ? `+${kpi.deltaVsLastMonth}%` : kpi?.deltaVsLastMonth}% vs
              last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Follow-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">142</div>
            <p className="text-xs text-slate-500 mt-1">Pending this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" /> Performance by Care Pathway
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {kpi?.carePathways?.map((p: any) => (
              <div key={p.key} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-sm text-slate-700">{p.label}</span>
                  <span className="font-bold text-teal-600">{p.completionPct}%</span>
                </div>
                <div className="text-xs text-slate-500 mb-3">{p.activeCount} active patients</div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: `${p.completionPct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="w-5 h-5 text-blue-600" /> Patient Recall System
            </CardTitle>
            <CardDescription>Automated marketing & follow-up campaigns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" /> Target: Dropped-off Patients (&gt;30 days)
              </h4>
              <p className="text-sm text-blue-700 mb-4">
                48 patients missed their follow-ups in the last 30 days. Re-engage them with a quick
                recall message.
              </p>
              <Button
                onClick={handleLaunchCampaign}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                <MessageSquare className="w-4 h-4 mr-2" /> Launch SMS Campaign
              </Button>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
              <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" /> Target: Preventive Checkups
              </h4>
              <p className="text-sm text-amber-700 mb-4">
                120 patients haven't visited in 6 months. Send a preventive health checkup package
                offer.
              </p>
              <Button
                variant="outline"
                onClick={handleLaunchCampaign}
                className="bg-white border-amber-300 text-amber-800 hover:bg-amber-100 w-full sm:w-auto"
              >
                <MessageSquare className="w-4 h-4 mr-2" /> Launch Offer Campaign
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

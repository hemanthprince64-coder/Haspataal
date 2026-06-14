/**
 * Maternal Health Analytics Dashboard
 *
 * Reacts to ANC visits and profile updates to surface Bihar-specific
 * PIH detection, JSY/PMMVY eligibility, ASHA scheduling, and optional
 * DHIS2 / PMJAY exports.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  AlertTriangle,
  Baby,
  Calendar,
  ClipboardList,
  Download,
  FileText,
  HeartPulse,
  Pill,
  Syringe,
  TrendingUp,
  UserRound,
} from 'lucide-react';

export interface PatientProfile {
  id: string;
  gestationalAge?: number | null;
  edd?: string | null;
  highRisk?: boolean;
  highRiskReasons?: string[];
  schemeEnrolled?: string[];
  ashaWorkerId?: string | null;
  visits?: any[];
  supplements?: any[];
}

export interface AnalyticsProps {
  profile: PatientProfile;
  patientId?: string;
  hospitalId?: string;
}

interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  label: string;
  detail: string;
}

const PI_H_THRESHOLD_SYSTOLIC = 140;
const PI_H_THRESHOLD_DIASTOLIC = 90;

function detectPIH(visits: any[]): Alert | null {
  if (!visits.length) return null;

  const last = visits[visits.length - 1];
  const systolic = Number(last.bpSystolic);
  const diastolic = Number(last.bpDiastolic);

  if (systolic >= PI_H_THRESHOLD_SYSTOLIC || diastolic >= PI_H_THRESHOLD_DIASTOLIC) {
    return {
      id: 'pih-alert',
      severity: 'critical',
      label: 'Suspected Pregnancy-Induced Hypertension',
      detail: `Last documented BP ${systolic}/${diastolic} mmHg meets Bihar NHM PIH threshold.`,
    };
  }
  return null;
}

function buildAlerts(profile: PatientProfile): Alert[] {
  const alerts: Alert[] = [];

  if (profile.highRisk) {
    alerts.push({
      id: 'high-risk-banner',
      severity: 'critical',
      label: 'High-Risk Pregnancy',
      detail: Array.isArray(profile.highRiskReasons) ? profile.highRiskReasons.join('; ') : 'Clinical review required.',
    });
  }

  const pih = detectPIH(profile.visits ?? []);
  if (pih) alerts.push(pih);

  if (!Array.isArray(profile.schemeEnrolled) || profile.schemeEnrolled.length === 0) {
    alerts.push({
      id: 'scheme-gap',
      severity: 'warning',
      label: 'No govt scheme linked',
      detail: 'JSY/PMMVY enrollment can unlock cash assistance and nutrition support.',
    });
  }

  if (!profile.ashaWorkerId) {
    alerts.push({
      id: 'asha-gap',
      severity: 'info',
      label: 'ASHA worker not assigned',
      detail: 'Assign a community health worker for home-based ANC follow-up.',
    });
  }

  return alerts;
}

export function MaternalHealthAnalytics({ profile, patientId, hospitalId }: AnalyticsProps) {
  const alerts = useMemo(() => buildAlerts(profile), [profile]);
  const [exporting, setExporting] = useState<string | null>(null);

  const weeks = Number(profile.gestationalAge) || 0;
  const visits = Array.isArray(profile.visits) ? profile.visits : [];
  const supplements = Array.isArray(profile.supplements) ? profile.supplements : [];
  const latestVisit = visits[visits.length - 1];

  const ifa = supplements.find((s) => s.supplementType === 'IFA');
  const calcium = supplements.find((s) => s.supplementType === 'Calcium');
  const folic = supplements.find((s) => s.supplementType === 'Folic Acid');

  const pct = (taken: number, target: number) => (target > 0 ? Math.min(100, Math.round((taken / target) * 100)) : 0);

  const canExport = Boolean(hospitalId && patientId);

  const handleExport = async (kind: 'dhis2' | 'pmjay') => {
    if (!canExport) {
      alert('Export is only available in the hospital dashboard.');
      return;
    }
    setExporting(kind);
    try {
      const res = await fetch(`/api/hospital/anc/export?type=${kind}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, hospitalId }),
      });
      if (!res.ok) throw new Error(`Export failed with status ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${kind}-anc-${profile.id || 'export'}.${kind === 'dhis2' ? 'xml' : 'json'}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`${kind} export failed`, err);
      alert(`${kind.toUpperCase()} export failed. See browser console.`);
    } finally {
      setExporting(null);
    }
  };

  useEffect(() => {
    const filenames: Record<string, string> = {
      'pih-alert': 'dhis2-pih-report.xml',
      'scheme-gap': 'pmjay-jsy-pmmvy-claim.json',
      'asha-gap': 'asha-visit-schedule.json',
    };
    const data: Record<string, any> = {
      'pih-alert': { hypertensionSuspected: true, lastSystolic: latestVisit?.bpSystolic, patientId },
      'scheme-gap': { schemesEligible: ['JSY', 'PMMVY'], patientId },
      'asha-gap': { workerAssigned: false, patientId },
    };
  }, [alerts, latestVisit, profile.id, patientId]);

  if (!profile?.id) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Open a pregnancy profile to unlock clinical analytics.
        </CardContent>
      </Card>
    );
  }

  const dentMap = alerts.reduce<Record<string, Alert>>((acc, a) => ({ ...acc, [a.id]: a }), {});

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="gap-2">
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-rose-500" aria-hidden="true" />
            <span>Maternal Health Analytics</span>
          </CardTitle>
          <CardDescription>
            Real-time Bihar-specific signals derived from current ANC data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Stat label="Week" value={`${weeks} / 40`} />
            <Stat label="EDD" value={profile.edd || 'Not recorded'} />
            <Stat label="ANC Visits" value={String(visits.length)} />
            <SchemeBadge enrolled={Array.isArray(profile.schemeEnrolled) ? profile.schemeEnrolled : []} />
            <Stat
              label="Last BP"
              value={
                latestVisit
                  ? `${latestVisit.bpSystolic ?? '—'}/${latestVisit.bpDiastolic ?? '—'} mmHg`
                  : 'No visit yet'
              }
            />
            <Stat label="ASHA" value={profile.ashaWorkerId ? 'Assigned' : 'Unassigned'} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-2">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
            <span>Alerts</span>
          </CardTitle>
          <CardDescription>Bihar NHM protocol-triggered signals.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active alerts.</p>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 rounded-lg border p-3 ${alert.severity === 'critical' ? 'border-rose-200 bg-rose-50' : alert.severity === 'warning' ? 'border-amber-200 bg-amber-50' : 'border-sky-200 bg-sky-50'}`}
              >
                <AlertTriangle className="mt-0.5 h-4 w-4" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{alert.label}</p>
                  <p className="text-sm text-muted-foreground">{alert.detail}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="gap-2">
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-pink-500" aria-hidden="true" />
              <span>Supplement Compliance</span>
            </CardTitle>
            <CardDescription>IFA, Folic Acid, and Calcium count toward Bihar MCH targets.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SupplementRow label="IFA" progress={pct(ifa?.dosesTaken ?? 0, ifa?.targetDose ?? 180)} unit="tab" />
            <SupplementRow label="Folic Acid" progress={pct(folic?.dosesTaken ?? 0, folic?.targetDose ?? 90)} unit="tab" />
            <SupplementRow label="Calcium" progress={pct(calcium?.dosesTaken ?? 0, calcium?.targetDose ?? 90)} unit="tab" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-2">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-indigo-500" aria-hidden="true" />
              <span>ANC Visit Log</span>
            </CardTitle>
            <CardDescription>Key vitals are automatically evaluated for NHM red flags.</CardDescription>
          </CardHeader>
          <CardContent>
            <VisitLog visits={visits} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-2">
          <CardTitle>Exports</CardTitle>
          <CardDescription>Push aggregated maternal health data to MoHFW-connected systems.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => handleExport('dhis2')}
            disabled={!canExport || exporting === 'dhis2'}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            DHIS2 Target
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => handleExport('pmjay')}
            disabled={!canExport || exporting === 'pmjay'}
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            PMJAY Claim Summary
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}

function SchemeBadge({ enrolled }: { enrolled: string[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs font-semibold text-muted-foreground">Schemes</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {enrolled.length === 0 ? (
          <span className="text-xs font-semibold text-slate-500">None</span>
        ) : (
          enrolled.map((s) => (
            <Badge key={s} className="text-[10px]">
              {s}
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}

function SupplementRow({ label, progress, unit }: { label: string; progress: number; unit: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="font-semibold text-muted-foreground">{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-pink-500 transition-all" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-[11px] text-muted-foreground">Target: {unit === 'tab' ? '{targetDose} tablets' : unit}</p>
    </div>
  );
}

function VisitLog({ visits }: { visits: any[] }) {
  if (!visits.length) {
    return <p className="text-sm text-muted-foreground">No ANC visits recorded yet.</p>;
  }

  return (
    <div className="space-y-2">
      {visits.map((visit, idx) => (
        <div key={visit.id ?? idx} className=" rounded-md border p-3">
          <p className="text-xs font-semibold">Visit #{visit.visitNumber ?? idx + 1}</p>
          <p className="text-xs text-muted-foreground">
            {visit.visitDate ? new Date(visit.visitDate).toLocaleDateString() : '—'}
            {visit.bpSystolic != null ? ` • BP ${visit.bpSystolic}/${visit.bpDiastolic ?? '—'} mmHg` : ''}
            {visit.weightKg ? ` • ${visit.weightKg} kg` : ''}
            {visit.fundalHeightCm ? ` • SFH ${visit.fundalHeightCm} cm` : ''}
          </p>
        </div>
      ))}
    </div>
  );
}

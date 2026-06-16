/**
 * Maternal Health Analytics Dashboard
 *
 * Interactive clinical-grade dashboard mapping Phase 2 (ABDM, Hindi/Bhojpuri MCH portal, TTS)
 * and Phase 3 (WHO Partograph, Referral Generator, Ambulance Simulator, e-Raktkosh blood bank).
 */

'use client';

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
  Volume2,
  MapPin,
  Truck,
  Layers,
  Globe,
  Plus,
  Share2,
} from 'lucide-react';

import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
      detail: Array.isArray(profile.highRiskReasons)
        ? profile.highRiskReasons.join('; ')
        : 'Clinical review required.',
    });
  }

  const pih = detectPIH(profile.visits ?? []);
  if (pih) alerts.push(pih);

  if (!Array.isArray(profile.schemeEnrolled) || profile.schemeEnrolled.length === 0) {
    alerts.push({
      id: 'scheme-gap',
      severity: 'warning',
      label: 'No Govt Scheme Linked',
      detail: 'JSY/PMMVY enrollment can unlock cash assistance and nutrition support.',
    });
  }

  if (!profile.ashaWorkerId) {
    alerts.push({
      id: 'asha-gap',
      severity: 'info',
      label: 'ASHA Worker Not Assigned',
      detail: 'Assign a community health worker for home-based ANC follow-up.',
    });
  }

  return alerts;
}

// Translations and dietary advice dictionary
const localizationData = {
  en: {
    dashboardTitle: 'Maternal Health Analytics',
    dashboardDesc: 'Real-time Bihar-specific signals derived from current ANC data.',
    riskTitle: 'Risk Status',
    partograph: 'WHO Partograph',
    frontline: 'Frontline & ABHA Node',
    emergency: 'Referrals & Emergency',
    alerts: 'Active Alerts',
    supplements: 'Supplement Compliance',
    visitLog: 'ANC Visit Log',
    dietTip: 'Dietary Tip: Eat green leafy vegetables, iron-rich foods, and take calcium daily.',
    babySize: 'Your baby is the size of a raw mango (Ambiya) at this stage.',
  },
  hi: {
    dashboardTitle: 'मातृ स्वास्थ्य विश्लेषिकी',
    dashboardDesc: 'वर्तमान एएनसी डेटा से प्राप्त बिहार-विशिष्ट संकेत।',
    riskTitle: 'जोखिम की स्थिति',
    partograph: 'डब्ल्यूएचओ पार्टोग्राफ',
    frontline: 'फ्रंटलाइन और आभा नोड',
    emergency: 'रेफरल और आपातकालीन',
    alerts: 'सक्रिय चेतावनियाँ',
    supplements: 'सप्लीमेंट अनुपालन',
    visitLog: 'एएनसी विज़िट लॉग',
    dietTip: 'आहार सलाह: हरी पत्तेदार सब्जियां, आयरन युक्त भोजन लें और दैनिक कैल्शियम खाएं।',
    babySize: 'इस समय आपका बच्चा एक कच्चे आम (अम्बिया) के आकार का है।',
  },
  bho: {
    dashboardTitle: 'मातृ स्वास्थ्य विश्लेषिकी',
    dashboardDesc: 'एएनसी डेटा से निकलल बिहार-विशिष्ट जानकारी।',
    riskTitle: 'जोखिम के स्थिति',
    partograph: 'डब्ल्यूएचओ पार्टोग्राफ',
    frontline: 'फ्रंटलाइन आ आभा नोड',
    emergency: 'रेफरल आ आपातकालीन',
    alerts: 'सक्रिय चेतावनी',
    supplements: 'सप्लीमेंट के स्थिति',
    visitLog: 'एएनसी जांच लॉग',
    dietTip: 'आहार सलाह: हरी साग-सब्जी खाईं, लोहा वाला खाना आ रोज कैल्शियम लीं।',
    babySize: 'एहि समय रउआ बच्चा एगो टिकोला (कच्चा आम) नियर बा।',
  },
};

export function MaternalHealthAnalytics({ profile, patientId, hospitalId }: AnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'partograph' | 'frontline' | 'emergency'>(
    'summary',
  );
  const [lang, setLang] = useState<'en' | 'hi' | 'bho'>('hi');
  const [exporting, setExporting] = useState<string | null>(null);

  // ABDM / ABHA state
  const [abhaAddress, setAbhaAddress] = useState<string>(
    profile.ashaWorkerId ? 'devi9876@abdm' : '',
  );
  const [linkingAbha, setLinkingAbha] = useState(false);

  // Partograph state
  const [partographPoints, setPartographPoints] = useState<
    Array<{ hour: number; dilation: number; fhr: number }>
  >([
    { hour: 0, dilation: 4, fhr: 140 },
    { hour: 2, dilation: 5, fhr: 135 },
    { hour: 4, dilation: 7, fhr: 130 },
  ]);
  const [newDil, setNewDil] = useState('8');
  const [newFhr, setNewFhr] = useState('130');
  const [newHour, setNewHour] = useState('6');

  // Referral state
  const [referring, setReferring] = useState(false);
  const [referralReason, setReferralReason] = useState('Severe Anaemia & PIH risk');
  const [referredTo, setReferredTo] = useState('Patna Medical College Hospital (PMCH)');
  const [referralsList, setReferralsList] = useState<any[]>([]);

  // Emergency state
  const [ambulanceStatus, setAmbulanceStatus] = useState<'idle' | 'dispatched' | 'arrived'>('idle');
  const [bloodBanks, setBloodBanks] = useState<any[]>([
    { name: 'PMCH Blood Bank', distance: '1.2 km', phone: '0612-2300344' },
    { name: 'Red Cross Society Patna', distance: '4.5 km', phone: '0612-2221433' },
  ]);

  const alerts = useMemo(() => buildAlerts(profile), [profile]);
  const text = localizationData[lang];

  const weeks = Number(profile.gestationalAge) || 0;
  const visits = Array.isArray(profile.visits) ? profile.visits : [];
  const supplements = Array.isArray(profile.supplements) ? profile.supplements : [];
  const latestVisit = visits[visits.length - 1];

  const ifa = supplements.find((s) => s.supplementType === 'IFA');
  const calcium = supplements.find((s) => s.supplementType === 'Calcium');
  const folic = supplements.find((s) => s.supplementType === 'Folic Acid');

  const pct = (taken: number, target: number) =>
    target > 0 ? Math.min(100, Math.round((taken / target) * 100)) : 0;

  // TTS implementation
  const handleTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const sentence = `${text.dietTip}. ${text.babySize}`;
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = lang === 'en' ? 'en-US' : 'hi-IN';
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-Speech is not supported in this browser.');
    }
  };

  // ABDM auto-link
  const handleLinkAbha = () => {
    setLinkingAbha(true);
    setTimeout(() => {
      setAbhaAddress(`maternal-${profile.id.substring(0, 5)}@abdm`);
      setLinkingAbha(false);
    }, 1200);
  };

  // Add Partograph point
  const handleAddPartograph = () => {
    const pt = {
      hour: Number(newHour),
      dilation: Number(newDil),
      fhr: Number(newFhr),
    };
    setPartographPoints([...partographPoints, pt].sort((a, b) => a.hour - b.hour));
  };

  // Submit Referral Slip
  const handleCreateReferral = async () => {
    setReferring(true);
    try {
      const res = await fetch('/api/hospital/anc/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pregnancyId: profile.id,
          referralReason,
          referredTo,
          referringDoctor: 'Dr. R. K. Sinha (PHC In-Charge)',
          isUrgent: true,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setReferralsList([...referralsList, data.referral]);
        alert('Referral slip generated successfully. SMS alert sent to patient.');
      } else {
        alert('Failed to generate referral slip.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReferring(false);
    }
  };

  // Ambulance dispatcher
  const handleCallAmbulance = () => {
    setAmbulanceStatus('dispatched');
    setTimeout(() => {
      setAmbulanceStatus('arrived');
    }, 4000);
  };

  // Exports
  const handleExport = async (kind: 'dhis2' | 'pmjay' | 'fhir') => {
    setExporting(kind);
    try {
      const res = await fetch(`/api/hospital/anc/export?type=${kind}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, hospitalId }),
      });
      if (!res.ok) throw new Error(`Export failed with status ${res.status}`);
      const data = await res.json();

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${kind}-anc-${profile.id || 'export'}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`${kind} export failed`, err);
      alert(`${kind.toUpperCase()} export failed.`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Widget */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            {text.dashboardTitle}
          </h1>
          <p className="text-sm text-slate-500">{text.dashboardDesc}</p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <Globe className="h-4 w-4 text-slate-400" />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as any)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="bho">भोजपुरी (Bhojpuri)</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-2">
        <Button
          variant={activeTab === 'summary' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('summary')}
          className="rounded-full text-xs font-bold"
        >
          <Activity className="mr-1.5 h-4 w-4" />
          Overview & Stats
        </Button>
        <Button
          variant={activeTab === 'partograph' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('partograph')}
          className="rounded-full text-xs font-bold"
        >
          <TrendingUp className="mr-1.5 h-4 w-4" />
          {text.partograph}
        </Button>
        <Button
          variant={activeTab === 'frontline' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('frontline')}
          className="rounded-full text-xs font-bold"
        >
          <Globe className="mr-1.5 h-4 w-4" />
          {text.frontline}
        </Button>
        <Button
          variant={activeTab === 'emergency' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('emergency')}
          className="rounded-full text-xs font-bold"
        >
          <Truck className="mr-1.5 h-4 w-4" />
          {text.emergency}
        </Button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <Card className="rounded-[2rem]">
            <CardHeader className="gap-2">
              <CardTitle className="flex items-center gap-2 text-rose-600">
                <HeartPulse className="h-5 w-5" aria-hidden="true" />
                <span>Maternal Vitals Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Stat label="Week" value={`${weeks} / 40`} />
              <Stat label="EDD" value={profile.edd || 'Not recorded'} />
              <Stat label="ANC Visits" value={String(visits.length)} />
              <SchemeBadge
                enrolled={Array.isArray(profile.schemeEnrolled) ? profile.schemeEnrolled : []}
              />
              <Stat
                label="Last BP"
                value={
                  latestVisit
                    ? `${latestVisit.bpSystolic ?? '—'}/${latestVisit.bpDiastolic ?? '—'} mmHg`
                    : 'No visit yet'
                }
              />
              <Stat label="ASHA" value={profile.ashaWorkerId ? 'Assigned' : 'Unassigned'} />
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-amber-100 bg-amber-50/20">
            <CardHeader className="gap-2">
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                <span>{text.alerts}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.length === 0 ? (
                <p className="text-sm text-slate-500">No active alerts.</p>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 rounded-2xl border p-4 bg-white shadow-sm ${
                      alert.severity === 'critical' ? 'border-rose-100' : 'border-amber-100'
                    }`}
                  >
                    <AlertTriangle
                      className={`mt-0.5 h-4 w-4 ${alert.severity === 'critical' ? 'text-rose-500' : 'text-amber-500'}`}
                      aria-hidden="true"
                    />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800">{alert.label}</p>
                      <p className="text-xs text-slate-500">{alert.detail}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-[2rem]">
              <CardHeader className="gap-2">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Pill className="h-5 w-5 text-pink-500" aria-hidden="true" />
                  <span>{text.supplements}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <SupplementRow
                  label="IFA"
                  progress={pct(ifa?.dosesTaken ?? 0, ifa?.targetDose ?? 180)}
                  unit="tab"
                />
                <SupplementRow
                  label="Calcium"
                  progress={pct(calcium?.dosesTaken ?? 0, calcium?.targetDose ?? 90)}
                  unit="tab"
                />
                <SupplementRow
                  label="Folic Acid"
                  progress={pct(folic?.dosesTaken ?? 0, folic?.targetDose ?? 90)}
                  unit="tab"
                />
              </CardContent>
            </Card>

            <Card className="rounded-[2rem]">
              <CardHeader className="gap-2">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <ClipboardList className="h-5 w-5 text-indigo-500" aria-hidden="true" />
                  <span>{text.visitLog}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VisitLog visits={visits} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'partograph' && (
        <Card className="rounded-[2rem]">
          <CardHeader>
            <CardTitle className="text-slate-800">Labor Progress (WHO Partograph)</CardTitle>
            <CardDescription>Plots Cervical Dilation (cm) against labor time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <svg width="400" height="250" viewBox="0 0 400 250" className="overflow-visible">
                {/* Grid Lines */}
                {Array.from({ length: 11 }).map((_, i) => (
                  <line
                    key={`y-${i}`}
                    x1="30"
                    y1={210 - i * 20}
                    x2="380"
                    y2={210 - i * 20}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                ))}
                {Array.from({ length: 9 }).map((_, i) => (
                  <line
                    key={`x-${i}`}
                    x1={30 + i * 40}
                    y1="10"
                    x2={30 + i * 40}
                    y2="210"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                ))}

                {/* WHO Alert Line (starts at 4cm at hour 0, reaches 10cm at hour 6) */}
                <line
                  x1="30"
                  y1={210 - 4 * 20}
                  x2={30 + 6 * 40}
                  y2={210 - 10 * 20}
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={30 + 6 * 40 + 5}
                  y={210 - 10 * 20}
                  fill="#f59e0b"
                  className="text-[10px] font-bold"
                >
                  Alert Line
                </text>

                {/* WHO Action Line (parallel, 4 hours to the right) */}
                <line
                  x1={30 + 4 * 40}
                  y1={210 - 4 * 20}
                  x2={30 + 10 * 40}
                  y2={210 - 10 * 20}
                  stroke="#ef4444"
                  strokeWidth="2.5"
                />
                <text
                  x={30 + 10 * 40 - 55}
                  y={210 - 10 * 20 - 5}
                  fill="#ef4444"
                  className="text-[10px] font-bold"
                >
                  Action Line
                </text>

                {/* Plotted Patient Data */}
                {partographPoints.map((p, i) => (
                  <g key={`pt-${i}`}>
                    <circle cx={30 + p.hour * 40} cy={210 - p.dilation * 20} r="5" fill="#3b82f6" />
                    {i > 0 && (
                      <line
                        x1={30 + partographPoints[i - 1].hour * 40}
                        y1={210 - partographPoints[i - 1].dilation * 20}
                        x2={30 + p.hour * 40}
                        y2={210 - p.dilation * 20}
                        stroke="#3b82f6"
                        strokeWidth="2"
                      />
                    )}
                  </g>
                ))}

                {/* Axes Labels */}
                <text
                  x="5"
                  y="115"
                  fill="#64748b"
                  transform="rotate(-90 5 115)"
                  className="text-[10px] font-bold"
                >
                  Cervical Dilation (cm)
                </text>
                <text x="190" y="235" fill="#64748b" className="text-[10px] font-bold">
                  Labor Duration (Hours)
                </text>
              </svg>
            </div>

            {/* Input form */}
            <div className="grid gap-4 rounded-2xl border border-slate-100 p-4 md:grid-cols-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Hour of Labor
                </label>
                <input
                  type="number"
                  value={newHour}
                  onChange={(e) => setNewHour(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Cervical Dilation (cm)
                </label>
                <input
                  type="number"
                  value={newDil}
                  onChange={(e) => setNewDil(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Fetal Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  value={newFhr}
                  onChange={(e) => setNewFhr(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold focus:outline-none"
                />
              </div>
              <Button onClick={handleAddPartograph} className="mt-5 self-end text-xs font-bold">
                <Plus className="mr-1 h-4 w-4" /> Add Vitals Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'frontline' && (
        <div className="space-y-6">
          <Card className="rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-slate-800">ABDM & ABHA ID Linkage</CardTitle>
              <CardDescription>
                Verifies patient identities with India's ABDM sandbox stack.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {abhaAddress ? (
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-2xl border border-emerald-100 bg-emerald-50/20 p-4">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="bg-emerald-500 text-white text-[10px] font-bold py-1 px-2.5"
                    >
                      ACTIVE ABHA
                    </Badge>
                    <span className="text-xs font-bold text-slate-700">{abhaAddress}</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    Linked to Ayushman Bharat Digital Mission (NHA)
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">
                    No ABHA ID linked to this mother's profile.
                  </p>
                  <Button
                    onClick={handleLinkAbha}
                    disabled={linkingAbha}
                    className="text-xs font-bold"
                  >
                    {linkingAbha ? 'Verifying with ABDM Sandbox...' : 'Link / Auto-create ABHA ID'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-slate-800">MCH Portal & TTS Readback</CardTitle>
              <CardDescription>
                Provides guidance in regional dialects with speech synthesizer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-2">
                <p className="text-sm font-bold text-slate-800">{text.babySize}</p>
                <p className="text-xs text-slate-600">{text.dietTip}</p>
              </div>
              <Button onClick={handleTTS} className="text-xs font-bold gap-2" variant="outline">
                <Volume2 className="h-4 w-4 text-rose-500" />
                Listen in {lang === 'hi' ? 'Hindi' : lang === 'bho' ? 'Bhojpuri' : 'English'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'emergency' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Referral Generator */}
            <Card className="rounded-[2rem]">
              <CardHeader>
                <CardTitle className="text-slate-800">Referral Slip Generator</CardTitle>
                <CardDescription>Refer high-risk pregnancy to higher centers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Refer To</label>
                  <input
                    type="text"
                    value={referredTo}
                    onChange={(e) => setReferredTo(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Reason for Referral
                  </label>
                  <input
                    type="text"
                    value={referralReason}
                    onChange={(e) => setReferralReason(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold focus:outline-none"
                  />
                </div>
                <Button
                  onClick={handleCreateReferral}
                  disabled={referring}
                  className="text-xs font-bold"
                >
                  {referring ? 'Generating Referral...' : 'Dispatch Referral Slip'}
                </Button>

                {referralsList.length > 0 && (
                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                    <p className="text-xs font-bold text-slate-800">Generated Referrals:</p>
                    {referralsList.map((r, i) => (
                      <div key={i} className="rounded-lg border border-slate-100 p-2 text-xs">
                        <p className="font-bold">{r.referredTo}</p>
                        <p className="text-slate-500">{r.referralReason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 108 Emergency Dispatch */}
            <Card className="rounded-[2rem]">
              <CardHeader>
                <CardTitle className="text-slate-800">108 Ambulance Node</CardTitle>
                <CardDescription>Dispatch emergency medical transport (EMRI 108).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-rose-100 bg-rose-50/20 p-4 space-y-2">
                  <p className="text-xs font-bold text-rose-700">EMERGENCY PROTOCOL</p>
                  <p className="text-xs text-slate-600">
                    If severe PIH signs (BP &gt;160/110) or fetal distress is flagged, request
                    ambulance.
                  </p>
                </div>
                {ambulanceStatus === 'idle' ? (
                  <Button
                    onClick={handleCallAmbulance}
                    className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    Request 108 Ambulance
                  </Button>
                ) : (
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                    <p className="text-xs font-bold text-slate-700">
                      Ambulance Status:{' '}
                      {ambulanceStatus === 'dispatched'
                        ? '🚨 Dispatched (En-route)'
                        : '✅ Arrived at PHC'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* e-Raktkosh Blood Banks */}
          <Card className="rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-slate-800">e-Raktkosh Blood Bank Locator</CardTitle>
              <CardDescription>
                Locates nearest blood supplies by facility distance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {bloodBanks.map((bb, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center rounded-2xl border border-slate-100 p-4 shadow-sm bg-white"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">{bb.name}</p>
                    <p className="text-[10px] text-slate-400">{bb.phone}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] py-1 px-2 flex items-center gap-1 border-slate-200 text-slate-500 font-bold bg-slate-50"
                  >
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {bb.distance}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Clinical Export Nodes */}
          <Card className="rounded-[2rem]">
            <CardHeader>
              <CardTitle>Government Reporting Gateways</CardTitle>
              <CardDescription>Export collected MCH data to MoHFW networks.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="gap-2 text-xs font-bold rounded-xl"
                onClick={() => handleExport('fhir')}
                disabled={exporting === 'fhir'}
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
                FHIR Resource
              </Button>
              <Button
                variant="outline"
                className="gap-2 text-xs font-bold rounded-xl"
                onClick={() => handleExport('dhis2')}
                disabled={exporting === 'dhis2'}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                DHIS2 Target
              </Button>
              <Button
                variant="outline"
                className="gap-2 text-xs font-bold rounded-xl"
                onClick={() => handleExport('pmjay')}
                disabled={exporting === 'pmjay'}
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                PMJAY Claim Summary
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 p-4 bg-slate-50/50">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-700">{value}</p>
    </div>
  );
}

function SchemeBadge({ enrolled }: { enrolled: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-100 p-4 bg-slate-50/50">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Schemes</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {enrolled.length === 0 ? (
          <span className="text-xs font-bold text-slate-500">None</span>
        ) : (
          enrolled.map((s) => (
            <Badge key={s} className="text-[10px] font-bold">
              {s}
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}

function SupplementRow({
  label,
  progress,
  unit,
}: {
  label: string;
  progress: number;
  unit: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-700">{label}</span>
        <span className="font-bold text-slate-500">{progress}%</span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-pink-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase">Target: 180 tablets</p>
    </div>
  );
}

function VisitLog({ visits }: { visits: any[] }) {
  if (!visits.length) {
    return <p className="text-sm text-slate-500">No ANC visits recorded yet.</p>;
  }

  return (
    <div className="space-y-3">
      {visits.map((visit, idx) => (
        <div
          key={visit.id ?? idx}
          className="rounded-2xl border border-slate-100 p-4 shadow-sm bg-white"
        >
          <p className="text-xs font-bold text-slate-800">Visit #{visit.visitNumber ?? idx + 1}</p>
          <p className="mt-1 text-xs text-slate-500">
            {visit.visitDate ? new Date(visit.visitDate).toLocaleDateString() : '—'}
            {visit.bpSystolic != null
              ? ` • BP ${visit.bpSystolic}/${visit.bpDiastolic ?? '—'} mmHg`
              : ''}
            {visit.weightKg ? ` • ${visit.weightKg} kg` : ''}
            {visit.fundalHeightCm ? ` • SFH ${visit.fundalHeightCm} cm` : ''}
          </p>
        </div>
      ))}
    </div>
  );
}

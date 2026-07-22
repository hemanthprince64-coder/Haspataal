/* eslint-disable */
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ShieldAlert, TrendingUp, Activity } from 'lucide-react';

interface BpTrendChartProps {
  visits: { visitDate: string; bpSystolic?: number; bpDiastolic?: number; gestationalAge?: number }[];
}

type BpReading = { bpSystolic?: number; bpDiastolic?: number };

function evaluatePih(readings: BpReading[]): {
  isPih: boolean;
  isSevere: boolean;
  severity: string;
  recommendation: string[];
} {
  const last = readings[readings.length - 1];
  if (!last?.bpSystolic || !last?.bpDiastolic) {
    return { isPih: false, isSevere: false, severity: 'normal', recommendation: [] };
  }
  const isSevere = last.bpSystolic >= 160 || last.bpDiastolic >= 110;
  const isModerate = last.bpSystolic >= 140 || last.bpDiastolic >= 90;
  if (isSevere) {
    return {
      isPih: true,
      isSevere: true,
      severity: 'severe',
      recommendation: [
        'Immediate hospital referral required',
        'Monitor closely for eclampsia signs',
        'Antihypertensive medication needed',
      ],
    };
  }
  if (isModerate) {
    return {
      isPih: true,
      isSevere: false,
      severity: 'mild',
      recommendation: [
        'Refer to District Hospital for further assessment',
        'Bed rest and BP monitoring every 4 hours',
        'Check urine protein',
      ],
    };
  }
  return { isPih: false, isSevere: false, severity: 'normal', recommendation: [] };
}

export default function BpTrendChart({ visits }: BpTrendChartProps) {
  const bpReadings = visits.filter((v) => v.bpSystolic && v.bpDiastolic);

  if (bpReadings.length === 0) {
    return (
      <Card className="rounded-[2rem] border-slate-200/60 shadow-xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
          <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-pink-600" /> BP Trend
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">Blood pressure monitoring for PIH detection</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-slate-500 text-sm italic">No BP readings recorded yet.</p>
        </CardContent>
      </Card>
    );
  }

  const latest = bpReadings[bpReadings.length - 1];
  const pihResult = evaluatePih(bpReadings);


  return (
    <Card className="rounded-[2rem] border-slate-200/60 shadow-xl overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
        <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
          <Activity className="w-5 h-5 text-pink-600" /> Blood Pressure Trend
        </CardTitle>
        <CardDescription className="text-slate-500 font-medium">
          Latest: {latest.bpSystolic}/{latest.bpDiastolic} mmHg (Week {latest.gestationalAge || '?'})
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* PIH Alert Banner */}
        {pihResult.isPih && (
          <div className={`p-4 rounded-xl border ${pihResult.isSevere ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {pihResult.isSevere ? (
                <ShieldAlert className="w-5 h-5 text-rose-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              )}
              <p className="font-black text-slate-800">
                {pihResult.isSevere ? 'SEVERE Hypertension Detected' : 'Moderate Hypertension Detected'}
              </p>
            </div>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
              {pihResult.recommendation.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {/* BP Readings Timeline */}
        <div className="space-y-3">
          {bpReadings.map((reading, idx) => {
            const isLatest = idx === bpReadings.length - 1;
            const isHigh = reading.bpSystolic >= 140 || reading.bpDiastolic >= 90;
            return (
              <div key={idx} className={`flex items-center gap-4 p-3 rounded-xl border ${isLatest ? 'bg-pink-50 border-pink-200' : 'bg-slate-50 border-slate-100'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isHigh ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {isHigh ? <AlertTriangle className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-slate-800">
                    {new Date(reading.visitDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} — Week {reading.gestationalAge || '?'}
                  </p>
                  <p className={`text-xs font-bold ${isHigh ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {reading.bpSystolic}/{reading.bpDiastolic} mmHg
                  </p>
                </div>
                {isLatest && pihResult.isPih && (
                  <Badge className={`${pihResult.isSevere ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                    {pihResult.severity}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        {/* PIH Threshold Reference */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Threshold Reference (Bihar NHM Protocol)</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="font-medium text-slate-600">Normal: &lt;140/90 mmHg</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="font-medium text-slate-600">Moderate: ≥140/90 (twice, 4h apart)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="font-medium text-slate-600">Severe: ≥160/110 mmHg</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

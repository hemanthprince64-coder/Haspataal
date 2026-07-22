/* eslint-disable */
'use client';

import { AlertTriangle } from 'lucide-react';
import { Line } from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface GrowthChartProps {
  visits: {
    visitDate: string;
    weightKg?: number;
    fundalHeightCm?: number;
    gestationalAge?: number;
  }[];
  type: 'weight' | 'sfh' | 'kicks';
}

export default function GrowthChart({ visits, type }: GrowthChartProps) {
  const data = visits
    .filter((v) => {
      if (type === 'weight') return v.weightKg;
      if (type === 'sfh') return v.fundalHeightCm;
      return true;
    })
    .map((v) => ({
      week: v.gestationalAge || 0,
      value: type === 'weight' ? v.weightKg : v.fundalHeightCm || 0,
      date: new Date(v.visitDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    }));

  const getReferenceRange = (week: number) => {
    if (type === 'weight') {
      // ICMR Indian norms for gestational weight gain by pre-pregnancy BMI
      // Simplified: total gain 7-12 kg for normal BMI
      const expectedTotal = 10;
      const weeklyGain = expectedTotal / 40;
      const min = Math.max(0, weeklyGain * week - 2);
      const max = weeklyGain * week + 2;
      return { min, max, unit: 'kg' };
    } else if (type === 'sfh') {
      // SFH in cm ≈ gestational age in weeks (1:1 rule)
      const expected = week;
      const min = expected - 2;
      const max = expected + 2;
      return { min, max, unit: 'cm' };
    }
    return { min: 10, max: 20, unit: 'kicks' };
  };

  const config = {
    weight: {
      title: 'Maternal Weight Gain',
      description: 'ICMR Indian norms — total gain 7-12 kg for normal BMI',
      icon: '⚖️',
      unit: 'kg',
    },
    sfh: {
      title: 'Symphysiofundal Height',
      description: 'SFH in cm ≈ gestational age in weeks (±2 cm acceptable)',
      icon: '📏',
      unit: 'cm',
    },
    kicks: {
      title: 'Fetal Kick Count (Cardiff)',
      description: '≥10 kicks in 12 hours from 28 weeks',
      icon: '👶',
      unit: 'kicks/12h',
    },
  }[type];

  return (
    <Card className="rounded-[2rem] border-slate-200/60 shadow-xl overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
        <CardTitle className="text-xl font-black tracking-tight">
          {config.icon} {config.title}
        </CardTitle>
        <CardDescription className="text-slate-500 font-medium">
          {config.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {data.length === 0 ? (
          <p className="text-slate-500 text-sm italic">
            No data recorded yet. Add visit records to see trends.
          </p>
        ) : (
          <div className="space-y-4">
            {data.map((reading, idx) => {
              const range = getReferenceRange(reading.week);
              const isOutsideRange = reading.value < range.min || reading.value > range.max;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold text-sm">
                    W{reading.week}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-800">
                      {reading.date} — {reading.value} {config.unit}
                    </p>
                    <p className="text-xs text-slate-500">
                      Expected: {range.min}–{range.max} {config.unit}
                    </p>
                  </div>
                  {isOutsideRange && (
                    <Badge className="bg-amber-100 text-amber-700">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Outside range
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import {
  Calendar,
  Stethoscope,
  Pill,
  TestTube,
  CreditCard,
  ArrowRightLeft,
  Sparkles,
  Activity,
} from 'lucide-react';

import React from 'react';

import { Card } from '@/components/ui/card';

interface TimelineEvent {
  id: string;
  date: string;
  type: 'opd' | 'lab' | 'pharmacy' | 'billing' | 'referral' | 'triage';
  title: string;
  subtitle: string;
  notes?: string;
  details?: { label: string; value: string }[];
}

interface SpecialityTimelineProps {
  patientName: string;
  patientAge: string;
  patientGender: string;
  events: TimelineEvent[];
}

export default function SpecialityTimeline({
  patientName,
  patientAge,
  patientGender,
  events,
}: SpecialityTimelineProps) {
  const getIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'opd':
        return <Stethoscope className="h-4 w-4 text-blue-600" />;
      case 'lab':
        return <TestTube className="h-4 w-4 text-purple-600" />;
      case 'pharmacy':
        return <Pill className="h-4 w-4 text-emerald-600" />;
      case 'billing':
        return <CreditCard className="h-4 w-4 text-amber-600" />;
      case 'referral':
        return <ArrowRightLeft className="h-4 w-4 text-indigo-600" />;
      case 'triage':
        return <Activity className="h-4 w-4 text-rose-600" />;
      default:
        return <Calendar className="h-4 w-4 text-slate-600" />;
    }
  };

  const getBadgeColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'opd':
        return 'bg-blue-50 text-blue-800 border-blue-100';
      case 'lab':
        return 'bg-purple-50 text-purple-800 border-purple-100';
      case 'pharmacy':
        return 'bg-emerald-50 text-emerald-800 border-emerald-100';
      case 'billing':
        return 'bg-amber-50 text-amber-800 border-amber-100';
      case 'referral':
        return 'bg-indigo-50 text-indigo-800 border-indigo-100';
      case 'triage':
        return 'bg-rose-50 text-rose-800 border-rose-100';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-100';
    }
  };

  return (
    <Card className="p-6 border border-slate-200 rounded-3xl shadow-sm bg-white">
      {/* Patient Header Brief */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 text-lg">{patientName}</h3>
            <span className="text-xs text-slate-500 font-medium">
              {patientAge} yrs · {patientGender}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Unified Electronic Health Record (EHR)</p>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
          <Sparkles className="h-3 w-3" /> AI Synced
        </span>
      </div>

      {/* Timeline Scroll area */}
      <div className="relative border-l border-slate-100 ml-4 pl-6 space-y-6">
        {events.map((event) => (
          <div key={event.id} className="relative">
            {/* Dot Indicator */}
            <span className="absolute -left-10 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-100 shadow-sm ring-4 ring-white">
              {getIcon(event.type)}
            </span>

            {/* Event Content */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getBadgeColor(event.type)}`}
                  >
                    {event.type}
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm">{event.title}</h4>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">{event.date}</span>
              </div>

              <p className="text-xs text-slate-500 font-medium">{event.subtitle}</p>

              {event.notes && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-600 italic">
                  &ldquo;{event.notes}&rdquo;
                </div>
              )}

              {event.details && event.details.length > 0 && (
                <div className="grid grid-cols-2 gap-2 bg-slate-50/50 border border-slate-100/50 rounded-xl p-3 text-[11px] text-slate-600">
                  {event.details.map((d, i) => (
                    <div
                      key={i}
                      className="flex justify-between border-b border-slate-100/50 pb-1 last:border-0 last:pb-0"
                    >
                      <span className="text-slate-400">{d.label}:</span>
                      <span className="font-semibold text-slate-700">{d.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            <Calendar className="h-8 w-8 text-slate-200 mx-auto mb-1.5" />
            <p className="text-xs font-semibold">No medical history logged yet</p>
          </div>
        )}
      </div>
    </Card>
  );
}

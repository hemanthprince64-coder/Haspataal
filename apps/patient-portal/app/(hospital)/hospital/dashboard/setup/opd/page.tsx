/* eslint-disable */
'use client';

import {
  Zap,
  Clock,
  Settings,
  Monitor,
  ShieldAlert,
  Calendar,
  Ticket,
  UserCheck,
  MessageSquare,
  ArrowRight,
  Check,
  Loader2,
  Info,
  LayoutGrid,
  Globe,
  Smartphone,
  Phone,
  Share2,
  AlertCircle,
  Timer,
  Coffee,
  Ban,
  Banknote,
  Tv,
} from 'lucide-react';
import { toast } from 'sonner';

import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function OpdSetupPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<any>({
    tokenMode: 'AUTO',
    tokenPrefix: 'OPD',
    resetDaily: true,
    displayQueueOnTV: false,
    showEstimatedWait: true,
    allowWalkIn: true,
    allowOnline: true,
    allowPhone: true,
    allowReferral: false,
    avgConsultationMinutes: 15,
    slotBufferMinutes: 5,
    dailySlotCap: null,
    lunchBreakStart: '13:00',
    lunchBreakEnd: '14:00',
    noShowPolicy: 'WARN',
    noShowFee: 0,
    enableSmartSlots: true,
  });

  useEffect(() => {
    fetch('/api/hospital/opd-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.config) setConfig(data.config);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/hospital/opd-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error();
      toast.success('OPD Engine configurations updated');
    } catch {
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 opacity-20" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-blue-600 rounded-[1.5rem] shadow-2xl shadow-blue-100">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">OPD Engine</h1>
            <p className="text-sm text-slate-500 font-medium">
              Calibrate token distribution, scheduling buffers, and booking protocols
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-slate-900 hover:bg-black h-12 px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-200"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          Sync OPD Protocol
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-10">
        {/* Left Column: Core Engine */}
        <div className="col-span-12 lg:col-span-7 space-y-10">
          {/* Section 1: Token Generation Engine */}
          <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Ticket className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-black text-slate-800 tracking-tight">
                  Token Allocation Logic
                </h2>
              </div>
              <Badge
                variant="outline"
                className="bg-white border-blue-200 text-blue-600 font-black text-[10px] h-6 px-3"
              >
                v4.2 PRO
              </Badge>
            </div>
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Generation Mode
                  </label>
                  <Select
                    value={config.tokenMode}
                    onValueChange={(v: string) => setConfig({ ...config, tokenMode: v })}
                  >
                    <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-bold bg-slate-50/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="AUTO" className="font-bold">
                        Automated Sequential
                      </SelectItem>
                      <SelectItem value="MANUAL" className="font-bold">
                        Manual Triage Override
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Identity Prefix
                  </label>
                  <Input
                    value={config.tokenPrefix}
                    onChange={(e) =>
                      setConfig({ ...config, tokenPrefix: e.target.value.toUpperCase() })
                    }
                    className="h-14 rounded-2xl border-slate-200 font-black text-lg uppercase px-6"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="flex gap-4">
                  <Clock className="h-6 w-6 text-slate-400" />
                  <div>
                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest leading-none mb-1">
                      Daily Sequence Reset
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Purge queue and restart tokens from 1 at midnight
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config.resetDaily}
                  onCheckedChange={(v: boolean) => setConfig({ ...config, resetDaily: v })}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Clinical Slot Template */}
          <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-black text-slate-800 tracking-tight">
                  Scheduling Template
                </h2>
              </div>
            </div>
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Timer className="h-3 w-3 text-blue-600" /> Consultation Duration
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={config.avgConsultationMinutes}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          avgConsultationMinutes: parseInt(e.target.value) || 0,
                        })
                      }
                      className="h-14 rounded-2xl border-slate-200 font-black text-lg pr-12 px-6"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">
                      MIN
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <ArrowRight className="h-3 w-3 text-slate-400" /> Buffer Between Slots
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={config.slotBufferMinutes}
                      onChange={(e) =>
                        setConfig({ ...config, slotBufferMinutes: parseInt(e.target.value) || 0 })
                      }
                      className="h-14 rounded-2xl border-slate-200 font-black text-lg pr-12 px-6"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">
                      MIN
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Coffee className="h-3 w-3 text-blue-600" /> Recess Start
                  </label>
                  <Input
                    type="time"
                    value={config.lunchBreakStart}
                    onChange={(e) => setConfig({ ...config, lunchBreakStart: e.target.value })}
                    className="h-14 rounded-2xl border-slate-200 font-bold bg-slate-50/30"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Coffee className="h-3 w-3 text-slate-400" /> Recess End
                  </label>
                  <Input
                    type="time"
                    value={config.lunchBreakEnd}
                    onChange={(e) => setConfig({ ...config, lunchBreakEnd: e.target.value })}
                    className="h-14 rounded-2xl border-slate-200 font-bold bg-slate-50/30"
                  />
                </div>
              </div>

              <div className="p-6 bg-blue-50/30 rounded-[2rem] border border-blue-100 flex items-center justify-between">
                <div className="flex gap-4">
                  <Zap className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest leading-none mb-1">
                      Smart Slot Engine
                    </p>
                    <p className="text-[10px] text-blue-800 font-medium">
                      Dynamic duration scaling based on live doctor speed
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config.enableSmartSlots}
                  onCheckedChange={(v: boolean) => setConfig({ ...config, enableSmartSlots: v })}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Channels & Policies */}
        <div className="col-span-12 lg:col-span-5 space-y-10">
          {/* Section 3: Booking Channels */}
          <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                Booking Multi-Channel
              </h2>
            </div>
            <div className="p-10 space-y-4">
              {[
                {
                  id: 'allowOnline',
                  label: 'Online Web / App',
                  icon: Globe,
                  sub: 'Public facing booking engine',
                },
                {
                  id: 'allowWalkIn',
                  label: 'Walk-in / Offline',
                  icon: UserCheck,
                  sub: 'On-premises front desk tokens',
                },
                {
                  id: 'allowPhone',
                  label: 'Telephonic Booking',
                  icon: Phone,
                  sub: 'IVR or receptionist assisted',
                },
                {
                  id: 'allowReferral',
                  label: 'Partner Referrals',
                  icon: Share2,
                  sub: 'Priority B2B clinical transfers',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-5 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                >
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-none mb-1">
                        {item.label}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">{item.sub}</p>
                    </div>
                  </div>
                  <Switch
                    checked={config[item.id]}
                    onCheckedChange={(v: boolean) => setConfig({ ...config, [item.id]: v })}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Operational Policy */}
          <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-800 tracking-tight">No-Show Policy</h2>
              <Ban className="h-5 w-5 text-rose-500" />
            </div>
            <div className="p-10 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Enforcement Strategy
                </label>
                <Select
                  value={config.noShowPolicy}
                  onValueChange={(v: string) => setConfig({ ...config, noShowPolicy: v })}
                >
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="NONE" className="font-medium">
                      No Action
                    </SelectItem>
                    <SelectItem value="WARN" className="font-medium">
                      Patient Warning Badge
                    </SelectItem>
                    <SelectItem value="BLOCK" className="font-medium">
                      Systemic Block (3 Strikes)
                    </SelectItem>
                    <SelectItem value="FEE" className="font-medium">
                      Financial Penalty (Auto-bill)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {config.noShowPolicy === 'FEE' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Banknote className="h-3 w-3 text-emerald-600" /> Penalty Amount (₹)
                  </label>
                  <Input
                    type="number"
                    value={config.noShowFee}
                    onChange={(e) =>
                      setConfig({ ...config, noShowFee: parseFloat(e.target.value) || 0 })
                    }
                    className="h-12 rounded-xl border-slate-200 font-black text-lg text-emerald-600"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Section 5: Experience & Display */}
          <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <h3 className="text-lg font-black tracking-tight mb-6 flex items-center gap-3">
                <Tv className="h-5 w-5 text-blue-400" /> Display Experience
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold leading-none mb-1">Queue TV Integration</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Broadcast live queue to lobby monitors
                  </p>
                </div>
                <Switch
                  checked={config.displayQueueOnTV}
                  onCheckedChange={(v: boolean) => setConfig({ ...config, displayQueueOnTV: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold leading-none mb-1">Estimated Wait Times</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Display wait metrics on patient apps
                  </p>
                </div>
                <Switch
                  checked={config.showEstimatedWait}
                  onCheckedChange={(v: boolean) => setConfig({ ...config, showEstimatedWait: v })}
                />
              </div>

              <div className="pt-6 border-t border-white/10">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex gap-4">
                  <AlertCircle className="h-5 w-5 text-blue-400 shrink-0" />
                  <p className="text-[10px] text-slate-300 font-medium leading-relaxed">
                    Display templates are controlled via the <strong>TV Broadcaster</strong> module.
                    Ensure your lobby hardware is compatible with Haspataal Cast.
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <Monitor className="h-48 w-48" />
            </div>
          </section>
        </div>
      </div>

      {/* Persistent Info Footer */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-50">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 flex items-center justify-between backdrop-blur-xl bg-white/90">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none mb-1">
                Validation Ready
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                Settings will propagate instantly to all booking channels.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="rounded-xl h-12 px-6 font-bold text-slate-500">
              Discard
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 h-12 px-10 rounded-xl font-black uppercase text-xs tracking-widest text-white"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Commit Engine Config'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

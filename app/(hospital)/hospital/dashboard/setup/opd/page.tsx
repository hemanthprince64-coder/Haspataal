"use client";

import { useState, useEffect } from "react";
import { Calendar, Monitor, Users, Bell, Zap, Save, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function OpdSetupPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/hospital/opd-config")
      .then(r => r.json())
      .then(data => setConfig(data.config || {
        tokenMode: "AUTO",
        tokenPrefix: "OPD",
        resetDaily: true,
        displayQueueOnTV: false,
        allowWalkIn: true,
        allowOnline: true,
        avgConsultationMinutes: 15,
        noShowPolicy: "WARN",
        enableSmartSlots: false
      }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/hospital/opd-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  if (loading) return <div className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">OPD Workflow Configuration</h1>
            <p className="text-xs text-slate-500">Configure queue management, token logic, and patient flow</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Configuration"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Token Management */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Token Logic</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Token Generation Mode</label>
              <div className="flex gap-2">
                {["AUTO", "MANUAL"].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setConfig({...config, tokenMode: mode})}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      config.tokenMode === mode ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Token Prefix</label>
                <Input value={config.tokenPrefix} onChange={e => setConfig({...config, tokenPrefix: e.target.value.toUpperCase()})} placeholder="OPD" maxLength={4} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Reset Daily</span>
                <Switch checked={config.resetDaily} onCheckedChange={v => setConfig({...config, resetDaily: v})} />
              </div>
            </div>
          </div>
        </div>

        {/* Display & TV */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="h-4 w-4 text-purple-600" />
            <h2 className="text-sm font-bold text-slate-900">Front Desk & TV Display</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-xs font-bold text-slate-800">Display Queue on TV</p>
                <p className="text-[10px] text-slate-500">Enable /hospital/tv endpoint</p>
              </div>
              <Switch checked={config.displayQueueOnTV} onCheckedChange={v => setConfig({...config, displayQueueOnTV: v})} />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-xs font-bold text-slate-800">Show Estimated Wait</p>
                <p className="text-[10px] text-slate-500">Calculate based on avg time</p>
              </div>
              <Switch checked={config.showEstimatedWait} onCheckedChange={v => setConfig({...config, showEstimatedWait: v})} />
            </div>
          </div>
        </div>

        {/* Booking Channels */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-green-600" />
            <h2 className="text-sm font-bold text-slate-900">Booking Channels</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Walk-in", key: "allowWalkIn" },
              { label: "Online", key: "allowOnline" },
              { label: "Phone", key: "allowPhone" },
              { label: "Referral", key: "allowReferral" }
            ].map(ch => (
              <div key={ch.key} className="flex items-center justify-between p-2 border border-slate-100 rounded-lg">
                <span className="text-xs font-medium text-slate-700">{ch.label}</span>
                <Switch checked={config[ch.key]} onCheckedChange={v => setConfig({...config, [ch.key]: v})} />
              </div>
            ))}
          </div>
        </div>

        {/* Smart Rules */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-4 w-4 text-orange-600" />
            <h2 className="text-sm font-bold text-slate-900">Smart Rules & No-Show</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Avg Consultation (Mins)</label>
              <Input type="number" value={config.avgConsultationMinutes} onChange={e => setConfig({...config, avgConsultationMinutes: parseInt(e.target.value)})} />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-xs font-bold text-slate-800">Smart Slots (AI)</p>
                <p className="text-[10px] text-slate-500">Optimize based on doctor speed</p>
              </div>
              <Switch checked={config.enableSmartSlots} onCheckedChange={v => setConfig({...config, enableSmartSlots: v})} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

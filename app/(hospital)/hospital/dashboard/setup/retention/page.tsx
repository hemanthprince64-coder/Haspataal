"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Plus, Trash2, Play, Pause, Bell, Calendar, Activity, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface Rule {
  id: string;
  name: string;
  trigger: { type: string; daysAfter: number; condition?: string };
  action: { type: string; templateId?: string; assignToQueue?: string };
  isActive: boolean;
  priority: string;
}

export default function RetentionSetupPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetch("/api/hospital/retention/rules")
      .then(r => r.json())
      .then(data => setRules(data.rules ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleAddRule = async (form: any) => {
    const res = await fetch("/api/hospital/retention/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.rule) setRules(prev => [...prev, data.rule]);
    setDialogOpen(false);
  };

  const handleToggle = async (id: string, active: boolean) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: active } : r));
    await fetch(`/api/hospital/retention/rules/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: active }),
    });
  };

  const handleRemove = async (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    await fetch(`/api/hospital/retention/rules/${id}`, { method: "DELETE" });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl">
            <RefreshCw className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Retention & Recall Engine</h1>
            <p className="text-xs text-slate-500">Automate patient follow-ups to recapture revenue and improve care</p>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="h-4 w-4" /> New Retention Rule
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2 text-blue-600">
            <Activity className="h-4 w-4" />
            <span className="text-xs font-bold uppercase">Recall Potential</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">₹4.2L</p>
          <p className="text-[10px] text-slate-500">Estimated monthly recapturable revenue</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs font-bold uppercase">Active Rules</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{rules.filter(r => r.isActive).length}</p>
          <p className="text-[10px] text-slate-500">Automated triggers running daily</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2 text-orange-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-bold uppercase">Lapsed Patients</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">184</p>
          <p className="text-[10px] text-slate-500">Patients due for follow-up this week</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-400" /></div>
      ) : rules.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <RefreshCw className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">No retention rules configured</p>
          <p className="text-xs text-slate-400 mb-6">Create rules like "30-day post-surgery recall" or "Chronic diabetic follow-up"</p>
          <Button variant="outline" onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Your First Rule
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map(rule => (
            <div key={rule.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${rule.isActive ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"}`}>
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{rule.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-slate-50">
                      {rule.trigger.daysAfter} days after {rule.trigger.type}
                    </Badge>
                    <span className="text-[10px] text-slate-400">→</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-600 border-blue-200">
                      {rule.action.type}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold ${rule.isActive ? "text-green-600" : "text-slate-400"}`}>
                    {rule.isActive ? "RUNNING" : "PAUSED"}
                  </span>
                  <Switch checked={rule.isActive} onCheckedChange={(v) => handleToggle(rule.id, v)} />
                </div>
                <button onClick={() => handleRemove(rule.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <RuleDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleAddRule} />
    </div>
  );
}

function RuleDialog({ open, onClose, onSave }: any) {
  const [form, setForm] = useState({
    name: "",
    triggerType: "CONSULTATION",
    triggerDays: 30,
    actionType: "WHATSAPP_REMINDER",
    priority: "MEDIUM"
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>New Retention Rule</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Rule Name</label>
            <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. 30 Day Post-OP Recall" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">After Activity</label>
              <select 
                value={form.triggerType} 
                onChange={e => setForm({...form, triggerType: e.target.value})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
              >
                <option value="CONSULTATION">Consultation</option>
                <option value="SURGERY">Surgery</option>
                <option value="DIAGNOSTICS">Diagnostics</option>
                <option value="ADMISSION">Discharge</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Days After</label>
              <Input type="number" value={form.triggerDays} onChange={e => setForm({...form, triggerDays: parseInt(e.target.value)})} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Automated Action</label>
            <select 
              value={form.actionType} 
              onChange={e => setForm({...form, actionType: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
            >
              <option value="WHATSAPP_REMINDER">WhatsApp Reminder</option>
              <option value="SMS_REMINDER">SMS Reminder</option>
              <option value="TASK_RECEPTIONIST">Create Receptionist Task</option>
              <option value="OFFER_DISCOUNT">Send Discount Coupon</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)} disabled={!form.name} className="bg-blue-600 text-white">Create Rule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

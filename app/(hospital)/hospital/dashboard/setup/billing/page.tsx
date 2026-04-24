"use client";

import { useState, useEffect } from "react";
import { CreditCard, Package, Shield, Plug, FileText, Plus, Search, Upload, Loader2, Check, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Service {
  id: string;
  code: string;
  name: string;
  type: string;
  basePrice: number;
  gstRate: number;
  isActive: boolean;
}

interface Gateway {
  id: string;
  provider: string;
  isLive: boolean;
  isActive: boolean;
  lastTestedAt?: string;
}

const SERVICE_TYPES = ["CONSULTATION", "PROCEDURE", "LAB_TEST", "IMAGING", "BED_CHARGE", "MEDICINE", "PACKAGE"];
const GST_RATES = [0, 5, 12, 18];

// ─── Service Dialog ───────────────────────────────────────────────────────────

function ServiceDialog({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (s: Partial<Service>) => void }) {
  const [form, setForm] = useState<Partial<Service>>({ type: "CONSULTATION", gstRate: 0, isActive: true });
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add Service</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Code *</label>
              <Input value={form.code ?? ""} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="CONS-001" className="font-mono" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Name *</label>
              <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="General Consultation" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Type</label>
            <select value={form.type ?? "CONSULTATION"} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none">
              {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Base Price (₹) *</label>
              <Input type="number" value={form.basePrice ?? ""} onChange={(e) => setForm({ ...form, basePrice: parseFloat(e.target.value) })} placeholder="500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">GST Rate</label>
              <select value={form.gstRate ?? 0} onChange={(e) => setForm({ ...form, gstRate: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none">
                {GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
              </select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={() => { onSave(form); onClose(); }} disabled={!form.code || !form.name || !form.basePrice}>
            Add Service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Tab: Service Catalog ─────────────────────────────────────────────────────

function ServiceCatalogTab() {
  const [services, setServices] = useState<Service[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetch("/api/hospital/billing/services").then(r => r.json()).then(d => setServices(d.services ?? [])).finally(() => setLoading(false));
  }, []);

  const handleAdd = async (s: Partial<Service>) => {
    const res = await fetch("/api/hospital/billing/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) });
    const data = await res.json();
    if (data.service) setServices(prev => [...prev, data.service]);
  };

  const filtered = services.filter(s => s.name.toLowerCase().includes(filter.toLowerCase()) || s.code.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search services..." className="pl-8" />
        </div>
        <Button size="sm" variant="outline" className="gap-1"><Upload className="h-3.5 w-3.5" /> Import CSV</Button>
        <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700 gap-1" onClick={() => setDialogOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Add Service
        </Button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Code", "Name", "Type", "Price", "GST", "Status"].map(h => (
                <th key={h} className="px-4 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin text-blue-400 mx-auto" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-slate-400">No services yet. Add your first billable service.</td></tr>
            ) : filtered.map(s => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-mono text-slate-500">{s.code}</td>
                <td className="px-4 py-2.5 font-semibold text-slate-800">{s.name}</td>
                <td className="px-4 py-2.5"><Badge variant="outline" className="text-[10px]">{s.type}</Badge></td>
                <td className="px-4 py-2.5 font-semibold text-green-700">₹{s.basePrice}</td>
                <td className="px-4 py-2.5 text-slate-500">{s.gstRate}%</td>
                <td className="px-4 py-2.5">
                  <Switch checked={s.isActive} onCheckedChange={async (v) => {
                    setServices(prev => prev.map(x => x.id === s.id ? { ...x, isActive: v } : x));
                    await fetch(`/api/hospital/billing/services/${s.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: v }) });
                  }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ServiceDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleAdd} />
    </div>
  );
}

// ─── Tab: Payment Gateways ────────────────────────────────────────────────────

function GatewayCard({ provider, label, fields }: { provider: string; label: string; fields: string[] }) {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [isLive, setIsLive] = useState(false);
  const [show, setShow] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"ok" | "error" | null>(null);
  const [saving, setSaving] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/hospital/billing/test-gateway", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, config }),
      });
      setTestResult(res.ok ? "ok" : "error");
    } catch { setTestResult("error"); }
    setTesting(false);
    setTimeout(() => setTestResult(null), 5000);
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/hospital/billing/gateways", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, config, isLive }),
    });
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">{label}</h3>
          <p className="text-xs text-slate-400">{provider}</p>
        </div>
        <div className="flex items-center gap-2">
          {testResult === "ok" && <span className="text-xs text-green-600 flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Connected</span>}
          {testResult === "error" && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> Error</span>}
        </div>
      </div>
      <div className="space-y-2 mb-4">
        {fields.map(f => (
          <div key={f}>
            <label className="text-xs font-semibold text-slate-600 block mb-1">{f}</label>
            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                value={config[f] ?? ""}
                onChange={e => setConfig(c => ({ ...c, [f]: e.target.value }))}
                placeholder={`Enter ${f}`}
                className="font-mono pr-10"
              />
              <button onClick={() => setShow(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
          <span className="text-xs text-slate-600 font-medium">{isLive ? "Live Mode" : "Test Mode"}</span>
          <Switch checked={isLive} onCheckedChange={setIsLive} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={handleTest} disabled={testing} className="flex-1">
          {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Test Connection"}
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 text-white hover:bg-blue-700">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
        </Button>
      </div>
    </div>
  );
}

// ─── Tab: Tax Configuration ────────────────────────────────────────────────────

function TaxConfigTab() {
  const [gstInclusive, setGstInclusive] = useState(false);
  const [saved, setSaved] = useState(false);

  const typeGstMap: Record<string, number> = {
    CONSULTATION: 0, PROCEDURE: 5, LAB_TEST: 5, IMAGING: 12, BED_CHARGE: 0, MEDICINE: 5, PACKAGE: 12,
  };

  return (
    <div className="max-w-lg">
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-4">GST Configuration</h3>
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg mb-4">
          <div>
            <p className="text-xs font-semibold text-slate-700">GST Inclusive Pricing</p>
            <p className="text-xs text-slate-400">Prices shown include GST</p>
          </div>
          <Switch checked={gstInclusive} onCheckedChange={setGstInclusive} />
        </div>
        <table className="w-full text-xs">
          <thead><tr className="border-b border-slate-100">
            <th className="text-left py-2 font-semibold text-slate-600">Service Type</th>
            <th className="text-right py-2 font-semibold text-slate-600">Default GST</th>
          </tr></thead>
          <tbody>
            {Object.entries(typeGstMap).map(([type, rate]) => (
              <tr key={type} className="border-b border-slate-50">
                <td className="py-2 text-slate-700">{type}</td>
                <td className="py-2 text-right font-semibold text-blue-600">{rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button className="w-full bg-blue-600 text-white" onClick={() => setSaved(true)}>
        {saved ? <><Check className="h-4 w-4 mr-1" /> Saved</> : "Save Tax Configuration"}
      </Button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "catalog", label: "Service Catalog", icon: FileText },
  { id: "tax", label: "Tax Configuration", icon: Shield },
  { id: "gateways", label: "Payment Gateways", icon: Plug },
  { id: "packages", label: "Package Bundles", icon: Package },
];

export default function BillingSetupPage() {
  const [activeTab, setActiveTab] = useState("catalog");

  const GATEWAYS = [
    { provider: "RAZORPAY", label: "Razorpay", fields: ["Key ID", "Key Secret"] },
    { provider: "UPI", label: "UPI / VPA", fields: ["VPA Address"] },
    { provider: "STRIPE", label: "Stripe", fields: ["Publishable Key", "Secret Key"] },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-50 rounded-xl">
          <CreditCard className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Billing System</h1>
          <p className="text-xs text-slate-500">Service catalog, tax config, payment gateways, packages</p>
        </div>
        <Badge className="ml-2 bg-red-100 text-red-700 text-xs">CRITICAL</Badge>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all
                ${activeTab === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "catalog" && <ServiceCatalogTab />}
      {activeTab === "tax" && <TaxConfigTab />}
      {activeTab === "gateways" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {GATEWAYS.map(g => <GatewayCard key={g.provider} {...g} />)}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <Plug className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-medium">Cash payments are always enabled</p>
            </div>
          </div>
        </div>
      )}
      {activeTab === "packages" && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">Package Bundles</p>
          <p className="text-xs text-slate-400 mb-4">Create bundles like "Delivery Package", "Cardiac Checkup Package"</p>
          <Button size="sm" className="bg-blue-600 text-white"><Plus className="h-3.5 w-3.5 mr-1" /> Create Bundle</Button>
        </div>
      )}
    </div>
  );
}

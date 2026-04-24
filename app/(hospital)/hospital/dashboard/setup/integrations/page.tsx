"use client";

import { useState, useEffect } from "react";
import { Plug, ShieldCheck, MessageSquare, Smartphone, Globe, Activity, Loader2, Check, X, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const PROVIDERS = [
  { id: "ABHA_ABDM", name: "ABHA / ABDM", category: "Govt Compliance", icon: ShieldCheck, fields: ["Facility ID", "Client ID", "Client Secret"] },
  { id: "WHATSAPP_META", name: "WhatsApp (Official)", category: "Messaging", icon: MessageSquare, fields: ["Phone Number ID", "WABA ID", "Access Token"] },
  { id: "WHATSAPP_WATI", name: "WATI", category: "Messaging", icon: MessageSquare, fields: ["API Endpoint", "Access Token"] },
  { id: "SMS_MSG91", name: "MSG91", category: "SMS", icon: Smartphone, fields: ["Auth Key", "Sender ID"] },
  { id: "GOOGLE_CALENDAR", name: "Google Calendar", category: "Scheduling", icon: Globe, fields: ["Client ID", "Client Secret"] },
];

export default function IntegrationsSetupPage() {
  const [activeConfigs, setActiveConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hospital/integrations")
      .then(r => r.json())
      .then(data => setActiveConfigs(data.configs ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-50 rounded-xl">
          <Plug className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Integration Layer</h1>
          <p className="text-xs text-slate-500">Connect external services, WhatsApp APIs, and ABHA compliance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROVIDERS.map(provider => (
          <IntegrationCard 
            key={provider.id} 
            provider={provider} 
            activeConfig={activeConfigs.find(c => c.provider === provider.id)}
          />
        ))}
      </div>
    </div>
  );
}

function IntegrationCard({ provider, activeConfig }: any) {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [isActive, setIsActive] = useState(activeConfig?.isActive ?? false);
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");

  const Icon = provider.icon;

  const handleSave = async () => {
    setSaving(true);
    setStatus("testing");
    try {
      const res = await fetch("/api/hospital/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: provider.id, config, isActive }),
      });
      setStatus(res.ok ? "ok" : "error");
    } catch {
      setStatus("error");
    }
    setSaving(false);
    setTimeout(() => setStatus("idle"), 5000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
      <div className="flex items-start justify-between mb-6">
        <div className="flex gap-3">
          <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{provider.name}</h3>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">{provider.category}</p>
          </div>
        </div>
        <Switch checked={isActive} onCheckedChange={setIsActive} />
      </div>

      <div className="space-y-3 flex-1 mb-6">
        {provider.fields.map((f: string) => (
          <div key={f}>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">{f}</label>
            <div className="relative">
              <Input 
                type={show ? "text" : "password"}
                value={config[f] ?? ""}
                onChange={e => setConfig(c => ({...c, [f]: e.target.value}))}
                placeholder={`Enter ${f}`}
                className="font-mono text-xs pr-10"
              />
              <button onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300">
                {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSave} 
          disabled={saving}
          className="flex-1"
        >
          {status === "testing" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 
           status === "ok" ? <Check className="h-3.5 w-3.5 text-green-500" /> : 
           status === "error" ? <AlertCircle className="h-3.5 w-3.5 text-red-500" /> : "Test & Save"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const PROVIDERS = [
  { value: "WHATSAPP_META", label: "WhatsApp Meta" },
  { value: "WHATSAPP_TWILIO", label: "WhatsApp Twilio" },
  { value: "SMS_MSG91", label: "SMS MSG91" },
  { value: "SMS_FAST2SMS", label: "SMS Fast2SMS" },
];

export default function NotificationSetupPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [provider, setProvider] = useState("WHATSAPP_META");
  const [senderId, setSenderId] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const res = await fetch("/api/hospital/integrations");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load notification providers");
    setConfigs((data.configs ?? []).filter((c: any) => c.provider.startsWith("WHATSAPP") || c.provider.startsWith("SMS")));
  };

  useEffect(() => {
    load().catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/hospital/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, isActive: true, config: { senderId, token } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save notification provider");
      await load();
      setToken("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-lg bg-sky-50 p-2">
          <Bell className="h-6 w-6 text-sky-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Notification Engine</h1>
          <p className="text-xs text-slate-500">Configure WhatsApp or SMS providers for reminders and patient alerts</p>
        </div>
      </div>

      {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold text-slate-800">Active Providers</h2>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          ) : configs.length === 0 ? (
            <p className="text-sm text-slate-500">No notification provider configured.</p>
          ) : (
            <div className="space-y-2">
              {configs.map((config) => (
                <div key={config.id} className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2">
                  <span className="text-sm font-medium text-slate-700">{config.provider.replaceAll("_", " ")}</span>
                  <Badge variant={config.isActive ? "default" : "secondary"} className="gap-1">
                    {config.isActive && <CheckCircle2 className="h-3 w-3" />}
                    {config.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold text-slate-800">Add or Update Provider</h2>
          <div className="space-y-3">
            <select
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              {PROVIDERS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <Input placeholder="Sender ID / Phone number ID" value={senderId} onChange={(event) => setSenderId(event.target.value)} />
            <Input placeholder="Access token / API key" type="password" value={token} onChange={(event) => setToken(event.target.value)} />
            <Button onClick={save} disabled={saving || !senderId || !token} className="gap-2 bg-sky-600 text-white hover:bg-sky-700">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Provider
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

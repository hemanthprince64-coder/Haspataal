"use client";

import { useState, useEffect } from "react";
import { Store, Globe, Eye, Image as ImageIcon, CheckCircle, Save, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function MarketplaceSetupPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/hospital/marketplace")
      .then(r => r.json())
      .then(data => setConfig(data.config || {
        isListedOnMarketplace: false,
        marketplaceTagline: "",
        marketplaceAbout: "",
        showConsultationFees: true,
        allowOnlineBooking: true,
        cancellationPolicy: "FLEXIBLE"
      }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/hospital/marketplace", {
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
          <div className="p-2 bg-orange-50 rounded-xl">
            <Store className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Marketplace Listing</h1>
            <p className="text-xs text-slate-500">Configure how your hospital appears on Haspataal.in public search</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : saved ? "Published!" : "Save & Publish"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Main Listing Toggle */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Public Visibility</h2>
                <p className="text-xs text-slate-500">List your hospital on the Haspataal.in marketplace</p>
              </div>
              <Switch checked={config.isListedOnMarketplace} onCheckedChange={v => setConfig({...config, isListedOnMarketplace: v})} />
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Public Tagline</label>
                <Input value={config.marketplaceTagline} onChange={e => setConfig({...config, marketplaceTagline: e.target.value})} placeholder="e.g. Most trusted multispecialty hospital in Bangalore" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">About (Public Profile)</label>
                <textarea 
                  value={config.marketplaceAbout} 
                  onChange={e => setConfig({...config, marketplaceAbout: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm min-h-[100px] focus:outline-none"
                  placeholder="Describe your hospital history, mission, and care standards..."
                />
              </div>
            </div>
          </div>

          {/* Patient Options */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Patient Acquisition Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Show Consult Fees", key: "showConsultationFees", icon: Info },
                { label: "Allow Online Booking", key: "allowOnlineBooking", icon: Globe },
                { label: "Show Bed Availability", key: "showBedCharges", icon: Info },
                { label: "Require Approval", key: "requiresApproval", icon: Info }
              ].map(opt => (
                <div key={opt.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-xs font-medium text-slate-700">{opt.label}</span>
                  <Switch checked={config[opt.key]} onCheckedChange={v => setConfig({...config, [opt.key]: v})} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar / Preview */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative">
            <div className="absolute top-2 right-2">
              <Badge className="bg-orange-500 text-white border-none">PREVIEW</Badge>
            </div>
            <Globe className="h-12 w-12 text-slate-700 mb-4" />
            <h3 className="text-lg font-bold mb-1">{config.marketplaceTagline || "Your Hospital Name"}</h3>
            <p className="text-xs text-slate-400 line-clamp-3 mb-4">{config.marketplaceAbout || "Listing description will appear here..."}</p>
            <div className="space-y-2">
              <div className="h-1 w-full bg-slate-800 rounded-full" />
              <div className="h-1 w-2/3 bg-slate-800 rounded-full" />
            </div>
            <Button variant="outline" className="w-full mt-6 bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
              <Eye className="h-3.5 w-3.5 mr-2" /> Live Profile
            </Button>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-xs font-bold text-blue-800 mb-2 uppercase">Ranking Boost</h3>
            <p className="text-[10px] text-blue-600 mb-4">Complete your profile to rank higher in local search results.</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-blue-700 font-medium">
                <CheckCircle className="h-3 w-3" /> Add 5+ Services
              </div>
              <div className="flex items-center gap-2 text-[10px] text-blue-700 font-medium">
                <CheckCircle className="h-3 w-3" /> Upload Ward Photos
              </div>
              <div className="flex items-center gap-2 text-[10px] text-blue-700 font-medium">
                <CheckCircle className="h-3 w-3" /> Verify GST/Legal
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

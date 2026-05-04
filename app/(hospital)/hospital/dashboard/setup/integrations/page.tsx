'use client';

import { useState, useEffect } from 'react';
import {
  Globe,
  Plus,
  Search,
  Filter,
  MessageSquare,
  Smartphone,
  CreditCard,
  Calendar,
  ShieldCheck,
  Zap,
  Lock,
  Layout,
  Bell,
  Code,
  Settings,
  History,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Smartphone as SmsIcon,
  MessageCircle,
  Mail,
  CreditCard as PaymentIcon,
  Globe as WebIcon,
  Fingerprint,
  Bot,
  Terminal,
  Briefcase,
  Layers,
  Package,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Integration {
  id: string;
  provider: string;
  isActive: boolean;
  isLive: boolean;
  testMode: boolean;
  webhookUrl?: string;
}

interface Template {
  id: string;
  name: string;
  channel: string;
  body: string;
  language: string;
  isApproved: boolean;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CommunicationsIntegrationsPage() {
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeTab, setActiveTab] = useState('messaging');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [intRes, tempRes] = await Promise.all([
          fetch('/api/hospital/integrations'),
          fetch('/api/hospital/notifications/templates'),
        ]);
        const [intData, tempData] = await Promise.all([intRes.json(), tempRes.json()]);
        setIntegrations(intData.configs ?? []);
        setTemplates(tempData.templates ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getProviderStatus = (provider: string) => {
    return integrations.find((i) => i.provider === provider);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-slate-900 rounded-[1.5rem] shadow-2xl shadow-slate-100">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
              Communications & Node Logic
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Orchestrate messaging providers, payment gateways, and clinical webhooks
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-12 px-6 rounded-2xl border-slate-200 font-bold text-slate-600 bg-white"
          >
            <Terminal className="h-4 w-4 mr-2" /> Webhook Logs
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 h-12 px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100">
            Infrastructure Audit <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
        <TabsList className="bg-white p-1 rounded-2xl border border-slate-200 h-16 shadow-sm inline-flex">
          <TabsTrigger
            value="messaging"
            className="rounded-xl px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest"
          >
            Messaging & Templates
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="rounded-xl px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest"
          >
            Revenue Gateways
          </TabsTrigger>
          <TabsTrigger
            value="compliance"
            className="rounded-xl px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest"
          >
            Gov & Compliance
          </TabsTrigger>
          <TabsTrigger
            value="sync"
            className="rounded-xl px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest"
          >
            Sync & Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="messaging"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12"
        >
          {/* Provider Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                id: 'WHATSAPP_META',
                name: 'WhatsApp Meta',
                icon: MessageCircle,
                color: 'text-emerald-500',
                desc: 'Official Cloud API for transactional alerts.',
              },
              {
                id: 'SMS_MSG91',
                name: 'MSG91 (India)',
                icon: SmsIcon,
                color: 'text-orange-500',
                desc: 'Transactional SMS with DLT compliance.',
              },
              {
                id: 'EMAIL_SES',
                name: 'AWS SES (Email)',
                icon: Mail,
                color: 'text-blue-500',
                desc: 'Discharge summaries & lab reports via email.',
              },
            ].map((prov) => {
              const status = getProviderStatus(prov.id);
              return (
                <div
                  key={prov.id}
                  className="bg-white rounded-[2.5rem] border border-slate-200 p-8 hover:shadow-2xl transition-all duration-500 group"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div
                      className={`h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center ${prov.color}`}
                    >
                      <prov.icon className="h-7 w-7" />
                    </div>
                    <Badge
                      className={`text-[9px] font-black px-2 h-5 border-none ${status?.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}
                    >
                      {status?.isActive ? 'CONNECTED' : 'DISCONNECTED'}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">{prov.name}</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8">
                    {prov.desc}
                  </p>
                  <Button
                    variant={status?.isActive ? 'outline' : 'default'}
                    className={`w-full h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest ${!status?.isActive && 'bg-slate-900'}`}
                  >
                    {status?.isActive ? 'Configure Node' : 'Initialize Provider'}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Template Library */}
          <section className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight">
                  Clinical Template Library
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Pre-approved message structures with Mustache variables
                </p>
              </div>
              <Button className="h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black px-8 uppercase text-[10px] tracking-widest shadow-xl shadow-blue-100">
                <Plus className="h-4 w-4 mr-2" /> Design Template
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 text-left">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Template Name
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Channel
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Language
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Preview
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {templates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <p className="text-sm font-medium text-slate-400 italic">
                          No templates defined yet. Design your first appointment reminder.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    templates.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-slate-800 leading-none mb-1">
                            {t.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter truncate max-w-[200px]">
                            {t.body.substring(0, 40)}...
                          </p>
                        </td>
                        <td className="px-8 py-6">
                          <Badge className="bg-slate-100 text-slate-600 border-none font-black text-[8px] h-5 px-2 uppercase">
                            {t.channel}
                          </Badge>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-[10px] font-black text-slate-400 uppercase">
                            {t.language}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <Badge
                            className={`text-[8px] font-black px-1.5 h-4 border-none ${t.isApproved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
                          >
                            {t.isApproved ? 'APPROVED' : 'PENDING DLT'}
                          </Badge>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-xl font-bold text-[10px] px-4"
                          >
                            View Body <ExternalLink className="h-3 w-3 ml-2" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </TabsContent>

        <TabsContent
          value="payments"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                name: 'Razorpay',
                icon: PaymentIcon,
                color: 'text-blue-600',
                active: true,
                desc: "India's preferred gateway for UPI & Cards.",
              },
              {
                name: 'Stripe',
                icon: WebIcon,
                color: 'text-indigo-600',
                active: false,
                desc: 'Global standards for international medical tourism.',
              },
            ].map((gw) => (
              <div
                key={gw.name}
                className="bg-white rounded-[2.5rem] border border-slate-200 p-10 hover:shadow-2xl transition-all duration-500 relative overflow-hidden group"
              >
                <div className="flex items-center justify-between mb-8">
                  <div
                    className={`h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center ${gw.color}`}
                  >
                    <gw.icon className="h-8 w-8" />
                  </div>
                  <Badge
                    className={`text-[9px] font-black px-2 h-5 border-none ${gw.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}
                  >
                    {gw.active ? 'LIVE' : 'IDLE'}
                  </Badge>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">{gw.name}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10">
                  {gw.desc}
                </p>

                <div className="space-y-4 mb-10">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Lock className="h-4 w-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-600">Sandbox Mode</span>
                    </div>
                    <Switch checked={true} />
                  </div>
                </div>

                <Button
                  variant={gw.active ? 'outline' : 'default'}
                  className={`w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest ${!gw.active && 'bg-blue-600 shadow-xl shadow-blue-100'}`}
                >
                  {gw.active ? 'Manage Gateway' : 'Configure Account'}
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent
          value="compliance"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="max-w-2xl relative z-10">
              <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4">
                <ShieldCheck className="h-10 w-10 text-emerald-400" /> Digital Health Compliance
              </h2>
              <p className="text-slate-400 font-medium leading-relaxed mb-10 text-lg">
                Connect to the Ayushman Bharat Digital Mission (ABDM) to generate ABHA IDs and sync
                patient health records across the national healthcare registry.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">
                    Facility Status
                  </p>
                  <p className="text-xl font-bold">Facility ID Required</p>
                  <p className="text-xs text-slate-500 mt-1">Register via ABDM Portal first</p>
                </div>
                <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">
                    Consent Manager
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold">Auto-Sync Records</span>
                    <Switch className="data-[state=checked]:bg-emerald-500" />
                  </div>
                </div>
              </div>
              <Button className="h-14 px-10 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-xs tracking-widest shadow-2xl shadow-emerald-900/50">
                Onboard to ABDM Ecosystem
              </Button>
            </div>
            <div className="absolute top-0 right-0 p-20 opacity-10 rotate-12">
              <Fingerprint className="h-96 w-96 text-white" />
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="sync"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <section className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center">
                  <Calendar className="h-7 w-7 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">
                    Calendar Orchestration
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Sync doctor schedules with Google & Outlook
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {['Google Calendar', 'Outlook 365'].map((cal) => (
                  <div
                    key={cal}
                    className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm font-black text-[10px] text-slate-400 uppercase">
                        {cal[0]}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{cal}</span>
                    </div>
                    <Button
                      variant="ghost"
                      className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50"
                    >
                      Link Node
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center">
                    <Layers className="h-7 w-7 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">
                      System Webhooks
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">
                      Transmit events to external 3rd party apps
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Destination URL
                    </label>
                    <Input
                      placeholder="https://api.yourcms.com/webhook"
                      className="h-12 rounded-xl border-slate-200 bg-slate-50/50"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-xs font-bold text-slate-500">Payload Format</p>
                    <Badge variant="outline" className="text-[10px] font-black border-slate-200">
                      JSON / POST
                    </Badge>
                  </div>
                  <Button className="w-full h-12 rounded-xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest mt-4">
                    Register Endpoints
                  </Button>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-5">
                <Terminal className="h-48 w-48" />
              </div>
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

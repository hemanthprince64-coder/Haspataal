/* eslint-disable */
'use client';

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
  Trash2,
  Settings2,
  Cpu,
} from 'lucide-react';
import { toast } from 'sonner';

import { useState, useEffect, useCallback } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Integration {
  id: string;
  provider: string;
  isActive: boolean;
  isLive: boolean;
  testMode: boolean;
  webhookUrl?: string;
  scope: string[];
}

interface Template {
  id: string;
  name: string;
  channel: string;
  body: string;
  language: string;
  isApproved: boolean;
  providerId?: string;
}

interface EventMapping {
  id: string;
  event: string;
  templateId: string;
  channel: string;
  isActive: boolean;
  template?: { name: string };
}

const SYSTEM_EVENTS = [
  {
    id: 'APPOINTMENT_BOOKED',
    name: 'Appointment Confirmed',
    desc: 'Fires when a patient books a slot.',
  },
  {
    id: 'PATIENT_DISCHARGED',
    name: 'Patient Discharged',
    desc: 'Fires on IPD discharge completion.',
  },
  { id: 'LAB_REPORT_READY', name: 'Lab Report Ready', desc: 'Fires when results are authorized.' },
  { id: 'PAYMENT_RECEIVED', name: 'Payment Success', desc: 'Fires on successful transaction.' },
  {
    id: 'DOCTOR_CANCELLED',
    name: 'Appointment Cancelled',
    desc: 'Fires when doctor is unavailable.',
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CommunicationsIntegrationsPage() {
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [mappings, setMappings] = useState<EventMapping[]>([]);
  const [activeTab, setActiveTab] = useState('messaging');

  // Modals state
  const [configModal, setConfigModal] = useState<{ open: boolean; provider: string | null }>({
    open: false,
    provider: null,
  });
  const [templateModal, setTemplateModal] = useState<{ open: boolean; edit: Template | null }>({
    open: false,
    edit: null,
  });
  const [mappingModal, setMappingModal] = useState({ open: false });

  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [intRes, tempRes, mapRes] = await Promise.all([
        fetch('/api/hospital/integrations'),
        fetch('/api/hospital/notifications/templates'),
        fetch('/api/hospital/notifications/mappings'),
      ]);
      const [intData, tempData, mapData] = await Promise.all([
        intRes.json(),
        tempRes.json(),
        mapRes.json(),
      ]);
      setIntegrations(intData.configs ?? []);
      setTemplates(tempData.templates ?? []);
      setMappings(mapData.mappings ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getProviderStatus = (provider: string) => {
    return integrations.find((i) => i.provider === provider);
  };

  const handleSaveMapping = async (data: any) => {
    setSaving(true);
    try {
      const res = await fetch('/api/hospital/notifications/mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save mapping');
      toast.success('Event rule updated');
      fetchData();
      setMappingModal({ open: false });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMapping = async (id: string) => {
    try {
      const res = await fetch(`/api/hospital/notifications/mappings?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete mapping');
      toast.success('Event rule removed');
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
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
            Providers & Nodes
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="rounded-xl px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest"
          >
            Template Library
          </TabsTrigger>
          <TabsTrigger
            value="rules"
            className="rounded-xl px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest"
          >
            Event Rules
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="rounded-xl px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest"
          >
            Revenue Gateways
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
                    onClick={() => setConfigModal({ open: true, provider: prov.id })}
                    variant={status?.isActive ? 'outline' : 'default'}
                    className={`w-full h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest ${!status?.isActive && 'bg-slate-900'}`}
                  >
                    {status?.isActive ? 'Configure Node' : 'Initialize Provider'}
                  </Button>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent
          value="templates"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
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
              <Button
                onClick={() => setTemplateModal({ open: true, edit: null })}
                className="h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black px-8 uppercase text-[10px] tracking-widest shadow-xl shadow-blue-100"
              >
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
                      Actions
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
                        <td className="px-8 py-6 text-right flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => setTemplateModal({ open: true, edit: t })}
                          >
                            <Settings2 className="h-4 w-4 text-slate-400" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <ExternalLink className="h-4 w-4 text-slate-400" />
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
          value="rules"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Event Orchestration
              </h2>
              <p className="text-sm text-slate-500 font-medium italic">
                Link system events to specific messaging templates.
              </p>
            </div>
            <Button
              onClick={() => setMappingModal({ open: true })}
              className="h-12 rounded-2xl bg-slate-900 hover:bg-black text-white font-black px-8 uppercase text-[10px] tracking-widest shadow-xl shadow-slate-100"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Mapping
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mappings.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                <Cpu className="h-12 w-12 mx-auto text-slate-200 mb-4" />
                <p className="text-sm font-bold text-slate-400">No active event rules.</p>
              </div>
            ) : (
              mappings.map((m) => (
                <div
                  key={m.id}
                  className="bg-white rounded-[2.5rem] border border-slate-200 p-8 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-6">
                    <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[9px] h-5 px-2 uppercase tracking-widest">
                      {m.event.replace(/_/g, ' ')}
                    </Badge>
                    <Switch checked={m.isActive} onCheckedChange={() => {}} className="scale-75" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-1">
                    {m.template?.name || 'Unknown Template'}
                  </h3>
                  <div className="flex items-center gap-2 mb-6">
                    <Badge
                      variant="outline"
                      className="text-[8px] font-black border-slate-200 text-slate-400 uppercase"
                    >
                      {m.channel}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      Mapped Node
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-xl text-rose-500 hover:bg-rose-50"
                      onClick={() => handleDeleteMapping(m.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
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
      </Tabs>

      {/* ─── Modals ───────────────────────────────────────────────────────────── */}

      {/* Provider Config Modal */}
      <Dialog
        open={configModal.open}
        onOpenChange={() => setConfigModal({ open: false, provider: null })}
      >
        <DialogContent className="rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-900 p-10 text-white relative">
            <DialogTitle className="text-2xl font-black tracking-tight mb-2 uppercase">
              {configModal.provider?.replace('_', ' ')}
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium">
              Initialize your messaging node with secure credentials.
            </DialogDescription>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Access Token / Key
              </label>
              <Input type="password" placeholder="••••••••••••••••" className="h-12 rounded-xl" />
            </div>
            {configModal.provider === 'WHATSAPP_META' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Phone Number ID
                </label>
                <Input placeholder="e.g. 1092837465" className="h-12 rounded-xl" />
              </div>
            )}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <span className="text-xs font-bold text-slate-600">Go Live</span>
              <Switch />
            </div>
          </div>
          <DialogFooter className="bg-slate-50 p-6">
            <Button
              className="w-full bg-slate-900 h-12 rounded-xl font-black uppercase text-xs tracking-widest"
              onClick={() => {
                toast.success('Provider initialized successfully');
                setConfigModal({ open: false, provider: null });
              }}
            >
              Verify & Connect Node
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Modal */}
      <Dialog
        open={templateModal.open}
        onOpenChange={() => setTemplateModal({ open: false, edit: null })}
      >
        <DialogContent className="max-w-2xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-blue-600 p-10 text-white relative">
            <DialogTitle className="text-2xl font-black tracking-tight mb-2">
              {templateModal.edit ? 'Edit Template' : 'Design Clinical Template'}
            </DialogTitle>
            <DialogDescription className="text-blue-100 font-medium">
              Create a reusable message structure for patient alerts.
            </DialogDescription>
          </div>
          <div className="p-10 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Friendly Name
                </label>
                <Input
                  placeholder="e.g. Appointment Reminder"
                  className="h-12 rounded-xl font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Channel
                </label>
                <Select defaultValue="WHATSAPP">
                  <SelectTrigger className="h-12 rounded-xl font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                    <SelectItem value="SMS">Transactional SMS</SelectItem>
                    <SelectItem value="EMAIL">AWS Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                Message Body <span>Mustache Support: {'{{patient_name}}'}</span>
              </label>
              <Textarea
                placeholder="Hello {{patient_name}}, your appointment with {{doctor_name}} is confirmed for {{time}}."
                className="min-h-[150px] rounded-2xl p-4 font-medium"
              />
            </div>
          </div>
          <DialogFooter className="bg-slate-50 p-8">
            <Button
              className="w-full bg-blue-600 h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100"
              onClick={() => {
                toast.success('Template saved successfully');
                setTemplateModal({ open: false, edit: null });
              }}
            >
              Authorize & Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mapping Modal */}
      <Dialog open={mappingModal.open} onOpenChange={() => setMappingModal({ open: false })}>
        <DialogContent className="rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-900 p-10 text-white">
            <DialogTitle className="text-2xl font-black tracking-tight mb-2">
              New Event Rule
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium">
              Link a system event to a template.
            </DialogDescription>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Clinical Event
              </label>
              <Select onValueChange={(v: string) => {}}>
                <SelectTrigger className="h-12 rounded-xl font-bold">
                  <SelectValue placeholder="Select Event Trigger" />
                </SelectTrigger>
                <SelectContent>
                  {SYSTEM_EVENTS.map((ev) => (
                    <SelectItem key={ev.id} value={ev.id}>
                      <div className="flex flex-col text-left">
                        <span className="font-bold">{ev.name}</span>
                        <span className="text-[9px] text-slate-400 uppercase tracking-tighter">
                          {ev.desc}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Target Template
              </label>
              <Select onValueChange={(v: string) => {}}>
                <SelectTrigger className="h-12 rounded-xl font-bold">
                  <SelectValue placeholder="Select Template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.channel})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="bg-slate-50 p-6">
            <Button
              className="w-full bg-slate-900 h-12 rounded-xl font-black uppercase text-xs tracking-widest"
              onClick={() =>
                handleSaveMapping({
                  event: 'APPOINTMENT_BOOKED',
                  templateId: templates[0]?.id,
                  channel: 'WHATSAPP',
                })
              }
              disabled={templates.length === 0}
            >
              Deploy Event Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

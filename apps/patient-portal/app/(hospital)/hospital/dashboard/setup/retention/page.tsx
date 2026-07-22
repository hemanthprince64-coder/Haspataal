/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Sparkles,
  Calendar,
  MessageCircle,
  BarChart3,
  Settings,
  Trash2,
  Pencil,
  ChevronRight,
  ArrowUpRight,
  Loader2,
  ShieldCheck,
  Info,
  ExternalLink,
  CheckCircle2,
  History,
  FileText,
  LayoutGrid,
  List,
  Zap,
  Target,
  TrendingUp,
  AlertCircle,
  Clock,
  Mail,
  Smartphone,
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

interface Rule {
  id: string;
  name: string;
  trigger: {
    event: string;
    daysAfter: number;
    condition?: string;
  };
  action: {
    type: string;
    templateId?: string;
    channel: string;
  };
  audience?: {
    segment: string;
    condition?: string;
  };
  isActive: boolean;
  maxPerMonth: number;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RetentionSetupPage() {
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState<Rule[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('rules');

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await fetch('/api/hospital/retention/rules');
        const data = await res.json();
        setRules(data.rules ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []);

  const filteredRules = rules.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-purple-600 rounded-[1.5rem] shadow-2xl shadow-purple-100">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
              Growth & Retention
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Automate patient recalls, follow-up cycles, and preventive care nudges
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-12 px-6 rounded-2xl border-slate-200 font-bold text-slate-600 bg-white"
          >
            <BarChart3 className="h-4 w-4 mr-2" /> Recall Analytics
          </Button>
          <Button className="bg-slate-900 hover:bg-black h-12 px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-200">
            <Plus className="h-4 w-4 mr-2" /> Design Rule
          </Button>
        </div>
      </div>

      {/* Hero Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-black tracking-tight uppercase text-purple-400 text-[10px] tracking-[0.2em]">
                Predictive Insights
              </h2>
            </div>
            <h3 className="text-4xl font-black mb-4 tracking-tighter">
              ₹4.2L <span className="text-slate-500 text-2xl">Potential Recovery</span>
            </h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
              Our intelligence engine has identified 184 lapsed patients from the last quarter who
              are eligible for preventative health screenings based on their medical history.
            </p>
            <div className="mt-8 flex gap-4">
              <Button className="bg-purple-600 hover:bg-purple-700 h-12 rounded-2xl px-8 font-black uppercase text-[10px] tracking-widest">
                Activate AI Recall
              </Button>
              <Button
                variant="ghost"
                className="text-slate-400 hover:text-white h-12 font-bold text-sm"
              >
                View Segment <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
            <TrendingUp className="h-64 w-64" />
          </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Active Automation
            </p>
            <h4 className="text-5xl font-black text-slate-800 tracking-tighter">{rules.length}</h4>
            <p className="text-xs text-slate-500 font-medium mt-1">Live retention rules</p>
          </div>
          <div className="pt-8 border-t border-slate-100 flex items-center gap-4">
            <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              98.4% Delivery Success
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
        <TabsList className="bg-white p-1 rounded-2xl border border-slate-200 h-16 shadow-sm inline-flex">
          <TabsTrigger
            value="rules"
            className="rounded-xl px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest"
          >
            Automation Rules
          </TabsTrigger>
          <TabsTrigger
            value="segments"
            className="rounded-xl px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest"
          >
            Audience Segments
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-xl px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest"
          >
            Action Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="rules"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search automation rules..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-11 h-12 border-slate-200 bg-slate-50/50 rounded-2xl font-medium"
                />
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="bg-slate-50 text-slate-400 border-none font-black text-[10px] h-10 px-4 uppercase"
                >
                  {filteredRules.length} Rules Running
                </Badge>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 text-left">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Rule Concept
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Trigger Node
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Audience Target
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Channel Logic
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      State
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRules.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-[10px] text-slate-500">
                            {r.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 leading-none mb-1">
                              {r.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                              Frequency: {r.maxPerMonth} / month
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-black text-slate-700 uppercase tracking-tight">
                            {r.trigger.event.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 italic">
                            After {r.trigger.daysAfter} days
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <Badge className="bg-purple-50 text-purple-600 border-none font-black text-[8px] h-5 px-2 uppercase">
                          {r.audience?.segment || 'ALL PATIENTS'}
                        </Badge>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          {r.action.channel === 'WHATSAPP' && (
                            <MessageCircle className="h-4 w-4 text-emerald-500" />
                          )}
                          {r.action.channel === 'SMS' && (
                            <Smartphone className="h-4 w-4 text-orange-500" />
                          )}
                          {r.action.channel === 'EMAIL' && (
                            <Mail className="h-4 w-4 text-blue-500" />
                          )}
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {r.action.channel}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-4">
                          <Switch checked={r.isActive} />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="segments"
          className="animate-in fade-in slide-in-from-right-4 duration-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Chronic (Diabetic)',
                count: 420,
                color: 'bg-rose-50 text-rose-600',
                icon: Zap,
              },
              {
                name: 'High Spend (>10K)',
                count: 184,
                color: 'bg-emerald-50 text-emerald-600',
                icon: TrendingUp,
              },
              {
                name: 'Lapsed (6mo+)',
                count: 850,
                color: 'bg-amber-50 text-amber-600',
                icon: Clock,
              },
            ].map((seg) => (
              <div
                key={seg.name}
                className="bg-white rounded-[2.5rem] border border-slate-200 p-8 hover:shadow-2xl transition-all duration-500 group"
              >
                <div className="flex items-center justify-between mb-8">
                  <div
                    className={`h-14 w-14 rounded-2xl flex items-center justify-center ${seg.color}`}
                  >
                    <seg.icon className="h-7 w-7" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-black border-slate-100">
                    {seg.count} Patients
                  </Badge>
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-6">{seg.name}</h3>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest border-slate-100 hover:bg-slate-50"
                >
                  Sync Segment <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent
          value="history"
          className="animate-in fade-in slide-in-from-right-4 duration-500"
        >
          <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 py-32 flex flex-col items-center justify-center text-center">
            <div className="p-8 bg-slate-50 rounded-full mb-6">
              <History className="h-16 w-16 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No Action Logs Recorded</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-sm font-medium">
              As your automation rules fire, detailed logs of patient outreaches and delivery
              statuses will appear here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

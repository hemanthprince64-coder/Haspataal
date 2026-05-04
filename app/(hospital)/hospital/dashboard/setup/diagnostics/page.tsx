'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  Plus,
  Search,
  Filter,
  FlaskConical,
  Clock,
  Microscope,
  Microscope as LabIcon,
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
  Beaker,
  Thermometer,
  UserCheck,
  AlertCircle,
  Stethoscope,
  Crosshair,
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

interface DiagnosticTest {
  id: string;
  testName: string;
  category: string;
  hospitalPrice: number;
  patientMrp: number;
  turnaroundHours: number;
  sampleType?: string;
  fastingRequired: boolean;
  preparationInstructions?: string;
  equipmentCode?: string;
  isInstrumentBased: boolean;
  referenceRanges?: any;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DiagnosticsSetupPage() {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('catalog');

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await fetch('/api/hospital/diagnostics/pricing');
        const data = await res.json();
        setTests(data.pricing ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  const filteredTests = tests.filter(
    (t) =>
      t.testName.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-rose-600 rounded-[1.5rem] shadow-2xl shadow-rose-100">
            <Microscope className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
              Diagnostic Center
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Calibrate laboratory tests, imaging protocols, and turnaround SLAs
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-12 px-6 rounded-2xl border-slate-200 font-bold text-slate-600 bg-white"
          >
            <LayoutGrid className="h-4 w-4 mr-2" /> Panel Grouping
          </Button>
          <Button className="bg-slate-900 hover:bg-black h-12 px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-200">
            <Plus className="h-4 w-4 mr-2" /> New Investigation
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
        <TabsList className="bg-white p-1 rounded-2xl border border-slate-200 h-16 shadow-sm inline-flex">
          <TabsTrigger
            value="catalog"
            className="rounded-xl px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest"
          >
            Investigation Master
          </TabsTrigger>
          <TabsTrigger
            value="workflow"
            className="rounded-xl px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest"
          >
            Sample Protocols
          </TabsTrigger>
          <TabsTrigger
            value="equipment"
            className="rounded-xl px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest"
          >
            LIS Integration
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="catalog"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search investigations by name or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-11 h-12 border-slate-200 bg-slate-50/50 rounded-2xl font-medium"
                />
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="bg-slate-50 text-slate-400 border-none font-black text-[10px] h-10 px-4"
                >
                  {filteredTests.length} Investigations Active
                </Badge>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 text-left">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Investigation Name
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Tariff (₹)
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      TAT (Hours)
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Workflow Metadata
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Operations
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTests.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center font-black text-[10px]">
                            {t.category.substring(0, 3).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 leading-none mb-1">
                              {t.testName}
                            </p>
                            <div className="flex gap-1.5">
                              <Badge
                                variant="outline"
                                className="text-[8px] font-black border-slate-100 text-slate-400"
                              >
                                {t.category}
                              </Badge>
                              {t.isInstrumentBased && (
                                <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black h-4 px-1.5 uppercase">
                                  AUTO-LIS
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-sm font-black text-slate-800">
                          ₹{t.hospitalPrice}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-600 border-none font-black text-[9px] h-5 px-2"
                        >
                          <Clock className="h-2.5 w-2.5 mr-1" /> {t.turnaroundHours}H
                        </Badge>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-2">
                          {t.sampleType && (
                            <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[8px] h-5 px-2 uppercase">
                              {t.sampleType}
                            </Badge>
                          )}
                          {t.fastingRequired && (
                            <Badge className="bg-amber-50 text-amber-700 border-none font-black text-[8px] h-5 px-2 uppercase">
                              FASTING REQ
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                            <History className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                            <Pencil className="h-4 w-4" />
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
          value="workflow"
          className="animate-in fade-in slide-in-from-right-4 duration-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <section className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <Beaker className="h-6 w-6 text-rose-600" />
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  Pre-Analysis Protocols
                </h2>
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">
                      Fasting Notifications
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Auto-SMS patient 12 hours before sample collection
                    </p>
                  </div>
                  <Switch checked={true} className="data-[state=checked]:bg-rose-600" />
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">
                      Phlebotomy Checklist
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Enforce preparation check before sample barcode generation
                    </p>
                  </div>
                  <Switch checked={false} className="data-[state=checked]:bg-rose-600" />
                </div>
              </div>
            </section>

            <section className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <Crosshair className="h-6 w-6 text-rose-400" />
                  <h2 className="text-xl font-black tracking-tight">SLA Performance</h2>
                </div>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  Investigations exceeding the turnaround time (TAT) will be automatically escalated
                  to the Lab Director dashboard and flagged as "Delayed" on the patient mobile
                  application.
                </p>
                <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Average Delay
                    </p>
                    <p className="text-2xl font-black text-rose-400 leading-none">0.8H</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Auto-Escalation
                    </p>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[8px] font-black uppercase">
                      ENABLED
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-12 opacity-5">
                <Activity className="h-48 w-48" />
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent
          value="equipment"
          className="animate-in fade-in slide-in-from-right-4 duration-500"
        >
          <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 py-32 flex flex-col items-center justify-center text-center">
            <div className="p-8 bg-slate-50 rounded-full mb-6">
              <Microscope className="h-16 w-16 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">HL7 / LIS Integration Bridge</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-sm font-medium">
              Connect your lab analyzers (Biochemistry, Hematology) directly to Haspataal for
              real-time result syncing.
            </p>
            <div className="flex gap-3 mt-8">
              <Button
                variant="outline"
                className="rounded-2xl h-12 px-8 font-bold border-slate-200"
              >
                View LOINC Mapping
              </Button>
              <Button className="rounded-2xl bg-blue-600 text-white h-12 px-8 font-black uppercase text-[10px] tracking-widest">
                Enable LIS Bridge
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

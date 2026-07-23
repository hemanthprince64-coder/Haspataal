/* eslint-disable */
'use client';

import {
  CreditCard,
  Banknote,
  Receipt,
  Settings,
  Plus,
  Search,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Download,
  Upload,
  Trash2,
  ChevronRight,
  Building2,
  Wallet,
  History,
  FileText,
  Percent,
  Info,
  ExternalLink,
  Lock,
  Globe,
  Smartphone,
  CreditCard as CardIcon,
  Table,
  Layout,
  CheckCircle2,
  AlertCircle,
  FileDigit,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';

import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface Service {
  id: string;
  code: string;
  name: string;
  type: string;
  basePrice: number;
  gstRate: number;
  gstInclusive: boolean;
  isActive: boolean;
  hsnCode?: string;
  departmentId?: string;
}

interface BillingProfile {
  bankAccountNumber?: string;
  bankIfsc?: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  gstInclusivePricing: boolean;
  payoutCycle: string;
  invoiceLayout: string;
  headerText?: string;
  footerText?: string;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BillingSetupPage() {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [profile, setProfile] = useState<BillingProfile>({
    invoicePrefix: 'INV',
    nextInvoiceNumber: 1001,
    gstInclusivePricing: false,
    payoutCycle: 'WEEKLY',
    invoiceLayout: 'STANDARD',
  });
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('catalog');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servRes, profRes] = await Promise.all([
          fetch('/api/hospital/billing/services'),
          fetch('/api/hospital/billing/profile'),
        ]);
        const [servData, profData] = await Promise.all([servRes.json(), profRes.json()]);
        setServices(servData.services ?? []);
        if (profData.hospital) {
          setProfile({
            ...profData.profile,
            invoicePrefix: profData.hospital.invoicePrefix,
            nextInvoiceNumber: profData.hospital.nextInvoiceNumber,
            gstInclusivePricing: profData.hospital.gstInclusivePricing,
            bankAccountNumber: profData.hospital.bankAccountNo,
            bankIfsc: profData.hospital.bankIfsc,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateProfile = async (updates: Partial<BillingProfile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    try {
      const res = await fetch('/api/hospital/billing/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile),
      });
      if (!res.ok) throw new Error();
      toast.success('Billing preferences synced');
    } catch {
      toast.error('Failed to update preferences');
    }
  };

  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-emerald-600 rounded-[1.5rem] shadow-2xl shadow-emerald-100">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
              Financial Treasury
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Configure service tariffs, tax compliance, and payment orchestration
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-12 px-6 rounded-2xl border-slate-200 font-bold text-slate-600 bg-white shadow-sm hover:bg-slate-50"
          >
            <Download className="h-4 w-4 mr-2" /> Audit Report
          </Button>
          <Button className="bg-slate-900 hover:bg-black h-12 px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-200">
            Live Revenue <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
        <TabsList className="bg-white p-1 rounded-2xl border border-slate-200 h-16 shadow-sm inline-flex">
          <TabsTrigger
            value="catalog"
            className="rounded-xl px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest transition-all"
          >
            Service Catalog
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="rounded-xl px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest transition-all"
          >
            Treasury & Tax
          </TabsTrigger>
          <TabsTrigger
            value="gateways"
            className="rounded-xl px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest transition-all"
          >
            Payment Nodes
          </TabsTrigger>
          <TabsTrigger
            value="packages"
            className="rounded-xl px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest transition-all"
          >
            Care Packages
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
                  placeholder="Search services by name or code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-11 h-12 border-slate-200 bg-slate-50/50 rounded-2xl font-medium"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="h-12 rounded-2xl border-slate-200 font-bold px-6"
                >
                  <Upload className="h-4 w-4 mr-2 text-slate-400" /> Bulk CSV Import
                </Button>
                <Button className="h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 uppercase text-[10px] tracking-widest">
                  <Plus className="h-4 w-4 mr-2" /> Add Service
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 text-left">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Service Details
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Tariff (₹)
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Tax Class
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Classification
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Operations
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredServices.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-[10px] text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-all">
                            {s.code.substring(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 leading-none mb-1">
                              {s.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                              Code: {s.code}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-sm font-black text-slate-800">
                          ₹{s.basePrice.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <Badge
                          variant="outline"
                          className="text-[9px] font-black border-slate-200 text-slate-400 uppercase"
                        >
                          {s.gstRate}% GST
                        </Badge>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex gap-2">
                          <Badge className="bg-slate-100 text-slate-600 border-none font-black text-[8px] h-5 px-2 uppercase">
                            {s.type}
                          </Badge>
                          {s.hsnCode && (
                            <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[8px] h-5 px-2 uppercase">
                              HSN: {s.hsnCode}
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
          value="profile"
          className="animate-in fade-in slide-in-from-right-4 duration-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Section 1: Financial Identity */}
            <div className="space-y-10">
              <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-lg font-black text-slate-800 tracking-tight">
                    Treasury Payout Details
                  </h2>
                </div>
                <div className="p-10 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Hospital Bank A/c Number
                    </label>
                    <Input
                      value={profile.bankAccountNumber}
                      onChange={(e) => handleUpdateProfile({ bankAccountNumber: e.target.value })}
                      placeholder="6029101000..."
                      className="h-14 rounded-2xl border-slate-200 font-black text-lg tracking-widest px-6"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Bank IFSC Code
                      </label>
                      <Input
                        value={profile.bankIfsc}
                        onChange={(e) =>
                          handleUpdateProfile({ bankIfsc: e.target.value.toUpperCase() })
                        }
                        placeholder="HDFC000..."
                        className="h-14 rounded-2xl border-slate-200 font-black uppercase px-6"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Payout Cycle
                      </label>
                      <Select
                        value={profile.payoutCycle}
                        onValueChange={(v: string) => handleUpdateProfile({ payoutCycle: v })}
                      >
                        <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl font-bold">
                          <SelectItem value="DAILY">Real-time (T+1)</SelectItem>
                          <SelectItem value="WEEKLY">Weekly Batch</SelectItem>
                          <SelectItem value="MONTHLY">Monthly Audit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-emerald-400" />
                    <h2 className="text-lg font-black tracking-tight">Tax Compliance (GST)</h2>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">
                        Inclusive Pricing
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Auto-deduct GST from base price in catalog
                      </p>
                    </div>
                    <Switch
                      checked={profile.gstInclusivePricing}
                      onCheckedChange={(v) => handleUpdateProfile({ gstInclusivePricing: v })}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>

                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex gap-5">
                    <Info className="h-6 w-6 text-blue-400 shrink-0" />
                    <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                      Health services are currently exempt from GST in some jurisdictions. Consult
                      your chartered accountant before enabling tax line items on invoices.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Section 2: Invoice Rules */}
            <div className="space-y-10">
              <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                  <FileDigit className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-black text-slate-800 tracking-tight">
                    Invoice Sequencing
                  </h2>
                </div>
                <div className="p-10 space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Series Prefix
                      </label>
                      <Input
                        value={profile.invoicePrefix}
                        onChange={(e) =>
                          handleUpdateProfile({ invoicePrefix: e.target.value.toUpperCase() })
                        }
                        className="h-14 rounded-2xl border-slate-200 font-black text-xl uppercase px-6"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Next Serial Number
                      </label>
                      <Input
                        type="number"
                        value={profile.nextInvoiceNumber}
                        onChange={(e) =>
                          handleUpdateProfile({
                            nextInvoiceNumber: parseInt(e.target.value) || 1001,
                          })
                        }
                        className="h-14 rounded-2xl border-slate-200 font-black text-xl px-6"
                      />
                    </div>
                  </div>

                  <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Live Preview
                    </p>
                    <p className="text-3xl font-black text-slate-800 tracking-tighter">
                      {profile.invoicePrefix}-{profile.nextInvoiceNumber}
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                  <Layout className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-black text-slate-800 tracking-tight">
                    Document Layout
                  </h2>
                </div>
                <div className="p-10 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Invoice Template
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {['STANDARD', 'COMPACT', 'MODERN', 'DETAILED'].map((t) => (
                        <button
                          key={t}
                          onClick={() => handleUpdateProfile({ invoiceLayout: t })}
                          className={`p-4 rounded-2xl border-2 text-xs font-black uppercase tracking-widest transition-all
                                   ${
                                     profile.invoiceLayout === t
                                       ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100'
                                       : 'bg-white border-slate-100 text-slate-400 hover:border-blue-100'
                                   }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="gateways"
          className="animate-in fade-in slide-in-from-right-4 duration-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[
              {
                name: 'Razorpay',
                icon: CardIcon,
                color: 'text-blue-600',
                active: true,
                status: 'CONNECTED',
              },
              {
                name: 'Stripe',
                icon: Globe,
                color: 'text-indigo-600',
                active: false,
                status: 'NOT CONFIGURED',
              },
              {
                name: 'Unified Payments (UPI)',
                icon: Smartphone,
                color: 'text-emerald-600',
                active: true,
                status: 'ACTIVE',
              },
            ].map((gw) => (
              <div
                key={gw.name}
                className="bg-white rounded-[2.5rem] border border-slate-200 p-8 hover:shadow-2xl transition-all duration-500 group"
              >
                <div className="flex items-center justify-between mb-8">
                  <div
                    className={`h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center ${gw.color}`}
                  >
                    <gw.icon className="h-7 w-7" />
                  </div>
                  <Badge
                    className={`text-[9px] font-black px-2 h-5 border-none ${gw.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}
                  >
                    {gw.status}
                  </Badge>
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">{gw.name}</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8">
                  {gw.active
                    ? 'Processing live transactions via encrypted secure tunnel.'
                    : 'Configure keys to enable online payments and settlements.'}
                </p>
                <Button
                  variant={gw.active ? 'outline' : 'default'}
                  className={`w-full h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest ${!gw.active && 'bg-blue-600'}`}
                >
                  {gw.active ? 'Verify Credentials' : 'Configure Integration'}
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent
          value="packages"
          className="animate-in fade-in slide-in-from-right-4 duration-500"
        >
          <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 py-32 flex flex-col items-center justify-center text-center">
            <div className="p-8 bg-slate-50 rounded-full mb-6">
              <Package className="h-16 w-16 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No Care Packages Defined</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-sm font-medium">
              Bundle multiple services, consultations, and lab tests into fixed-price clinical
              packages.
            </p>
            <Button className="mt-8 rounded-2xl bg-slate-900 text-white h-12 px-8 font-black uppercase text-[10px] tracking-widest">
              <Plus className="h-4 w-4 mr-2" /> Design First Package
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

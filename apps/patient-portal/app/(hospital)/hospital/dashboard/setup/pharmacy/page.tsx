/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import {
  Pill,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Calendar,
  Package,
  Building2,
  Truck,
  BarChart3,
  Settings,
  Trash2,
  Pencil,
  ChevronRight,
  ArrowUpRight,
  Loader2,
  Clock,
  ShieldAlert,
  Thermometer,
  Info,
  ExternalLink,
  CheckCircle2,
  History,
  FileText,
  FlaskConical,
  LayoutGrid,
  List,
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

interface Supplier {
  id: string;
  name: string;
}

interface Drug {
  id: string;
  name: string;
  genericName?: string;
  stock: number;
  minLevel: number;
  reorderPoint: number;
  expiryDate: string;
  formulation?: string;
  strength?: string;
  batchNumber?: string;
  mrp?: number;
  isControlled: boolean;
  storageCondition: string;
  supplier?: Supplier;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PharmacySetupPage() {
  const [loading, setLoading] = useState(true);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('inventory');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [drugRes, suppRes] = await Promise.all([
          fetch('/api/hospital/pharmacy/stock'),
          fetch('/api/hospital/pharmacy/suppliers'),
        ]);
        const [drugData, suppData] = await Promise.all([drugRes.json(), suppRes.json()]);
        setDrugs(drugData.stock ?? []);
        setSuppliers(suppData.suppliers ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredDrugs = drugs.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.genericName?.toLowerCase().includes(search.toLowerCase()),
  );

  const getStockStatus = (d: Drug) => {
    if (d.stock === 0) return { label: 'OUT OF STOCK', color: 'bg-rose-100 text-rose-700' };
    if (d.stock <= d.minLevel) return { label: 'CRITICAL', color: 'bg-orange-100 text-orange-700' };
    if (d.stock <= d.reorderPoint)
      return { label: 'LOW STOCK', color: 'bg-amber-100 text-amber-700' };
    return { label: 'HEALTHY', color: 'bg-emerald-100 text-emerald-700' };
  };

  const isExpiringSoon = (date: string) => {
    const expiry = new Date(date);
    const threeMonths = new Date();
    threeMonths.setMonth(threeMonths.getMonth() + 3);
    return expiry < threeMonths;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-indigo-600 rounded-[1.5rem] shadow-2xl shadow-indigo-100">
            <Pill className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
              Pharmacy Dispensary
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Manage drug formulary, inventory levels, and supplier procurement
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-12 px-6 rounded-2xl border-slate-200 font-bold text-slate-600 bg-white"
          >
            <Package className="h-4 w-4 mr-2" /> Purchase Orders
          </Button>
          <Button className="bg-slate-900 hover:bg-black h-12 px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-200">
            Stock Audit <ArrowUpRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
        <TabsList className="bg-white p-1 rounded-2xl border border-slate-200 h-16 shadow-sm inline-flex">
          <TabsTrigger
            value="inventory"
            className="rounded-xl px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest"
          >
            Live Inventory
          </TabsTrigger>
          <TabsTrigger
            value="suppliers"
            className="rounded-xl px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest"
          >
            Suppliers (Vendors)
          </TabsTrigger>
          <TabsTrigger
            value="alerts"
            className="rounded-xl px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest"
          >
            Compliance & Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="inventory"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              {
                label: 'Total SKUs',
                val: drugs.length,
                icon: Package,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                label: 'Out of Stock',
                val: drugs.filter((d) => d.stock === 0).length,
                icon: ShieldAlert,
                color: 'text-rose-600',
                bg: 'bg-rose-50',
              },
              {
                label: 'Expiring Soon',
                val: drugs.filter((d) => isExpiringSoon(d.expiryDate)).length,
                icon: Clock,
                color: 'text-amber-600',
                bg: 'bg-amber-50',
              },
              {
                label: 'Controlled Drugs',
                val: drugs.filter((d) => d.isControlled).length,
                icon: FlaskConical,
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex items-center gap-5"
              >
                <div
                  className={`h-12 w-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shrink-0`}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-black text-slate-800 tracking-tight">{stat.val}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by brand name or generic salt..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-11 h-12 border-slate-200 bg-slate-50/50 rounded-2xl font-medium"
                />
              </div>
              <Button className="h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100">
                <Plus className="h-4 w-4 mr-2" /> Restock Medicine
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 text-left">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Drug Formulation
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Stock Level
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Batch & Expiry
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Condition
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Operations
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDrugs.map((d) => {
                    const status = getStockStatus(d);
                    const expiring = isExpiringSoon(d.expiryDate);
                    return (
                      <tr key={d.id} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div
                              className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-[10px] ${d.isControlled ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}
                            >
                              {d.isControlled ? 'SCH-X' : d.formulation?.[0] || 'T'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 leading-none mb-1">
                                {d.name}{' '}
                                {d.strength && (
                                  <span className="text-slate-400 font-medium">({d.strength})</span>
                                )}
                              </p>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter truncate max-w-[200px]">
                                {d.genericName || 'Generic Salt Unassigned'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-sm font-black text-slate-800">
                              {d.stock} Units
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[8px] font-black px-1.5 h-4 border-none ${status.color}`}
                            >
                              {status.label}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none">
                              {d.batchNumber || 'NO BATCH'}
                            </p>
                            <p
                              className={`text-[11px] font-black ${expiring ? 'text-rose-600' : 'text-slate-400'}`}
                            >
                              {new Date(d.expiryDate)
                                .toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
                                .toUpperCase()}
                            </p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            {d.storageCondition === 'REFRIGERATED' ? (
                              <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[8px] h-5 px-2 flex items-center gap-1">
                                <Thermometer className="h-2.5 w-2.5" /> 2°C - 8°C
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-50 text-slate-400 border-none font-black text-[8px] h-5 px-2">
                                ROOM TEMP
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="suppliers"
          className="animate-in fade-in slide-in-from-right-4 duration-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {suppliers.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-[2.5rem] border border-slate-200 p-8 hover:shadow-2xl transition-all duration-500 relative overflow-hidden group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <Truck className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">
                      {s.name}
                    </h3>
                    <Badge className="bg-emerald-50 text-emerald-700 border-none text-[8px] font-black px-1.5 h-4 uppercase">
                      ACTIVE VENDOR
                    </Badge>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-[11px] font-medium text-slate-400">
                    <span>Lead Time</span>
                    <span className="text-slate-800 font-black uppercase tracking-widest">
                      7 Days
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] font-medium text-slate-400">
                    <span>Active SKUs</span>
                    <span className="text-slate-800 font-black uppercase tracking-widest">
                      14 Drugs
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest border-slate-100 hover:bg-slate-50"
                >
                  Procurement History
                </Button>
              </div>
            ))}
            <button className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center hover:border-indigo-300 hover:bg-indigo-50/20 transition-all">
              <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-slate-300" />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Onboard Supplier
              </p>
            </button>
          </div>
        </TabsContent>

        <TabsContent
          value="alerts"
          className="animate-in fade-in slide-in-from-right-4 duration-500"
        >
          <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="max-w-2xl relative z-10">
              <h2 className="text-2xl font-black tracking-tight mb-4 flex items-center gap-3">
                <ShieldAlert className="h-8 w-8 text-indigo-400" /> Regulatory Protocol
              </h2>
              <p className="text-indigo-200 font-medium leading-relaxed mb-8">
                Controlled substances (Schedule X/H) require mandatory prescription linkage and
                manual signature verification during dispense. The system will automatically lock
                dispensing for drugs exceeding reorder points unless authorized by the Head
                Pharmacist.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">
                    Expiry Protection
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Auto-Block Expired</span>
                    <Switch checked={true} className="data-[state=checked]:bg-emerald-500" />
                  </div>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">
                    Low Stock SMS
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Vendor Notification</span>
                    <Switch checked={false} className="data-[state=checked]:bg-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-16 opacity-5">
              <LayoutGrid className="h-64 w-64" />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

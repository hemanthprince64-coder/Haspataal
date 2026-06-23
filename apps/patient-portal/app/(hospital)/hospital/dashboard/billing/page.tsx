'use client';

import {
  Plus,
  Search,
  Trash2,
  Settings,
  Package,
  Percent,
  ShieldCheck,
  FlaskConical,
  Stethoscope,
  BedDouble,
  Pill,
  Image,
} from 'lucide-react';
import { toast } from 'sonner';

import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  packageId?: string;
}

interface BillingPackage {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  _count?: { services: number };
}

interface Insurer {
  id: string;
  insurerName: string;
  insurerType: string;
}

interface CoPayRule {
  id: string;
  insurerId: string;
  insurer: { insurerName: string; insurerType: string };
  serviceType?: string;
  service?: { name: string; code: string };
  copayType: string;
  copayValue: number;
  isActive: boolean;
}

const SERVICE_TYPES = [
  'CONSULTATION',
  'PROCEDURE',
  'LAB_TEST',
  'IMAGING',
  'BED_CHARGE',
  'MEDICINE',
  'PACKAGE',
];

const INSURER_TYPES: Record<string, string> = {
  GENERAL_INSURANCE: 'General Insurance',
  TPA: 'TPA',
  GOVERNMENT: 'Government',
};

export default function BillingDashboardPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<BillingPackage[]>([]);
  const [rules, setRules] = useState<CoPayRule[]>([]);
  const [insurers, setInsurers] = useState<Insurer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('catalog');

  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  const [serviceForm, setServiceForm] = useState({
    code: '',
    name: '',
    type: 'CONSULTATION',
    basePrice: 0,
    gstRate: 0,
    gstInclusive: false,
    isActive: true,
    hsnCode: '',
    isAddOn: false,
    isSurgical: false,
  });
  const [packageForm, setPackageForm] = useState({ name: '', description: '', isActive: true });
  const [ruleForm, setRuleForm] = useState({
    insurerId: '',
    serviceType: '',
    serviceId: '',
    copayType: 'PERCENTAGE',
    copayValue: 0,
    isActive: true,
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [servRes, pkgRes, ruleRes, insurerRes] = await Promise.all([
          fetch('/api/hospital/billing/services'),
          fetch('/api/hospital/billing/packages'),
          fetch('/api/hospital/billing/copay'),
          fetch('/api/hospital/insurance'),
        ]);
        const [servData, pkgData, ruleData, insurerData] = await Promise.all([
          servRes.json(),
          pkgRes.json(),
          ruleRes.json(),
          insurerRes.json(),
        ]);
        setServices(servData.services ?? []);
        setPackages(pkgData.packages ?? []);
        setRules(ruleData.rules ?? []);
        setInsurers(insurerData.insurances ?? []);
      } catch {
        toast.error('Failed to load billing data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreateService = async () => {
    try {
      const res = await fetch('/api/hospital/billing/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceForm),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create service');
      }
      const data = await res.json();
      setServices([data.service, ...services]);
      setServiceDialogOpen(false);
      setServiceForm({
        code: '',
        name: '',
        type: 'CONSULTATION',
        basePrice: 0,
        gstRate: 0,
        gstInclusive: false,
        isActive: true,
        hsnCode: '',
        isAddOn: false,
        isSurgical: false,
      });
      toast.success('Service added to catalog');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDeletePackage = async (id: string) => {
    try {
      const res = await fetch(`/api/hospital/billing/packages/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setPackages(packages.filter((p) => p.id !== id));
      toast.success('Package deleted');
    } catch {
      toast.error('Failed to delete package');
    }
  };

  const handleAssignServices = async (pkgId: string) => {
    const pkg = packages.find((p) => p.id === pkgId);
    if (!pkg) return;
    setSelectedPackageId(pkgId);
    setPackageForm({ name: pkg.name, description: pkg.description || '', isActive: pkg.isActive });
    setPackageDialogOpen(true);
  };

  const handleSavePackageServices = async () => {
    if (!selectedPackageId) return;
    // For simplicity, package rename is handled in the same dialog
    // In production, separate rename vs service assignment
    try {
      const res = await fetch(`/api/hospital/billing/packages/${selectedPackageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: packageForm.name,
          description: packageForm.description,
          isActive: packageForm.isActive,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPackages(
        packages.map((p) => (p.id === selectedPackageId ? { ...p, ...data.package } : p)),
      );
      setPackageDialogOpen(false);
      setSelectedPackageId(null);
      setPackageForm({ name: '', description: '', isActive: true });
      toast.success('Package updated');
    } catch {
      toast.error('Failed to update package');
    }
  };

  const handleCreateRule = async () => {
    try {
      const res = await fetch('/api/hospital/billing/copay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleForm),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create rule');
      }
      const data = await res.json();
      setRules([data.rule, ...rules]);
      setRuleDialogOpen(false);
      setRuleForm({
        insurerId: '',
        serviceType: '',
        serviceId: '',
        copayType: 'PERCENTAGE',
        copayValue: 0,
        isActive: true,
      });
      toast.success('Co-pay rule created');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const res = await fetch(`/api/hospital/billing/copay/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setRules(rules.filter((r) => r.id !== id));
      toast.success('Rule removed');
    } catch {
      toast.error('Failed to remove rule');
    }
  };

  const typeIcon: Record<string, any> = {
    CONSULTATION: Stethoscope,
    PROCEDURE: FlaskConical,
    LAB_TEST: FlaskConical,
    IMAGING: Image,
    BED_CHARGE: BedDouble,
    MEDICINE: Pill,
    PACKAGE: Package,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">OPD & Billing</h1>
          <p className="text-sm text-gray-500">Service catalog, care packages, and payer rules</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border border-gray-200 p-1 rounded-xl">
          <TabsTrigger value="catalog" className="rounded-lg px-4 py-2 text-sm font-semibold">
            <Search className="h-4 w-4 mr-2" />
            Service Catalog
          </TabsTrigger>
          <TabsTrigger value="packages" className="rounded-lg px-4 py-2 text-sm font-semibold">
            <Package className="h-4 w-4 mr-2" />
            Care Packages
          </TabsTrigger>
          <TabsTrigger value="copay" className="rounded-lg px-4 py-2 text-sm font-semibold">
            <Percent className="h-4 w-4 mr-2" />
            Co-pay Rules
          </TabsTrigger>
        </TabsList>

        {/* Catalog Tab */}
        <TabsContent value="catalog" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 rounded-lg border-gray-200"
              />
            </div>
            <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" /> Add Service
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Service to Catalog</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase">
                        Code *
                      </label>
                      <Input
                        value={serviceForm.code}
                        onChange={(e) => setServiceForm({ ...serviceForm, code: e.target.value })}
                        placeholder="CONS-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase">
                        Name *
                      </label>
                      <Input
                        value={serviceForm.name}
                        onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                        placeholder="General Consultation"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Type</label>
                      <Select
                        value={serviceForm.type}
                        onValueChange={(v: string) => setServiceForm({ ...serviceForm, type: v })}
                      >
                        <SelectTrigger className="h-10 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase">
                        Base Price (₹) *
                      </label>
                      <Input
                        type="number"
                        value={serviceForm.basePrice}
                        onChange={(e) =>
                          setServiceForm({
                            ...serviceForm,
                            basePrice: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase">
                        GST Rate (%)
                      </label>
                      <Input
                        type="number"
                        value={serviceForm.gstRate}
                        onChange={(e) =>
                          setServiceForm({
                            ...serviceForm,
                            gstRate: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase">
                        HSN Code
                      </label>
                      <Input
                        value={serviceForm.hsnCode}
                        onChange={(e) =>
                          setServiceForm({ ...serviceForm, hsnCode: e.target.value })
                        }
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={serviceForm.gstInclusive}
                        onCheckedChange={(v: boolean) =>
                          setServiceForm({ ...serviceForm, gstInclusive: v })
                        }
                      />
                      <span className="text-sm font-medium">GST Inclusive</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={serviceForm.isActive}
                        onCheckedChange={(v: boolean) =>
                          setServiceForm({ ...serviceForm, isActive: v })
                        }
                      />
                      <span className="text-sm font-medium">Active</span>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setServiceDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateService}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Create Service
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                    Tariff (₹)
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                    GST
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    HSN
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      No services found. Add your first service to get started.
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((s) => {
                    const Icon = typeIcon[s.type] || Settings;
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{s.name}</p>
                              <p className="text-xs text-gray-400 font-mono">{s.code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-bold uppercase border-gray-200 text-gray-600"
                          >
                            {s.type.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-gray-900">
                          ₹{s.basePrice.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-gray-500">
                          {s.gstRate}%{' '}
                          {s.gstInclusive && (
                            <span className="text-blue-600 font-semibold">(incl.)</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-500">
                          {s.hsnCode || '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            className={
                              s.isActive
                                ? 'bg-green-50 text-green-700 border-none'
                                : 'bg-gray-100 text-gray-500 border-none'
                            }
                          >
                            {s.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Bundle services into fixed-price clinical packages.
            </p>
            <Dialog open={packageDialogOpen} onOpenChange={setPackageDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" /> New Package
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {selectedPackageId ? 'Edit Package' : 'Create Care Package'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Package Name *
                    </label>
                    <Input
                      value={packageForm.name}
                      onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                      placeholder="e.g. Cardiac Wellness"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Description
                    </label>
                    <Input
                      value={packageForm.description}
                      onChange={(e) =>
                        setPackageForm({ ...packageForm, description: e.target.value })
                      }
                      placeholder="What this package includes"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={packageForm.isActive}
                      onCheckedChange={(v: boolean) =>
                        setPackageForm({ ...packageForm, isActive: v })
                      }
                    />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPackageDialogOpen(false);
                      setSelectedPackageId(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSavePackageServices}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {selectedPackageId ? 'Update Package' : 'Create Package'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {packages.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
              <Package className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">No Packages Defined</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                Bundle consultations, lab tests, and procedures into fixed-price packages.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{pkg.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {pkg.description || 'No description'}
                      </p>
                    </div>
                    <Badge
                      className={
                        pkg.isActive
                          ? 'bg-green-50 text-green-700 border-none'
                          : 'bg-gray-100 text-gray-500 border-none'
                      }
                    >
                      {pkg.isActive ? 'Active' : 'Draft'}
                    </Badge>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">
                      {pkg._count?.services ?? 0} services
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => handleAssignServices(pkg.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        onClick={() => handleDeletePackage(pkg.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Co-pay Rules Tab */}
        <TabsContent value="copay" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Configure insurer co-pay overrides per service type.
            </p>
            <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" /> Add Co-pay Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>New Co-pay Rule</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Insurer *
                    </label>
                    <Select
                      value={ruleForm.insurerId}
                      onValueChange={(v: string) => setRuleForm({ ...ruleForm, insurerId: v })}
                    >
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue placeholder="Select insurer" />
                      </SelectTrigger>
                      <SelectContent>
                        {insurers.map((i) => (
                          <SelectItem key={i.id} value={i.id}>
                            {i.insurerName} ({INSURER_TYPES[i.insurerType] || i.insurerType})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase">
                        Service Type
                      </label>
                      <Select
                        value={ruleForm.serviceType}
                        onValueChange={(v: string) => setRuleForm({ ...ruleForm, serviceType: v })}
                      >
                        <SelectTrigger className="h-10 rounded-lg">
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Services</SelectItem>
                          {SERVICE_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase">
                        Co-pay Type
                      </label>
                      <Select
                        value={ruleForm.copayType}
                        onValueChange={(v: string) => setRuleForm({ ...ruleForm, copayType: v })}
                      >
                        <SelectTrigger className="h-10 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                          <SelectItem value="FIXED">Fixed Amount (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      {ruleForm.copayType === 'PERCENTAGE' ? 'Percentage (%)' : 'Fixed Amount (₹)'}
                    </label>
                    <Input
                      type="number"
                      value={ruleForm.copayValue}
                      onChange={(e) =>
                        setRuleForm({ ...ruleForm, copayValue: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={ruleForm.isActive}
                      onCheckedChange={(v: boolean) => setRuleForm({ ...ruleForm, isActive: v })}
                    />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRuleDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateRule}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Create Rule
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Insurer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Service Scope
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                    Co-pay
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      No co-pay rules configured yet.
                    </td>
                  </tr>
                ) : (
                  rules.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="font-semibold text-gray-900">{r.insurer.insurerName}</p>
                            <p className="text-xs text-gray-400">
                              {INSURER_TYPES[r.insurer.insurerType] || r.insurer.insurerType}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {r.service ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] w-fit font-bold border-gray-200"
                            >
                              {r.service.name}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[10px] w-fit font-bold border-gray-200"
                            >
                              All Services
                            </Badge>
                          )}
                          {r.serviceType && (
                            <span className="text-[10px] text-gray-400 uppercase font-bold">
                              {r.serviceType.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-gray-900">
                          {r.copayType === 'PERCENTAGE'
                            ? `${r.copayValue}%`
                            : `₹${r.copayValue.toLocaleString('en-IN')}`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          className={
                            r.isActive
                              ? 'bg-green-50 text-green-700 border-none'
                              : 'bg-gray-100 text-gray-500 border-none'
                          }
                        >
                          {r.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteRule(r.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

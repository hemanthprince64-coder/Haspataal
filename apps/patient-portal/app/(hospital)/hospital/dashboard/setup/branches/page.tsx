/* eslint-disable */
'use client';

import {
  MapPin,
  Plus,
  Trash2,
  Building2,
  Globe,
  Phone,
  Loader2,
  CheckCircle,
  Save,
  ArrowRight,
  ArrowLeft,
  Clock,
  Shield,
  Stethoscope,
  Bed,
  Pill,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { useState, useEffect, useCallback } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface Branch {
  id: string;
  name: string;
  code: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  branchType: 'MAIN' | 'SATELLITE' | 'CLINIC' | 'DIAGNOSTIC';
  facilities: string[];
  openTime?: string;
  closeTime?: string;
  isHeadquarters: boolean;
  isActive: boolean;
}

const FACILITY_OPTIONS = [
  { id: 'OPD', label: 'Outpatient (OPD)', icon: Stethoscope },
  { id: 'IPD', label: 'Inpatient (IPD)', icon: Bed },
  { id: 'PHARMACY', label: 'Pharmacy', icon: Pill },
  { id: 'LAB', label: 'Laboratory', icon: Activity },
  { id: 'EMERGENCY', label: 'Emergency 24x7', icon: AlertCircle },
];

const BRANCH_TYPES = [
  { value: 'MAIN', label: 'Main Campus / HQ' },
  { value: 'SATELLITE', label: 'Satellite Hospital' },
  { value: 'CLINIC', label: 'Community Clinic' },
  { value: 'DIAGNOSTIC', label: 'Diagnostic Center' },
];

export default function BranchesSetupPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [hospitalData, setHospitalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const fetchBranches = useCallback(() => {
    setLoading(true);
    fetch('/api/hospital/branches')
      .then((r) => r.json())
      .then((data) => setBranches(data.branches ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchBranches();
    // Fetch hospital identity for pre-filling
    fetch('/api/hospital/identity')
      .then((r) => r.json())
      .then((data) => setHospitalData(data.hospital));
  }, [fetchBranches]);

  const handleSaveBranch = async (form: any) => {
    const method = editingBranch ? 'PUT' : 'POST';
    const url = editingBranch
      ? `/api/hospital/branches/${editingBranch.id}`
      : '/api/hospital/branches';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save branch');

      toast.success(editingBranch ? 'Branch updated' : 'Branch added');
      setDialogOpen(false);
      setEditingBranch(null);
      fetchBranches();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error saving branch');
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/hospital/branches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: active }),
      });
      if (!res.ok) throw new Error();
      setBranches((prev) => prev.map((b) => (b.id === id ? { ...b, isActive: active } : b)));
      toast.success(`Branch ${active ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update branch status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this branch? All associated data will be lost.'))
      return;
    try {
      const res = await fetch(`/api/hospital/branches/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setBranches((prev) => prev.filter((b) => b.id !== id));
      toast.success('Branch deleted');
    } catch {
      toast.error('Failed to delete branch');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Multi-Branch Management
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Coordinate multiple campuses and satellite facilities
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingBranch(null);
            setDialogOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-indigo-100 gap-2"
        >
          <Plus className="h-4 w-4" /> Add Facility
        </Button>
      </div>

      {/* Info Card */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 flex items-start gap-5 shadow-sm">
        <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm border border-indigo-50">
          <Globe className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-indigo-900">Distributed Clinical Operations</h3>
          <p className="text-sm text-indigo-700/80 mt-1 leading-relaxed max-w-2xl font-medium">
            Define independent branches or small clinics. Each branch can have its own bed capacity,
            operating hours, and service availability while sharing a central patient record
            database.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm font-bold text-slate-400">Loading branch infrastructure...</p>
        </div>
      ) : branches.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center">
          <div className="p-4 bg-slate-50 rounded-full mb-4">
            <Building2 className="h-12 w-12 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Satellite Branches</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto font-medium">
            Your primary headquarters is already active in the system. Add satellite clinics or
            additional campuses here.
          </p>
          <Button
            onClick={() => setDialogOpen(true)}
            variant="outline"
            className="mt-6 border-indigo-200 text-indigo-600 font-bold hover:bg-indigo-50"
          >
            Create First Branch
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-indigo-200 transition-all relative overflow-hidden flex flex-col"
            >
              {branch.isHeadquarters && (
                <div className="absolute top-0 right-0 px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black tracking-widest rounded-bl-xl shadow-sm">
                  HEADQUARTERS
                </div>
              )}

              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl shadow-sm ${branch.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}
                  >
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {branch.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-slate-100 text-slate-600 font-black px-2 py-0"
                      >
                        {branch.code}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        {branch.branchType}
                      </span>
                    </div>
                  </div>
                </div>
                {!branch.isHeadquarters && (
                  <Switch
                    checked={branch.isActive}
                    onCheckedChange={(v) => handleToggleActive(branch.id, v)}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 flex-1">
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5 text-sm text-slate-600 font-medium">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                    <span>
                      {branch.addressLine1}
                      {branch.city ? `, ${branch.city}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-600 font-medium">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span>{branch.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-600 font-medium">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>
                      {branch.openTime || '09:00'} - {branch.closeTime || '21:00'}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                    Enabled Facilities
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {branch.facilities?.length > 0 ? (
                      branch.facilities.map((f) => (
                        <Badge
                          key={f}
                          className="bg-white text-indigo-600 border-indigo-100 text-[9px] font-bold h-6"
                        >
                          {f}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">None configured</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingBranch(branch);
                      setDialogOpen(true);
                    }}
                    className="h-9 px-4 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  >
                    Edit Profile
                  </Button>
                  {!branch.isHeadquarters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(branch.id)}
                      className="h-9 px-4 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      Delete
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 text-xs font-bold text-indigo-600 hover:bg-indigo-50 gap-1 rounded-lg"
                >
                  Branch Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BranchDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingBranch(null);
        }}
        onSave={handleSaveBranch}
        hospitalData={hospitalData}
        editingBranch={editingBranch}
        branchCount={branches.length}
      />
    </div>
  );
}

function BranchDialog({ open, onClose, onSave, hospitalData, editingBranch, branchCount }: any) {
  const [form, setForm] = useState<any>({
    name: '',
    code: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    branchType: 'SATELLITE',
    facilities: ['OPD'],
    openTime: '09:00',
    closeTime: '21:00',
    isHeadquarters: false,
  });

  useEffect(() => {
    if (editingBranch) {
      setForm({
        ...editingBranch,
        facilities: editingBranch.facilities || [],
      });
    } else if (hospitalData) {
      // Auto-generate code
      const hospCode = hospitalData.registrationNumber?.split('-').pop()?.substring(0, 4) || 'HOSP';
      const branchIdx = (branchCount + 1).toString().padStart(2, '0');

      setForm((prev: any) => ({
        ...prev,
        city: hospitalData.city || '',
        state: hospitalData.state || '',
        pincode: hospitalData.pincode || '',
        addressLine1: hospitalData.addressLine1 || '',
        code: `${hospCode}-${branchIdx}`,
      }));
    }
  }, [editingBranch, hospitalData, branchCount, open]);

  const toggleFacility = (id: string) => {
    setForm((prev: any) => ({
      ...prev,
      facilities: prev.facilities.includes(id)
        ? prev.facilities.filter((f: string) => f !== id)
        : [...prev.facilities, id],
    }));
  };

  const isInvalid = !form.name || !form.code || !form.addressLine1 || !form.city || !form.pincode;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingBranch ? 'Edit Branch Facility' : 'Add New Clinical Branch'}
          </DialogTitle>
          <DialogDescription>
            Configure location, capabilities, and operating hours for this facility.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Group 1: Basic Identity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                Branch / Facility Name
              </label>
              <Input
                placeholder="e.g. LifeCare Satellite Clinic"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-10 text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                Branch Code
              </label>
              <Input
                placeholder="LC-01"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="h-10 text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                Facility Type
              </label>
              <select
                value={form.branchType}
                onChange={(e) => setForm({ ...form, branchType: e.target.value })}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {BRANCH_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                Primary Contact
              </label>
              <Input
                placeholder="+91 98765..."
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="h-10 text-sm"
              />
            </div>
          </div>

          {/* Group 2: Address */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" /> Physical Address
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Address Line 1"
                value={form.addressLine1}
                onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                className="h-10 text-sm"
              />
              <Input
                placeholder="Address Line 2 (Optional)"
                value={form.addressLine2}
                onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
                className="h-10 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Input
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="h-10 text-sm"
              />
              <Input
                placeholder="State"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="h-10 text-sm"
              />
              <Input
                placeholder="Pincode"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                maxLength={6}
                className="h-10 text-sm font-mono"
              />
            </div>
          </div>

          {/* Group 3: Capabilities */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" /> Facility Capabilities
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {FACILITY_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = form.facilities.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleFacility(opt.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2
                      ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[9px] font-bold leading-tight">
                      {opt.label.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 4: Operational */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-3">
                <Clock className="h-3.5 w-3.5" /> Operating Hours
              </label>
              <div className="flex items-center gap-3">
                <Input
                  type="time"
                  value={form.openTime}
                  onChange={(e) => setForm({ ...form, openTime: e.target.value })}
                  className="h-10"
                />
                <span className="text-slate-300">to</span>
                <Input
                  type="time"
                  value={form.closeTime}
                  onChange={(e) => setForm({ ...form, closeTime: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 self-end">
              <div>
                <p className="text-xs font-bold text-slate-800">Main Headquarters</p>
                <p className="text-[10px] text-slate-500 font-medium">
                  Global HQ for clinical audits
                </p>
              </div>
              <Switch
                checked={form.isHeadquarters}
                onCheckedChange={(v) => setForm({ ...form, isHeadquarters: v })}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-0 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl h-11 px-6 font-bold text-slate-600"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSave(form)}
            disabled={isInvalid}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-8 font-bold shadow-lg shadow-indigo-100"
          >
            {editingBranch ? 'Update Branch' : 'Create Branch'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

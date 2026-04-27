"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, Trash2, Building2, Globe, Phone, Loader2, CheckCircle, Save, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  contactNumber: string;
  isMainBranch: boolean;
  isActive: boolean;
}

export default function BranchesSetupPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetch("/api/hospital/branches")
      .then(r => r.json())
      .then(data => setBranches(data.branches ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleAddBranch = async (form: any) => {
    try {
      const res = await fetch("/api/hospital/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add branch");
      }
      setBranches(prev => [...prev, data.branch]);
      toast.success("Branch added successfully");
      setDialogOpen(false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to add branch";
      toast.error(msg);
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    setBranches(prev => prev.map(b => b.id === id ? { ...b, isActive: active } : b));
    try {
      await fetch(`/api/hospital/branches/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: active }),
      });
      toast.success(`Branch ${active ? "activated" : "deactivated"}`);
    } catch {
      toast.error("Failed to update branch status");
      // Revert optimistic update
      setBranches(prev => prev.map(b => b.id === id ? { ...b, isActive: !active } : b));
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-xl">
            <Building2 className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Multi-Branch Management</h1>
            <p className="text-xs text-slate-500">Manage multiple locations, satellite clinics, and main campus</p>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          <Plus className="h-4 w-4" /> Add New Branch
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 flex items-start gap-4">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
          <Globe className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-blue-900">Unified Operations</h3>
          <p className="text-xs text-blue-700 mt-1 leading-relaxed">
            Configure branches to share the same Service Catalog and Doctors, or keep them isolated. 
            All revenue and patient data will be tagged with the respective Branch ID.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-400" /></div>
      ) : branches.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <Building2 className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">No additional branches found</p>
          <p className="text-xs text-slate-400">Your main campus is already active. Add satellite clinics here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map(branch => (
            <div key={branch.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow relative overflow-hidden">
              {branch.isMainBranch && (
                <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-600 text-white text-[9px] font-bold rounded-bl-lg">
                  MAIN BRANCH
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{branch.name}</h3>
                  <p className="text-[10px] font-mono text-slate-400 uppercase">{branch.code}</p>
                </div>
                {!branch.isMainBranch && (
                  <Switch checked={branch.isActive} onCheckedChange={(v) => handleToggleActive(branch.id, v)} />
                )}
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {branch.address}, {branch.city}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {branch.contactNumber}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <Badge variant="outline" className="text-[10px] bg-slate-50">Active Services: 24</Badge>
                <Button variant="ghost" size="sm" className="text-[10px] h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                  Manage Settings <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BranchDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleAddBranch} />
    </div>
  );
}

function BranchDialog({ open, onClose, onSave }: any) {
  const [form, setForm] = useState({
    name: "", code: "", address: "", city: "", contactNumber: "", isMainBranch: false
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add New Branch</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Branch Name</label>
              <Input placeholder="e.g. Indiranagar Clinic" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Code</label>
              <Input placeholder="IN01" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} maxLength={4} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Full Address</label>
            <Input placeholder="Street, Landmark" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">City</label>
              <Input placeholder="Bangalore" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Contact Number</label>
              <Input placeholder="+91 987..." value={form.contactNumber} onChange={e => setForm({...form, contactNumber: e.target.value})} />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-800">Main Branch</p>
              <p className="text-[10px] text-slate-500">Designate as primary HQ</p>
            </div>
            <Switch checked={form.isMainBranch} onCheckedChange={v => setForm({...form, isMainBranch: v})} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)} disabled={!form.name || !form.code} className="bg-indigo-600 text-white">Save Branch</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

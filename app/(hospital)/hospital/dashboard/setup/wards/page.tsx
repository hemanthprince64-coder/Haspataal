"use client";

import { useState, useEffect } from "react";
import { BedDouble, Plus, Trash2, LayoutGrid, List, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const BED_TYPES = ["GENERAL", "ICU", "NICU", "PRIVATE", "SEMI_PRIVATE", "EMERGENCY"];

export default function WardSetupPage() {
  const [beds, setBeds] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/hospital/wards/beds").then(r => r.json()),
      fetch("/api/hospital/departments").then(r => r.json())
    ]).then(([bData, dData]) => {
      setBeds(bData.beds ?? []);
      setDepartments(dData.departments?.filter((d: any) => d.type !== "OPD") ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const handleAddBeds = async (form: any) => {
    const res = await fetch("/api/hospital/wards/beds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.beds) setBeds(prev => [...prev, ...data.beds]);
    setDialogOpen(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-xl">
            <BedDouble className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Ward & Bed Setup</h1>
            <p className="text-xs text-slate-500">Configure bed categories, ward locations, and inventory</p>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
          <Plus className="h-4 w-4" /> Add Beds
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-purple-400" /></div>
      ) : beds.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <BedDouble className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">No beds configured</p>
          <p className="text-xs text-slate-400">Define your ward structure to start IPD admissions</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {beds.map(bed => (
            <div key={bed.id} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mx-auto mb-2">
                <BedDouble className="h-4 w-4 text-slate-400" />
              </div>
              <p className="text-xs font-bold text-slate-900">{bed.name}</p>
              <Badge variant="outline" className="text-[9px] mt-1 uppercase">{bed.type}</Badge>
              <p className="text-[9px] text-slate-400 mt-1">{bed.wardName}</p>
            </div>
          ))}
        </div>
      )}

      <BedDialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        onSave={handleAddBeds} 
        departments={departments}
      />
    </div>
  );
}

function BedDialog({ open, onClose, onSave, departments }: any) {
  const [form, setForm] = useState({
    prefix: "B",
    count: 10,
    type: "GENERAL",
    deptId: "",
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Bulk Add Beds</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Ward / Department</label>
            <select 
              value={form.deptId} 
              onChange={e => setForm({...form, deptId: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              <option value="">Select Ward</option>
              {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Prefix</label>
              <Input value={form.prefix} onChange={e => setForm({...form, prefix: e.target.value.toUpperCase()})} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Count</label>
              <Input type="number" value={form.count} onChange={e => setForm({...form, count: parseInt(e.target.value)})} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Bed Type</label>
            <select 
              value={form.type} 
              onChange={e => setForm({...form, type: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              {BED_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)} disabled={!form.deptId} className="bg-purple-600 text-white">Create Beds</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

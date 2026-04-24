"use client";

import { useState, useEffect } from "react";
import { Stethoscope, Plus, Search, UserPlus, Star, Clock, DollarSign, Loader2, Check, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface Doctor {
  id: string;
  name: string;
  email: string;
  mobile: string;
  speciality: string;
  experienceYears: number;
  consultationFee: number;
  followUpFee: number;
  followUpDays: number;
  isActive: boolean;
  departments: string[];
}

export default function DoctorsSetupPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [departments, setDepartments] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/hospital/doctors").then(r => r.json()),
      fetch("/api/hospital/departments").then(r => r.json())
    ]).then(([dData, deptData]) => {
      setDoctors(dData.doctors ?? []);
      setDepartments(deptData.departments ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const handleAddDoctor = async (form: any) => {
    const res = await fetch("/api/hospital/doctors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.doctor) setDoctors(prev => [...prev, data.doctor]);
    setDialogOpen(false);
  };

  const filtered = doctors.filter(d => 
    d.name.toLowerCase().includes(filter.toLowerCase()) || 
    d.speciality.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl">
            <Stethoscope className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Doctor Configuration</h1>
            <p className="text-xs text-slate-500">Manage doctor profiles, fees, and department assignments</p>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <UserPlus className="h-4 w-4" /> Add Doctor
        </Button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          value={filter} 
          onChange={e => setFilter(e.target.value)} 
          placeholder="Search doctors by name or speciality..." 
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <Stethoscope className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">No doctors found</p>
          <p className="text-xs text-slate-400">Add your first doctor to start taking appointments</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doc => (
            <div key={doc.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                    {doc.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{doc.name}</h3>
                    <p className="text-xs text-blue-600 font-medium">{doc.speciality}</p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                      <Clock className="h-3 w-3" /> {doc.experienceYears} Years Exp
                    </div>
                  </div>
                </div>
                <Switch checked={doc.isActive} />
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">OPD Fee</p>
                  <p className="text-sm font-bold text-slate-900">₹{doc.consultationFee}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Follow-up</p>
                  <p className="text-sm font-bold text-slate-900">₹{doc.followUpFee} <span className="text-[10px] text-slate-400 font-normal">({doc.followUpDays}d)</span></p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {doc.departments.map(dId => {
                  const dName = departments.find(d => d.id === dId)?.name ?? "Dept";
                  return <Badge key={dId} variant="secondary" className="text-[9px] px-1.5">{dName}</Badge>
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <DoctorDialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        onSave={handleAddDoctor}
        departments={departments}
      />
    </div>
  );
}

function DoctorDialog({ open, onClose, onSave, departments }: any) {
  const [form, setForm] = useState({
    name: "", speciality: "", experienceYears: 0,
    consultationFee: 500, followUpFee: 0, followUpDays: 7,
    mobile: "", email: "", deptIds: [] as string[]
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add New Doctor</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <Input placeholder="Speciality (e.g. Surgeon)" value={form.speciality} onChange={e => setForm({...form, speciality: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Mobile" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} />
            <Input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Consult Fee</label>
              <Input type="number" value={form.consultationFee} onChange={e => setForm({...form, consultationFee: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">F/U Fee</label>
              <Input type="number" value={form.followUpFee} onChange={e => setForm({...form, followUpFee: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">F/U Days</label>
              <Input type="number" value={form.followUpDays} onChange={e => setForm({...form, followUpDays: parseInt(e.target.value)})} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">Assign Departments</label>
            <div className="flex flex-wrap gap-2">
              {departments.map((d: any) => (
                <button
                  key={d.id}
                  onClick={() => {
                    const exists = form.deptIds.includes(d.id);
                    setForm({
                      ...form,
                      deptIds: exists ? form.deptIds.filter(id => id !== d.id) : [...form.deptIds, d.id]
                    });
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    form.deptIds.includes(d.id) ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)} disabled={!form.name || !form.mobile}>Save Doctor</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

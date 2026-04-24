"use client";

import { useState, useEffect } from "react";
import { TestTube, Plus, Search, Trash2, Microscope, Loader2, Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function DiagnosticsSetupPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetch("/api/hospital/diagnostics/pricing")
      .then(r => r.json())
      .then(data => setTests(data.pricing ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleAddTest = async (form: any) => {
    const res = await fetch("/api/hospital/diagnostics/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.test) setTests(prev => [...prev, data.test]);
    setDialogOpen(false);
  };

  const filtered = tests.filter(t => t.testName.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-xl">
            <TestTube className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Diagnostics Setup</h1>
            <p className="text-xs text-slate-500">Configure lab tests, imaging services, and pricing catalogs</p>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          <Plus className="h-4 w-4" /> Add Test/Service
        </Button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search diagnostic tests..." className="pl-10" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <Microscope className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">No diagnostic tests priced</p>
          <p className="text-xs text-slate-400">Set up your lab and imaging price list to start taking orders</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Test Name", "Category", "Hosp. Price", "Patient MRP", "Turnaround"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(test => (
                <tr key={test.id}>
                  <td className="px-4 py-3 font-semibold text-slate-800">{test.testName}</td>
                  <td className="px-4 py-3"><Badge variant="secondary" className="text-[10px]">{test.category || "LAB"}</Badge></td>
                  <td className="px-4 py-3 text-slate-600">₹{test.hospitalPrice}</td>
                  <td className="px-4 py-3 font-bold text-indigo-600">₹{test.patientMrp}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{test.turnaroundHours || 24} Hours</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TestDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleAddTest} />
    </div>
  );
}

function TestDialog({ open, onClose, onSave }: any) {
  const [form, setForm] = useState({
    testName: "", category: "LAB", hospitalPrice: 0, patientMrp: 0, turnaroundHours: 24
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add Diagnostic Service</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <Input placeholder="Test Name (e.g. CBC, MRI Brain)" value={form.testName} onChange={e => setForm({...form, testName: e.target.value})} />
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Category</label>
            <select 
              value={form.category} 
              onChange={e => setForm({...form, category: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              <option value="LAB">Pathology Lab</option>
              <option value="IMAGING">Radiology / Imaging</option>
              <option value="CARDIOLOGY">Cardiology (ECG/Echo)</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Hospital Cost (₹)</label>
              <Input type="number" value={form.hospitalPrice} onChange={e => setForm({...form, hospitalPrice: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Patient MRP (₹)</label>
              <Input type="number" value={form.patientMrp} onChange={e => setForm({...form, patientMrp: parseFloat(e.target.value)})} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Turnaround Time (Hours)</label>
            <Input type="number" value={form.turnaroundHours} onChange={e => setForm({...form, turnaroundHours: parseInt(e.target.value)})} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)} disabled={!form.testName} className="bg-indigo-600 text-white">Save Service</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Pill, Plus, Search, Trash2, Package, AlertCircle, Loader2, Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function PharmacySetupPage() {
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetch("/api/hospital/pharmacy/stock")
      .then(r => r.json())
      .then(data => setStock(data.stock ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleAddStock = async (form: any) => {
    const res = await fetch("/api/hospital/pharmacy/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.item) setStock(prev => [...prev, data.item]);
    setDialogOpen(false);
  };

  const filtered = stock.filter(s => s.drugName.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-xl">
            <Pill className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Pharmacy Setup</h1>
            <p className="text-xs text-slate-500">Manage drug catalog, initial stock levels, and dispensing rules</p>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Plus className="h-4 w-4" /> Add Medication
        </Button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search medications..." className="pl-10" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <Package className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">No pharmacy stock found</p>
          <p className="text-xs text-slate-400">Add medications to enable in-house pharmacy dispensing</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Medication", "Type", "Batch", "Quantity", "Expiry", "Price"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(item => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-semibold text-slate-800">{item.drugName}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{item.type || "TABLET"}</Badge></td>
                  <td className="px-4 py-3 text-xs font-mono">{item.batchNumber}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${item.quantity < 50 ? "text-red-500" : "text-slate-700"}`}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{new Date(item.expiryDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-semibold">₹{item.mrp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <StockDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleAddStock} />
    </div>
  );
}

function StockDialog({ open, onClose, onSave }: any) {
  const [form, setForm] = useState({
    drugName: "", type: "TABLET", batchNumber: "", quantity: 100, mrp: 0, expiryDate: ""
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add Inventory</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <Input placeholder="Drug Name" value={form.drugName} onChange={e => setForm({...form, drugName: e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Batch Number" value={form.batchNumber} onChange={e => setForm({...form, batchNumber: e.target.value})} />
            <select 
              value={form.type} 
              onChange={e => setForm({...form, type: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              <option value="TABLET">Tablet</option>
              <option value="SYRUP">Syrup</option>
              <option value="INJECTION">Injection</option>
              <option value="CREAM">Cream</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input type="number" placeholder="Qty" value={form.quantity} onChange={e => setForm({...form, quantity: parseInt(e.target.value)})} />
            <Input type="number" placeholder="MRP" value={form.mrp} onChange={e => setForm({...form, mrp: parseFloat(e.target.value)})} />
            <Input type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)} disabled={!form.drugName} className="bg-emerald-600 text-white">Save Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* eslint-disable */
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Users, Search, Phone, MapPin, Calendar, Activity,
  Plus, CheckCircle2, Clock, Send,
} from 'lucide-react';

interface AshaWorker {
  id: string;
  name: string;
  mobile: string;
  village: string;
  block: string;
  panchayat: string;
  assignedPatients: number;
  active: boolean;
}

interface AshaVisitLogFormProps {
  patientId: string;
  ashaId: string;
  onSubmit: (log: any) => void;
}

function AshaVisitLogForm({ patientId, ashaId, onSubmit }: AshaVisitLogFormProps) {
  const [formData, setFormData] = useState({
    patientId,
    ashaId,
    visitDate: new Date().toISOString().split('T')[0],
    bpSystolic: '',
    bpDiastolic: '',
    weight: '',
    temperature: '',
    symptoms: '',
    adviceGiven: '',
    ifaGiven: '0',
    ttGiven: false,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      bpSystolic: formData.bpSystolic ? parseInt(formData.bpSystolic) : undefined,
      bpDiastolic: formData.bpDiastolic ? parseInt(formData.bpDiastolic) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
      symptoms: formData.symptoms ? formData.symptoms.split(',').map((s) => s.trim()) : [],
      adviceGiven: formData.adviceGiven ? formData.adviceGiven.split(',').map((s) => s.trim()) : [],
      ifaGiven: parseInt(formData.ifaGiven) || 0,
    });
    setFormData({
      patientId,
      ashaId,
      visitDate: new Date().toISOString().split('T')[0],
      bpSystolic: '',
      bpDiastolic: '',
      weight: '',
      temperature: '',
      symptoms: '',
      adviceGiven: '',
      ifaGiven: '0',
      ttGiven: false,
      notes: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
      <h3 className="font-bold text-slate-800 flex items-center gap-2">
        <Plus className="w-4 h-4" /> Log Home Visit
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-bold text-slate-600">Date</Label>
          <Input type="date" value={formData.visitDate} onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })} className="mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs font-bold text-slate-600">BP Systolic</Label>
            <Input type="number" placeholder="120" value={formData.bpSystolic} onChange={(e) => setFormData({ ...formData, bpSystolic: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs font-bold text-slate-600">BP Diastolic</Label>
            <Input type="number" placeholder="80" value={formData.bpDiastolic} onChange={(e) => setFormData({ ...formData, bpDiastolic: e.target.value })} className="mt-1" />
          </div>
        </div>
        <div>
          <Label className="text-xs font-bold text-slate-600">Weight (kg)</Label>
          <Input type="number" placeholder="58" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs font-bold text-slate-600">Temp (°F)</Label>
          <Input type="number" placeholder="98.6" value={formData.temperature} onChange={(e) => setFormData({ ...formData, temperature: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs font-bold text-slate-600">IFA Tablets Given</Label>
          <Input type="number" placeholder="0" value={formData.ifaGiven} onChange={(e) => setFormData({ ...formData, ifaGiven: e.target.value })} className="mt-1" />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input type="checkbox" id="ttGiven" checked={formData.ttGiven} onChange={(e) => setFormData({ ...formData, ttGiven: e.target.checked })} className="h-4 w-4 rounded" />
          <Label htmlFor="ttGiven" className="text-sm font-medium">TT Vaccination Given</Label>
        </div>
      </div>
      <div>
        <Label className="text-xs font-bold text-slate-600">Symptoms (comma-separated)</Label>
        <Input placeholder="nausea, headache, swelling" value={formData.symptoms} onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })} className="mt-1" />
      </div>
      <div>
        <Label className="text-xs font-bold text-slate-600">Advice Given (comma-separated)</Label>
        <Input placeholder="rest, IFA, next visit" value={formData.adviceGiven} onChange={(e) => setFormData({ ...formData, adviceGiven: e.target.value })} className="mt-1" />
      </div>
      <div>
        <Label className="text-xs font-bold text-slate-600">Notes</Label>
        <textarea placeholder="Additional observations..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full mt-1 p-2 rounded-lg border border-slate-200 text-sm" rows={2} />
      </div>
      <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 rounded-xl font-bold">
        <Send className="w-4 h-4 mr-2" /> Submit Visit Report
      </Button>
    </form>
  );
}

export default function AshaWorkerModule() {
  const [selectedAsha, setSelectedAsha] = useState<string | null>(null);
  const [visitLogs, setVisitLogs] = useState<any[]>([]);

  const mockAshas: AshaWorker[] = [
    { id: 'asha-1', name: 'Kalpana Devi', mobile: '9876543210', village: 'Rampur', block: 'Bikramganj', panchayat: 'Rampur East', assignedPatients: 12, active: true },
    { id: 'asha-2', name: 'Sarita Kumari', mobile: '9876543211', village: 'Bikramganj', block: 'Bikramganj', panchayat: 'Bikramganj', assignedPatients: 18, active: true },
    { id: 'asha-3', name: 'Meera Singh', mobile: '9876543212', village: 'Piro', block: 'Piro', panchayat: 'Piro', assignedPatients: 8, active: true },
  ];

  const handleVisitSubmit = (log: any) => {
    setVisitLogs((prev) => [...prev, { ...log, id: `visit-${Date.now()}`, syncedAt: new Date() }]);
  };

  return (
    <div className="space-y-6">
      {/* ASHA Worker Selector */}
      <Card className="rounded-[2rem] border-slate-200/60 shadow-xl overflow-hidden">
        <CardHeader className="bg-pink-50/50 border-b border-pink-100 p-6">
          <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-600" /> ASHA Worker Assignment
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            Link ASHA workers to patients by village/block
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockAshas.map((asha) => (
              <div
                key={asha.id}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAsha === asha.id ? 'border-pink-500 bg-pink-50' : 'border-slate-200 hover:border-pink-300'}`}
                onClick={() => setSelectedAsha(asha.id)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold">
                    {asha.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{asha.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {asha.mobile}
                    </p>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-slate-600">
                  <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {asha.village}, {asha.block}</p>
                  <p className="flex items-center gap-1"><Users className="w-3 h-3" /> {asha.assignedPatients}/20 patients</p>
                </div>
                {selectedAsha === asha.id && (
                  <Badge className="mt-2 bg-pink-100 text-pink-700">Selected</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visit Logging Form */}
      {selectedAsha && (
        <Card className="rounded-[2rem] border-slate-200/60 shadow-xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
            <CardTitle className="text-xl font-black tracking-tight">Log Home Visit</CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Record vitals, IFA distribution, and advice given
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <AshaVisitLogForm patientId="patient-mock" ashaId={selectedAsha} onSubmit={handleVisitSubmit} />
          </CardContent>
        </Card>
      )}

      {/* Recent Visit Logs */}
      {visitLogs.length > 0 && (
        <Card className="rounded-[2rem] border-slate-200/60 shadow-xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-pink-600" /> Recent Visit Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {visitLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm text-slate-800">{new Date(log.visitDate).toLocaleDateString('en-IN')}</p>
                    <Badge className="bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Synced
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    BP: {log.bpSystolic || '—'}/{log.bpDiastolic || '—'} | Weight: {log.weight || '—'} kg | IFA: {log.ifaGiven} tablets
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

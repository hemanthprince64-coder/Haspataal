/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Baby,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Printer,
  TrendingUp,
  Activity,
  Download,
  FileText,
} from 'lucide-react';
import { generatePMJAYClaim } from '@/lib/services/pmjay';

export default function AncAdminDashboard() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, highRisk: 0, overdue: 0, completed: 0 });

  useEffect(() => {
    // Load live patient data from ANC API in production.
    const mockPatients = [
      { id: '1', name: 'Sunita Devi', age: 24, weeks: 16, visits: 2, highRisk: false, nextVisit: '2026-06-20', scheme: 'JSY', asha: 'Kalpana' },
      { id: '2', name: 'Rekha Kumari', age: 32, weeks: 28, visits: 3, highRisk: true, nextVisit: '2026-06-15', scheme: 'JSY+PMMVY', asha: 'Sarita' },
      { id: '3', name: 'Priyanka Singh', age: 19, weeks: 8, visits: 1, highRisk: false, nextVisit: '2026-06-22', scheme: 'PMMVY', asha: 'Kalpana' },
      { id: '4', name: 'Anita Devi', age: 36, weeks: 34, visits: 4, highRisk: true, nextVisit: '2026-06-18', scheme: 'JSY', asha: 'Sarita' },
      { id: '5', name: 'Meena Kumari', age: 22, weeks: 20, visits: 2, highRisk: false, nextVisit: '2026-06-25', scheme: 'JSY+PMMVY', asha: 'Kalpana' },
    ];
    setPatients(mockPatients);
    setStats({
      total: mockPatients.length,
      active: mockPatients.filter(p => p.weeks < 40).length,
      highRisk: mockPatients.filter(p => p.highRisk).length,
      overdue: mockPatients.filter(p => new Date(p.nextVisit) < new Date()).length,
      completed: mockPatients.filter(p => p.visits >= 4).length,
    });
  }, []);

  const filteredPatients = patients.filter((p) => {
    if (filter === 'highrisk' && !p.highRisk) return false;
    if (filter === 'overdue' && new Date(p.nextVisit) >= new Date()) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleExportMCP = async () => {
    setExporting(true);
    try {
      await Promise.all(filteredPatients.map(p => printMcpCard(p.id)));
    } finally {
      setExporting(false);
    }
  };

  const printMcpCard = async (patientId: string) => {
    window.open(`/api/hospital/anc/mcp-card/${patientId}`, '_blank', 'width=400,height=600');
  };

  const exportDHIS2 = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/hospital/anc/export?type=dhis2', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hospitalId: 'local', patientId: undefined }) });
      const data = await res.json().catch(() => ({}));
      alert(data?.message || (data?.ok ? 'DHIS2 export done' : 'DHIS2 export failed'));
    } catch (e) {
      console.error('DHIS2 export failed:', e);
      alert('DHIS2 export failed. See console.');
    } finally {
      setExporting(false);
    }
  };

  const exportPMJAY = async () => {
    if (filteredPatients.length === 0) {
      alert('No filtered patients to export.');
      return;
    }
    setExporting(true);
    try {
      const claims = [];
      for (const p of filteredPatients) {
        const visitId = `anc-${p.id}-${Date.now()}`;
        const claim = await generatePMJAYClaim(visitId);
        if (claim) claims.push(claim);
      }
      const blob = new Blob([JSON.stringify({ claims, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pmjay-anc-batch-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('PMJAY export failed:', e);
      alert('PMJAY export failed. See console.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">ANC Admin Dashboard</h1>
          <p className="text-slate-500 font-medium">Bihar PHC Maternal Health Tracking</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-xl font-bold" onClick={handleExportMCP} disabled={exporting || filteredPatients.length === 0}>
            <Printer className="w-4 h-4 mr-2" /> {exporting ? 'Generating…' : 'Print MCP Cards'}
          </Button>
          <Button variant="outline" className="rounded-xl font-bold" onClick={exportDHIS2} disabled={exporting}>
            <Download className="w-4 h-4 mr-2" /> DHIS2
          </Button>
          <Button variant="outline" className="rounded-xl font-bold" onClick={exportPMJAY} disabled={exporting}>
            <FileText className="w-4 h-4 mr-2" /> PMJAY
          </Button>
          <Button className="bg-pink-600 hover:bg-pink-700 rounded-xl font-bold">
            <Activity className="w-4 h-4 mr-2" /> Register New Patient
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Total ANC', value: stats.total, icon: Baby, color: 'bg-blue-100 text-blue-600' },
          { label: 'Active', value: stats.active, icon: Users, color: 'bg-emerald-100 text-emerald-600' },
          { label: 'High-Risk', value: stats.highRisk, icon: AlertTriangle, color: 'bg-rose-100 text-rose-600' },
          { label: 'Overdue', value: stats.overdue, icon: Clock, color: 'bg-amber-100 text-amber-600' },
          { label: 'Completed 4+', value: stats.completed, icon: CheckCircle2, color: 'bg-violet-100 text-violet-600' },
        ].map((stat) => (
          <Card key={stat.label} className="rounded-2xl border-slate-200/60">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input placeholder="Search patient name..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl h-12 font-bold" />
        </div>
        <div className="flex gap-2">
          {['all', 'highrisk', 'overdue'].map((f) => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)} className="rounded-xl font-bold capitalize">
              <Filter className="w-4 h-4 mr-2" /> {f === 'all' ? 'All Patients' : f === 'highrisk' ? 'High Risk' : 'Overdue'}
            </Button>
          ))}
        </div>
      </div>

      {/* Patient List */}
      <Card className="rounded-2xl border-slate-200/60 overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-xl font-black tracking-tight">Registered ANC Patients</CardTitle>
          <CardDescription className="text-slate-500 font-medium">{filteredPatients.length} patients found</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold text-sm">
                  {patient.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800 truncate">{patient.name}</p>
                    {patient.highRisk && (
                      <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200 text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" /> High Risk
                      </Badge>
                    )}
                    {new Date(patient.nextVisit) < new Date() && (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-xs">
                        <Clock className="w-3 h-3 mr-1" /> Overdue
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Age {patient.age} | Week {patient.weeks} | {patient.visits} visit(s) | ASHA: {patient.asha}
                  </p>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-slate-700">Next Visit</p>
                  <p className="text-xs text-slate-500">{patient.nextVisit}</p>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-slate-700">Scheme</p>
                  <p className="text-xs text-slate-500">{patient.scheme}</p>
                </div>
                <Button variant="ghost" size="sm" className="rounded-lg text-pink-600 hover:text-pink-700 font-bold">
                  View
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

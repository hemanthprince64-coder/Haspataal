'use client';

import {
  FolderHeart,
  Search,
  Plus,
  FileText,
  FlaskConical,
  ReceiptText,
  Stethoscope,
} from 'lucide-react';

import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RecordsList from '@/features/patient/components/RecordsList';

export default function RecordsPage() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch('/api/patient/records');
        if (!res.ok) throw new Error('Failed to fetch records');
        const data = await res.json();

        const mapped = [];

        data.prescriptions?.forEach((p) => {
          const meds = p.items?.map((i) => i.medName).join(', ') || '';
          mapped.push({
            id: p.id,
            type: 'Prescription',
            title: meds || 'Prescription',
            doctor: p.doctor?.fullName || 'Doctor',
            date: new Date(p.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
            icon: <FileText className="w-5 h-5 text-blue-600" />,
            bgColor: 'bg-blue-100/50',
            raw: p,
          });
        });

        data.labOrders?.forEach((order) => {
          const tests =
            order.items?.map((i) => i.test?.testName || i.testName).join(', ') || 'Lab Test';
          mapped.push({
            id: order.id,
            type: 'Lab Report',
            title: tests,
            doctor: order.doctor?.fullName || 'Lab',
            date: new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
            icon: <FlaskConical className="w-5 h-5 text-teal-600" />,
            bgColor: 'bg-teal-100/50',
            raw: order,
          });
        });

        data.invoices?.forEach((inv) => {
          mapped.push({
            id: inv.id,
            type: 'Invoice',
            title: inv.hospital?.displayName || inv.hospital?.legalName || 'Hospital',
            doctor: `₹${Number(inv.totalAmount || 0).toLocaleString('en-IN')}`,
            date: new Date(inv.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
            icon: <ReceiptText className="w-5 h-5 text-amber-600" />,
            bgColor: 'bg-amber-100/50',
            raw: inv,
          });
        });

        data.records?.forEach((rec) => {
          mapped.push({
            id: rec.id,
            type: 'Clinical Note',
            title: rec.diagnosis || 'Visit Record',
            doctor: rec.doctor?.fullName || 'Doctor',
            date: new Date(rec.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
            icon: <Stethoscope className="w-5 h-5 text-purple-600" />,
            bgColor: 'bg-purple-100/50',
            raw: rec,
          });
        });

        mapped.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecords(mapped);
      } catch {
        // records will remain empty
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      (r.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.doctor || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.type || '').toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      activeTab === 'all' || r.type.toLowerCase().includes(activeTab.replace('s', ''));
    return matchesSearch && matchesTab;
  });

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="secondary"
                className="text-blue-700 bg-blue-100/50 hover:bg-blue-100 border-blue-200 px-3 py-1 font-bold text-[10px] uppercase tracking-[0.2em] backdrop-blur-sm"
              >
                <FolderHeart className="w-3.5 h-3.5 mr-2" /> Digital Vault
              </Badge>
              <Badge
                variant="outline"
                className="text-emerald-600 border-emerald-200 bg-emerald-50 px-3 py-1 font-bold text-[10px] uppercase tracking-[0.2em]"
              >
                Encrypted
              </Badge>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-2">
              Medical Records
            </h1>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">
              Your secure hub for medical history and reports.
            </p>
          </div>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 h-16 px-8 rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-6 h-6 mr-3" /> Upload Record
          </Button>
        </div>
      </div>

      <Card className="mb-10 p-1.5 border-slate-200/60 shadow-xl shadow-slate-200/5 rounded-[1.5rem] bg-white relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/0 to-blue-50/0 group-hover:to-blue-50/30 transition-all duration-500 pointer-events-none" />
        <div className="flex items-center relative z-10">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500/50 w-6 h-6 group-focus-within:text-blue-500 transition-colors duration-300" />
            <Input
              placeholder="Find records by doctor, hospital, or date..."
              className="w-full pl-16 border-0 focus-visible:ring-0 bg-transparent text-lg h-16 font-medium placeholder:text-slate-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100/80 p-1 rounded-xl mb-8 space-x-1">
          <TabsTrigger
            value="all"
            className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
          >
            All Files
          </TabsTrigger>
          <TabsTrigger
            value="prescriptions"
            className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
          >
            Prescriptions
          </TabsTrigger>
          <TabsTrigger
            value="labs"
            className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
          >
            Lab Reports
          </TabsTrigger>
          <TabsTrigger
            value="bills"
            className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
          >
            Bills
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <div
            className={
              loading
                ? 'opacity-50 pointer-events-none transition-opacity duration-300'
                : 'transition-opacity duration-300'
            }
          >
            <RecordsList records={filteredRecords} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3, Users, Clock, ShieldCheck, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CMODashboard() {
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">CMO Intelligence</h1>
          <p className="text-slate-500 mt-2 text-lg">Hospital performance vs. Network benchmarks.</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right mr-6">
            <p className="text-sm font-medium text-slate-400">Haspataal Recovery ROI</p>
            <p className="text-2xl font-bold text-blue-600">₹2.34L this month</p>
          </div>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-12 rounded-xl shadow-lg transition-all">
            Generate Quarterly Audit
          </Button>
        </div>
      </div>

      {/* Primary Intelligence Row */}
      <div className="grid grid-cols-3 gap-8 mb-10">
        {/* Retention vs Network */}
        <Card className="shadow-2xl border-0 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck className="w-24 h-24 text-blue-900" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" /> Retention Success
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-baseline gap-4">
              <h3 className="text-5xl font-black text-slate-900">34%</h3>
              <div className="text-sm font-medium text-amber-600 flex items-center gap-1">
                 Low vs Network
              </div>
            </div>
            <div className="mt-8 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Network Average</span>
                <span className="font-bold text-slate-700">67%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-[34%] rounded-full shadow-inner" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                "Top-10 hospitals use automated follow-up pathways for 100% of discharges."
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Operational Flow */}
        <Card className="shadow-2xl border-0 overflow-hidden relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" /> Patient Flow
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-xs text-emerald-600 font-bold uppercase">Avg. LOS</p>
                <p className="text-2xl font-black text-emerald-900">4.2 Days</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-xs text-blue-600 font-bold uppercase">Conversion</p>
                <p className="text-2xl font-black text-blue-900">12%</p>
              </div>
            </div>
            <div className="mt-8 p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-xl">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Bed Occupancy</p>
                <p className="text-xl font-bold">88.4%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        {/* Revenue intelligence */}
        <Card className="shadow-2xl border-0 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" /> Staff Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-6">
              {[
                { name: 'Dr. Sameer', rev: '₹4.2L', adoption: 98, trend: 'up' },
                { name: 'Dr. Anjali', rev: '₹3.1L', adoption: 45, trend: 'down' },
              ].map((doc) => (
                <div key={doc.name} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-500 group-hover:bg-slate-200 transition-colors">
                      {doc.name[4]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{doc.name}</p>
                      <p className="text-xs text-slate-400">{doc.adoption}% Portal Adoption</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 text-sm">{doc.rev}</p>
                    <p className={`text-[10px] font-bold ${doc.trend === 'up' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {doc.trend === 'up' ? '▲ High Yield' : '▼ Low Adoption'}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-xs text-blue-600 hover:bg-blue-50 font-bold uppercase tracking-tighter">
                View All Personnel Metrics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benchmarking & Performance Pricing */}
      <div className="grid grid-cols-2 gap-8">
        <Card className="shadow-xl border-0 bg-slate-900 text-white p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <BarChart3 className="w-64 h-64" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <h4 className="text-xl font-bold mb-2">Haspataal Performance Pricing</h4>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                We only win when you win. Our model tracks the incremental revenue generated by our retention engine.
              </p>
            </div>
            <div className="mt-12 flex items-baseline gap-6">
               <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Lapsed Revenue</p>
                  <p className="text-3xl font-black text-red-400">₹1.1L</p>
               </div>
               <div className="w-px h-12 bg-slate-800" />
               <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Recovered Revenue</p>
                  <p className="text-3xl font-black text-emerald-400">₹2.3L</p>
               </div>
            </div>
          </div>
        </Card>

        <Card className="shadow-xl border-0 bg-white p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-xl">
               <Info className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Network Intelligence</h4>
          </div>
          <div className="space-y-6">
             <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-sm font-bold text-slate-600">Readmission Rate (30d)</span>
                <span className="text-lg font-black text-slate-900">4.1% <span className="text-xs text-emerald-500 ml-2">▼ Top 10%</span></span>
             </div>
             <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-sm font-bold text-slate-600">Revenue per Bed/Day</span>
                <span className="text-lg font-black text-slate-900">₹12.4K <span className="text-xs text-blue-500 ml-2">▲ Avg: ₹8.2K</span></span>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

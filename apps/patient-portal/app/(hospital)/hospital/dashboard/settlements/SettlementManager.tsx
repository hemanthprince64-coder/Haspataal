/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import {
  Calculator,
  Download,
  Printer,
  Calendar,
  AlertCircle,
  CheckCircle,
  WifiOff,
  UserCheck,
  TrendingUp,
  Coins,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getOfflineDB, getAllOfflineItems, saveOfflineItem } from '@/lib/infrastructure/offline-db';
import { calculateConsultantPayoutsAction } from '@/app/actions';

interface Doctor {
  id: string;
  fullName: string;
  mobile: string;
  speciality?: string;
  department?: string;
  revenueSharePercent?: number;
}

interface Settlement {
  id: string;
  doctorId: string;
  doctorName: string;
  settlementPeriodStart: string;
  settlementPeriodEnd: string;
  totalConsultations: number;
  grossRevenueCents: number;
  revenueSharePercent: number;
  consultantShareCents: number;
  hospitalShareCents: number;
  status: string;
  createdAt: string;
  isOffline?: boolean;
}

interface SettlementManagerProps {
  hospitalId: string;
  initialDoctors: Doctor[];
  initialSettlements: any[];
}

export default function SettlementManager({
  hospitalId,
  initialDoctors,
  initialSettlements
}: SettlementManagerProps) {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [printTarget, setPrintTarget] = useState<Settlement | null>(null);

  // Load and merge local and server settlements
  useEffect(() => {
    const loadSettlements = async () => {
      // Map server settlements
      const serverMapped: Settlement[] = initialSettlements.map((s: any) => ({
        id: s.id,
        doctorId: s.doctorId,
        doctorName: s.doctor?.fullName || 'Doctor',
        settlementPeriodStart: s.settlementPeriodStart,
        settlementPeriodEnd: s.settlementPeriodEnd,
        totalConsultations: s.totalConsultations,
        grossRevenueCents: s.grossRevenueCents,
        revenueSharePercent: Number(s.revenueSharePercent || 70),
        consultantShareCents: s.consultantShareCents,
        hospitalShareCents: s.hospitalShareCents,
        status: s.status,
        createdAt: s.createdAt,
        isOffline: false
      }));

      // Load local offline settlements if window is available
      if (typeof window !== 'undefined') {
        try {
          const localSettlements = await getAllOfflineItems('consultantSettlements');
          const localMapped: Settlement[] = localSettlements.map((s: any) => ({
            ...s,
            isOffline: true
          }));
          setSettlements([...localMapped, ...serverMapped]);
        } catch (e) {
          console.error('Failed to load offline settlements', e);
          setSettlements(serverMapped);
        }
      } else {
        setSettlements(serverMapped);
      }
    };

    loadSettlements();
  }, [initialSettlements]);

  // Sync state offline check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleOnline = () => setIsOfflineMode(false);
      const handleOffline = () => setIsOfflineMode(true);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      setIsOfflineMode(!navigator.onLine);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !startDate || !endDate) {
      setErrorMsg('Please select a doctor and specify start & end dates.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const doc = doctors.find((d) => d.id === selectedDoctorId);
    const doctorName = doc ? doc.fullName : 'Doctor';

    // 1. If online, attempt server action calculation
    if (!isOfflineMode) {
      try {
        const formData = new FormData();
        formData.append('doctorId', selectedDoctorId);
        formData.append('settlementPeriodStart', start.toISOString());
        formData.append('settlementPeriodEnd', end.toISOString());

        const res = await calculateConsultantPayoutsAction(null, formData);
        if (res.success && res.data) {
          const newS = res.data as any;
          const mapped: Settlement = {
            id: newS.id,
            doctorId: newS.doctorId,
            doctorName: doctorName,
            settlementPeriodStart: newS.settlementPeriodStart,
            settlementPeriodEnd: newS.settlementPeriodEnd,
            totalConsultations: newS.totalConsultations,
            grossRevenueCents: newS.grossRevenueCents,
            revenueSharePercent: Number(newS.revenueSharePercent || 70),
            consultantShareCents: newS.consultantShareCents,
            hospitalShareCents: newS.hospitalShareCents,
            status: newS.status,
            createdAt: newS.createdAt,
            isOffline: false
          };

          setSettlements((prev) => [mapped, ...prev]);
          setSuccessMsg('Settlement generated successfully on server!');
          setLoading(false);
          return;
        } else {
          console.warn('Server calculation failed, falling back to local client calculation: ', res.message);
        }
      } catch (err) {
        console.warn('Failed calculating on server, trying offline fallback...', err);
      }
    }

    // 2. Offline / Fallback local client calculation
    try {
      if (typeof window === 'undefined') throw new Error('IndexedDB is not ready');

      // Fetch visits from IndexedDB to calculate local revenue
      const localVisits = await getAllOfflineItems('visits');
      const filteredVisits = localVisits.filter((v: any) => {
        const visitDate = new Date(v.createdAt);
        // Match doctor via appointment doctorId or direct doctorId
        const isDocMatch = v.doctorId === selectedDoctorId || v.appointment?.doctorId === selectedDoctorId;
        const isHospitalMatch = v.hospitalId === hospitalId;
        const isDateMatch = visitDate >= start && visitDate <= end;
        return isDocMatch && isHospitalMatch && isDateMatch;
      });

      const totalConsultations = filteredVisits.length;
      // Calculate gross revenue. Amounts are in Rupees, convert to cents
      const grossRevenueCents = filteredVisits.reduce((sum: number, v: any) => {
        const amt = Number(v.amount) || 500;
        return sum + Math.round(amt * 100);
      }, 0);

      // Default share is 70%
      const sharePercent = doc?.revenueSharePercent || 70;
      const consultantShareCents = Math.round((grossRevenueCents * sharePercent) / 100);
      const hospitalShareCents = grossRevenueCents - consultantShareCents;

      const offlineSettlement: Settlement = {
        id: `set-offline-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        doctorId: selectedDoctorId,
        doctorName: doctorName,
        settlementPeriodStart: start.toISOString(),
        settlementPeriodEnd: end.toISOString(),
        totalConsultations,
        grossRevenueCents,
        revenueSharePercent: sharePercent,
        consultantShareCents,
        hospitalShareCents,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        isOffline: true
      };

      // Save locally
      await saveOfflineItem('consultantSettlements', offlineSettlement);
      setSettlements((prev) => [offlineSettlement, ...prev]);
      setSuccessMsg('Offline Mode: Calculated locally using cached patient visits.');
    } catch (e: any) {
      console.error(e);
      setErrorMsg(`Calculation failed: ${e.message || 'Unknown offline error'}`);
    } finally {
      setLoading(false);
    }
  };

  // CSV Export for air-gapped banks
  const handleExportCSV = (settlement: Settlement) => {
    // Generate clean CSV content
    const headers = [
      'Beneficiary Name',
      'IFSC Code',
      'Account Number',
      'Amount (INR)',
      'Reference Description',
      'Period Start',
      'Period End',
      'Gross Revenue (INR)',
      'Doctor Share %',
      'Hospital Share (INR)'
    ];

    // Mock bank details based on doctor ID
    const accountNum = `30${settlement.doctorId.replace(/\D/g, '').substring(0, 10).padEnd(10, '5')}`;
    const ifscCode = 'SBIN0010203'; // State Bank of India, Main Branch Patna

    const amount = (settlement.consultantShareCents / 100).toFixed(2);
    const gross = (settlement.grossRevenueCents / 100).toFixed(2);
    const hospShare = (settlement.hospitalShareCents / 100).toFixed(2);

    const row = [
      `"${settlement.doctorName}"`,
      `"${ifscCode}"`,
      `"${accountNum}"`,
      amount,
      `"Consultation Settlement Ref ${settlement.id.substring(0, 8)}"`,
      `"${new Date(settlement.settlementPeriodStart).toLocaleDateString()}"`,
      `"${new Date(settlement.settlementPeriodEnd).toLocaleDateString()}"`,
      gross,
      settlement.revenueSharePercent,
      hospShare
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), row.join(',')].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BankPayout_${settlement.doctorName.replace(/\s+/g, '')}_${settlement.id.substring(0, 8)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = (settlement: Settlement) => {
    setPrintTarget(settlement);
    // Let state apply, then call print
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Print Target (Only visible in media print) */}
      {printTarget && (
        <div className="hidden print:block print-thermal">
          <h2>HASPATAAL SETTLEMENT SLIP</h2>
          <div className="divider"></div>
          <p><strong>Ref:</strong> {printTarget.id.substring(0, 8).toUpperCase()}</p>
          <p><strong>Doctor:</strong> {printTarget.doctorName}</p>
          <p><strong>Date Range:</strong></p>
          <p>{new Date(printTarget.settlementPeriodStart).toLocaleDateString('en-IN')} - {new Date(printTarget.settlementPeriodEnd).toLocaleDateString('en-IN')}</p>
          <div className="divider"></div>
          <table>
            <tbody>
              <tr>
                <td>Total Visits:</td>
                <td style={{ textAlign: 'right' }}>{printTarget.totalConsultations}</td>
              </tr>
              <tr>
                <td>Gross Revenue:</td>
                <td style={{ textAlign: 'right' }}>₹{(printTarget.grossRevenueCents / 100).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Share Percent:</td>
                <td style={{ textAlign: 'right' }}>{printTarget.revenueSharePercent}%</td>
              </tr>
              <tr style={{ fontWeight: 'bold' }}>
                <td>DOCTOR PAYOUT:</td>
                <td style={{ textAlign: 'right' }}>₹{(printTarget.consultantShareCents / 100).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Hospital Share:</td>
                <td style={{ textAlign: 'right' }}>₹{(printTarget.hospitalShareCents / 100).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div className="divider"></div>
          <p style={{ textAlign: 'center', fontSize: '8pt' }}>Generated Offline. Upload CSV to bank portal for payout.</p>
        </div>
      )}

      {/* Control Panel (Hidden in print) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
        {/* Settlement Generator Form */}
        <Card className="lg:col-span-1 border-slate-200 shadow-md rounded-2xl bg-white/80 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Calculate Payout</h2>
            </div>
            
            {isOfflineMode && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 flex gap-2 text-xs font-semibold mb-4 leading-relaxed">
                <WifiOff className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  Running Offline. Calculations will use locally cached clinical records and store settlements in your browser.
                </div>
              </div>
            )}

            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Attending Doctor</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                >
                  <option value="">Select Doctor...</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName} ({d.department || d.speciality || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-xl border-slate-200 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-xl border-slate-200 font-semibold"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-50 text-red-800 p-3 rounded-xl border border-red-200 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 font-black uppercase tracking-wider text-xs shadow-lg shadow-blue-500/10 transition-all"
              >
                {loading ? 'Calculating Payout...' : 'Generate Settlement'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Stats Panel */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-slate-200 shadow-sm rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white overflow-hidden relative">
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
              <TrendingUp className="h-32 w-32" />
            </div>
            <CardContent className="p-6 flex flex-col justify-between h-full min-h-[140px]">
              <div className="flex justify-between items-start">
                <Badge className="bg-white/20 hover:bg-white/20 text-white text-[10px] font-black tracking-widest uppercase rounded-lg border-0 px-2 py-0.5">
                  Total Gross Revenue
                </Badge>
                <Coins className="h-5 w-5 text-white/70" />
              </div>
              <div>
                <h3 className="text-3xl font-black tracking-tight leading-none mt-4">
                  ₹{(settlements.reduce((sum, s) => sum + s.grossRevenueCents, 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-[10px] text-white/70 font-semibold mt-1">Sum of all generated settlements</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden relative border">
            <CardContent className="p-6 flex flex-col justify-between h-full min-h-[140px]">
              <div className="flex justify-between items-start">
                <Badge className="bg-emerald-50 text-emerald-700 text-[10px] font-black tracking-widest uppercase rounded-lg border border-emerald-100 px-2 py-0.5">
                  Doctor Payouts Due
                </Badge>
                <UserCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-none mt-4">
                  ₹{(settlements.reduce((sum, s) => sum + s.consultantShareCents, 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Pending bank file transfer approvals</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Settlements History List (Hidden in print) */}
      <Card className="border-slate-200 shadow-md rounded-2xl overflow-hidden bg-white no-print">
        <div className="border-b border-slate-100 px-6 py-4 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Settlement Ledger</h3>
          </div>
          <Badge variant="outline" className="font-bold border-slate-200">
            {settlements.length} SETTLEMENTS
          </Badge>
        </div>
        <CardContent className="p-0 overflow-x-auto">
          {settlements.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium">
              No settlements calculated for this period. Choose a doctor and date range above to start.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Period Range</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Visits</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Gross Rev</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Share</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Dr Payout</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Source</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <code className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-mono">
                        {s.id.substring(0, 8).toUpperCase()}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900">{s.doctorName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 font-semibold">
                      {new Date(s.settlementPeriodStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} -{' '}
                      {new Date(s.settlementPeriodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-6 py-4 font-bold text-sm text-slate-700">{s.totalConsultations}</td>
                    <td className="px-6 py-4 text-right font-semibold text-sm text-slate-900">
                      ₹{(s.grossRevenueCents / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge className="bg-slate-100 hover:bg-slate-100 text-slate-700 font-bold border-0 text-[10px]">
                        {s.revenueSharePercent}%
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-sm text-emerald-600">
                      ₹{(s.consultantShareCents / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {s.isOffline ? (
                        <Badge variant="destructive" className="bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-50 font-black text-[9px] uppercase tracking-wider">
                          Offline Local
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-100 hover:bg-blue-50 font-black text-[9px] uppercase tracking-wider">
                          Cloud Sync
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrint(s)}
                        className="h-8 text-[10px] font-black uppercase text-slate-600 border-slate-200 hover:bg-slate-50"
                      >
                        <Printer className="h-3 w-3 mr-1" /> Slip
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportCSV(s)}
                        className="h-8 text-[10px] font-black uppercase text-blue-600 border-blue-100 hover:bg-blue-50"
                      >
                        <Download className="h-3 w-3 mr-1" /> Bank CSV
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import {
  Users,
  Stethoscope,
  Bed,
  CreditCard,
  RefreshCw,
  ArrowRight,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileText,
  ArrowRightLeft,
  UserCheck,
  Shield,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import React, { useState, useTransition } from 'react';

import { advancePatientStageAction, calculateConsultantPayoutsAction } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import SpecialityTimeline from './speciality-timeline';

interface GoLiveDashboardProps {
  hospitalId: string;
}

export default function GoLiveDashboard({ hospitalId }: GoLiveDashboardProps) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<'queue' | 'payouts' | 'timeline'>('queue');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Mock Visit Queue
  const [visits, setVisits] = useState([
    {
      id: 'v-101',
      patientId: 'p-201',
      name: 'Amit Patel',
      age: '34',
      gender: 'Male',
      stage: 'RECEPTION',
      doctor: 'Dr. Vivek Sharma (General Physician)',
      time: '10:15 AM',
      token: 'OPD-01',
    },
    {
      id: 'v-102',
      patientId: 'p-202',
      name: 'Sunita Rao',
      age: '29',
      gender: 'Female',
      stage: 'CONSULTATION',
      doctor: 'Dr. Neha Gupta (Pediatrician)',
      time: '10:30 AM',
      token: 'OPD-02',
    },
    {
      id: 'v-103',
      patientId: 'p-203',
      name: 'Rohan Deshmukh',
      age: '45',
      gender: 'Male',
      stage: 'INVESTIGATION_LAB',
      doctor: 'Dr. Vivek Sharma (General Physician)',
      time: '10:45 AM',
      token: 'OPD-03',
    },
    {
      id: 'v-104',
      patientId: 'p-204',
      name: 'Karan Malhotra',
      age: '52',
      gender: 'Male',
      stage: 'BILLING',
      doctor: 'Dr. Neha Gupta (Pediatrician)',
      time: '11:00 AM',
      token: 'OPD-04',
    },
  ]);

  // Mock EMR Timeline Events
  const patientTimelines: Record<string, any[]> = {
    'p-201': [
      {
        id: 'e-1',
        date: 'Today, 10:15 AM',
        type: 'triage',
        title: 'Checked-in & Vitals Captured',
        subtitle: 'By Receptionist Ramesh Kumar',
        notes: 'BP: 120/80 mmHg, Pulse: 72 bpm, Temp: 98.4 F',
      },
    ],
    'p-202': [
      {
        id: 'e-2',
        date: 'Today, 10:35 AM',
        type: 'opd',
        title: 'Pediatric Consultation',
        subtitle: 'Dr. Neha Gupta (Pediatrician)',
        notes:
          'Patient presenting with mild fever and nasal congestion for 3 days. Prescribed pediatric paracetamol drops.',
        details: [
          { label: 'Diagnosis', value: 'Acute Nasopharyngitis' },
          { label: 'Follow-up', value: 'In 5 days' },
        ],
      },
      {
        id: 'e-1',
        date: 'Today, 10:30 AM',
        type: 'triage',
        title: 'Check-in Vitals',
        subtitle: 'By Nurse Sarika',
        notes: 'Temp: 100.2 F, Weight: 12 kg',
      },
    ],
    'p-203': [
      {
        id: 'e-3',
        date: 'Today, 10:50 AM',
        type: 'lab',
        title: 'CBC Test Requested',
        subtitle: 'Pathology Department',
        notes: 'Sample collected, results pending.',
      },
      {
        id: 'e-2',
        date: 'Today, 10:45 AM',
        type: 'opd',
        title: 'General Consultation',
        subtitle: 'Dr. Vivek Sharma',
        notes: 'Complaints of body aches and fatigue. Ordered CBC.',
      },
    ],
    'p-204': [
      {
        id: 'e-4',
        date: 'Today, 11:10 AM',
        type: 'billing',
        title: 'OPD Bill Generated',
        subtitle: 'Cashier Suresh',
        notes: 'OPD Consultation Fee: Rs. 500, Pharmacy dispensing pending.',
        details: [
          { label: 'Receipt No', value: 'INV-10029' },
          { label: 'Payment Mode', value: 'UPI pending' },
        ],
      },
    ],
  };

  const handleAdvanceStage = (visitId: string, fromStage: string, toStage: string) => {
    startTransition(async () => {
      const data = new FormData();
      data.append('visitId', visitId);
      data.append('fromStage', fromStage);
      data.append('toStage', toStage);

      const res = await advancePatientStageAction(data);
      if (res.success) {
        toast.success(res.message);
        setVisits((prev) => prev.map((v) => (v.id === visitId ? { ...v, stage: toStage } : v)));
      } else {
        toast.error(res.message || 'Stage advancement failed.');
      }
    });
  };

  // Payout calculation parameters
  const [selectedDoctorId, setSelectedDoctorId] = useState('doc-1');
  const [settlementPeriod, setSettlementPeriod] = useState({
    start: '2026-05-01',
    end: '2026-05-31',
  });
  const [payoutData, setPayoutData] = useState<any>(null);

  const handleCalculatePayout = () => {
    startTransition(async () => {
      const data = new FormData();
      data.append('doctorId', selectedDoctorId);
      data.append('settlementPeriodStart', settlementPeriod.start);
      data.append('settlementPeriodEnd', settlementPeriod.end);

      const res = await calculateConsultantPayoutsAction(null, data);
      if (res.success && res.data) {
        setPayoutData(res.data);
        toast.success(res.message);
      } else {
        toast.error(res.message || 'Failed to calculate payouts.');
      }
    });
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'RECEPTION':
        return 'Reception check-in';
      case 'TRIAGE':
        return 'Nurse Triage';
      case 'CONSULTATION':
        return 'Doctor Cabinet';
      case 'INVESTIGATION_LAB':
        return 'Lab testing';
      case 'BILLING':
        return 'Billing Desk';
      default:
        return stage;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* High Density Mini metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              OPD Live Queue
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{visits.length} Patients</div>
          </div>
          <div className="bg-teal-50 text-teal-600 p-3 rounded-xl">
            <Users className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Avg Wait Time
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">12 Mins</div>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
            <RefreshCw className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Today's Revenue
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">₹3,400</div>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
            <TrendingUp className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              ABDM Sync Status
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">Synced</div>
          </div>
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
            <Sparkles className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-slate-200 gap-2 mb-6">
        {[
          { key: 'queue', label: 'Patient Queue Tracker', count: visits.length },
          { key: 'payouts', label: 'Visiting Consultant Settlements', count: null },
          { key: 'timeline', label: 'Unified Patient EMR Timeline', count: null },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2
              ${activeTab === tab.key ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {tab.label}
            {tab.count !== null && (
              <Badge className="bg-slate-100 text-slate-800 text-[10px] font-bold border-slate-200">
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Content panel */}
      {activeTab === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-4">
            {visits.map((v) => (
              <Card
                key={v.id}
                className="p-5 border border-slate-200 rounded-2xl hover:shadow-sm transition-all bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                      {v.token}
                    </span>
                    <h4 className="font-bold text-slate-800 text-base">{v.name}</h4>
                    <span className="text-xs text-slate-500">
                      {v.age}y · {v.gender}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{v.doctor}</p>

                  <div className="flex gap-2 items-center mt-3">
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100 uppercase tracking-wide">
                      {getStageLabel(v.stage)}
                    </span>
                    <span className="text-[10px] text-slate-400">Scheduled: {v.time}</span>
                  </div>
                </div>

                {/* Flow Advance Control Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-initial text-xs font-semibold rounded-xl"
                    onClick={() => {
                      setSelectedPatientId(v.patientId);
                      setActiveTab('timeline');
                    }}
                  >
                    View EMR
                  </Button>

                  {v.stage === 'RECEPTION' && (
                    <Button
                      size="sm"
                      className="flex-1 sm:flex-initial bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl flex items-center gap-1"
                      onClick={() => handleAdvanceStage(v.id, 'RECEPTION', 'CONSULTATION')}
                    >
                      Send to Doctor <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {v.stage === 'CONSULTATION' && (
                    <Button
                      size="sm"
                      className="flex-1 sm:flex-initial bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center gap-1"
                      onClick={() => handleAdvanceStage(v.id, 'CONSULTATION', 'INVESTIGATION_LAB')}
                    >
                      Refer to Lab <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {v.stage === 'INVESTIGATION_LAB' && (
                    <Button
                      size="sm"
                      className="flex-1 sm:flex-initial bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center gap-1"
                      onClick={() => handleAdvanceStage(v.id, 'INVESTIGATION_LAB', 'BILLING')}
                    >
                      Send to Billing <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {v.stage === 'BILLING' && (
                    <Button
                      size="sm"
                      className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1"
                      onClick={() => {
                        toast.success('Patient payment cleared and visit finalized!');
                        setVisits((prev) => prev.filter((item) => item.id !== v.id));
                      }}
                    >
                      Clear Payment <CheckCircle className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}

            {visits.length === 0 && (
              <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-3xl">
                <Users className="h-12 w-12 text-slate-200 mx-auto mb-2" />
                <p className="font-semibold text-sm">Active patient list is empty</p>
                <p className="text-xs text-slate-500 mt-1">
                  All OPD patient check-ins are fully completed.
                </p>
              </div>
            )}
          </div>

          {/* Right Actions / Bottlenecks Side Card */}
          <div className="space-y-6">
            <Card className="p-5 border border-slate-200 rounded-2xl bg-white space-y-4">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Pending Laboratory Orders
              </h4>
              <div className="space-y-3">
                <div className="border border-slate-100 rounded-xl p-3 text-xs bg-slate-50/50">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Rohan Deshmukh</span>
                    <span className="text-purple-600">CBC Test</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Ordered by Dr. Vivek Sharma · Specimen collected
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5 border border-slate-200 rounded-2xl bg-white space-y-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-teal-600" /> Clinic Admin Quick Access
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() => alert('Launching patient registration screen... (Mock)')}
                  className="w-full text-left py-2 px-3 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex justify-between"
                >
                  <span>Register Patient walk-in</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'payouts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form left */}
          <Card className="p-6 border border-slate-200 rounded-3xl bg-white space-y-4 lg:col-span-1 h-fit">
            <h4 className="font-bold text-slate-800 text-base">
              Calculate visiting doctor payouts
            </h4>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Select Doctor / Consultant
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-500 bg-white"
                >
                  <option value="doc-1">Dr. Neha Gupta (Pediatrician - 70% share)</option>
                  <option value="doc-2">Dr. Vivek Sharma (General Physician - 65% share)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Start Date</label>
                  <input
                    type="date"
                    value={settlementPeriod.start}
                    onChange={(e) =>
                      setSettlementPeriod((prev) => ({ ...prev, start: e.target.value }))
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500 bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">End Date</label>
                  <input
                    type="date"
                    value={settlementPeriod.end}
                    onChange={(e) =>
                      setSettlementPeriod((prev) => ({ ...prev, end: e.target.value }))
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500 bg-white"
                  />
                </div>
              </div>

              <Button
                disabled={isPending}
                onClick={handleCalculatePayout}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl py-5"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Calculate Split Settlement'
                )}
              </Button>
            </div>
          </Card>

          {/* Results right */}
          <div className="lg:col-span-2 space-y-4">
            {payoutData ? (
              <Card className="p-6 border border-slate-200 rounded-3xl bg-white space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-lg">Settlement Statement</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Calculated based on completed OPD check-ins
                    </p>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                    PENDING APPROVAL
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Gross Consultations
                    </span>
                    <div className="text-xl font-black text-slate-800 mt-1">
                      {payoutData.totalConsultations} visits
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Gross Revenue
                    </span>
                    <div className="text-xl font-black text-slate-800 mt-1">
                      ₹{(payoutData.grossRevenueCents / 100).toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Revenue split
                    </span>
                    <div className="text-xl font-black text-teal-600 mt-1">
                      {payoutData.revenueSharePercent}%
                    </div>
                  </div>
                </div>

                {/* Net Breakdown */}
                <div className="border border-slate-100 rounded-2xl p-4 space-y-2 bg-slate-50/50">
                  <div className="flex justify-between text-sm font-semibold text-slate-600">
                    <span>Visiting Doctor Share:</span>
                    <span className="text-slate-800">
                      ₹{(payoutData.consultantShareCents / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-slate-600">
                    <span>Clinic Administrative Share:</span>
                    <span className="text-slate-800">
                      ₹{(payoutData.hospitalShareCents / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    variant="outline"
                    className="rounded-xl border-slate-300 font-bold px-6"
                    onClick={() => setPayoutData(null)}
                  >
                    Clear
                  </Button>
                  <Button
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl px-6"
                    onClick={() => {
                      toast.success('Payout split settlement approved & marked paid!');
                      setPayoutData(null);
                    }}
                  >
                    Approve & Mark Paid
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-3xl">
                <CreditCard className="h-12 w-12 text-slate-200 mx-auto mb-2" />
                <p className="font-semibold text-sm">No split payouts calculated yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Choose a doctor and date range to calculate revenue share splits.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Selector Left */}
          <Card className="p-5 border border-slate-200 rounded-3xl bg-white space-y-3 lg:col-span-1 h-fit">
            <h4 className="font-bold text-slate-800 text-sm mb-4">Choose Patient</h4>
            <div className="space-y-2">
              {[
                { id: 'p-201', name: 'Amit Patel', info: '34 yrs · Male' },
                { id: 'p-202', name: 'Sunita Rao', info: '29 yrs · Female' },
                { id: 'p-203', name: 'Rohan Deshmukh', info: '45 yrs · Male' },
                { id: 'p-204', name: 'Karan Malhotra', info: '52 yrs · Male' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between
                    ${selectedPatientId === p.id ? 'border-teal-500 bg-teal-50/50 text-teal-700' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}
                >
                  <div>
                    <div className="font-bold">{p.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{p.info}</div>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ))}
            </div>
          </Card>

          {/* Timeline View Right */}
          <div className="lg:col-span-2">
            {selectedPatientId ? (
              <SpecialityTimeline
                patientName={
                  selectedPatientId === 'p-201'
                    ? 'Amit Patel'
                    : selectedPatientId === 'p-202'
                      ? 'Sunita Rao'
                      : selectedPatientId === 'p-203'
                        ? 'Rohan Deshmukh'
                        : 'Karan Malhotra'
                }
                patientAge={
                  selectedPatientId === 'p-201'
                    ? '34'
                    : selectedPatientId === 'p-202'
                      ? '29'
                      : selectedPatientId === 'p-203'
                        ? '45'
                        : '52'
                }
                patientGender={selectedPatientId === 'p-202' ? 'Female' : 'Male'}
                events={patientTimelines[selectedPatientId] || []}
              />
            ) : (
              <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-3xl">
                <FileText className="h-12 w-12 text-slate-200 mx-auto mb-2" />
                <p className="font-semibold text-sm">Select a patient to view EMR Timeline</p>
                <p className="text-xs text-slate-500 mt-1">
                  Cross-speciality medical logs, prescriptions and diagnostics history.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

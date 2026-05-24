'use client';

import { motion } from 'framer-motion';
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
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

import React, { useState, useEffect, useTransition } from 'react';

import {
  advancePatientStageAction,
  calculateConsultantPayoutsAction,
  getGoLiveDashboardDataAction,
  getPatientTimelineEventsAction,
  registerWalkInVisitAction,
} from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import SpecialityTimeline from './speciality-timeline';

interface GoLiveDashboardProps {
  hospitalId: string;
}

export default function GoLiveDashboard({ hospitalId }: GoLiveDashboardProps) {
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'queue' | 'payouts' | 'timeline'>('queue');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Dashboard DB Data State
  const [data, setData] = useState<{
    hospital: any;
    departments: any[];
    billingProfile: any;
    opdConfig: any;
    visits: any[];
    doctors: any[];
  } | null>(null);

  // EMR Timeline State
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // Walk-in Registration Form State
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInMobile, setWalkInMobile] = useState('');
  const [walkInDoctorId, setWalkInDoctorId] = useState('');
  const [walkInSubmitting, setWalkInSubmitting] = useState(false);

  // Payout parameters
  const [selectedDoctorId, setSelectedDoctorId] = useState('doc-1');
  const [settlementPeriod, setSettlementPeriod] = useState({
    start: '2026-05-01',
    end: '2026-05-31',
  });
  const [payoutData, setPayoutData] = useState<any>(null);

  const loadDashboardData = async () => {
    try {
      const res = await getGoLiveDashboardDataAction(hospitalId);
      if (res.success && res.data) {
        setData(res.data as any);
      } else {
        toast.error(res.message || 'Failed to load dashboard data.');
      }
    } catch (err: any) {
      toast.error('Error loading dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [hospitalId]);

  useEffect(() => {
    if (data?.doctors && data.doctors.length > 0 && selectedDoctorId === 'doc-1') {
      setSelectedDoctorId(data.doctors[0].id);
    }
  }, [data?.doctors]);

  useEffect(() => {
    if (selectedPatientId) {
      const fetchTimeline = async () => {
        setTimelineLoading(true);
        try {
          const res = await getPatientTimelineEventsAction(selectedPatientId, hospitalId);
          if (res.success && res.data) {
            setTimelineEvents(res.data as any[]);
          }
        } catch (err) {
          toast.error('Failed to load patient EMR.');
        } finally {
          setTimelineLoading(false);
        }
      };
      fetchTimeline();
    } else {
      setTimelineEvents([]);
    }
  }, [selectedPatientId, hospitalId]);

  const activeVisits = React.useMemo(() => {
    if (!data?.visits) return [];
    return data.visits.filter((v) => v.currentStage !== 'DISCHARGE');
  }, [data?.visits]);

  const todayRevenue = React.useMemo(() => {
    if (!data?.visits) return 0;
    // Sum amount of visits today
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    return data.visits
      .filter((v) => new Date(v.createdAt).getTime() >= startOfToday)
      .reduce((sum, v) => sum + v.amount, 0);
  }, [data?.visits]);

  const patientsList = React.useMemo(() => {
    if (!data?.visits) return [];
    const unique: Record<string, any> = {};
    data.visits.forEach((v) => {
      if (v.patientPhone) {
        unique[v.patientPhone] = {
          phone: v.patientPhone,
          name: v.patientName,
        };
      }
    });
    return Object.values(unique);
  }, [data?.visits]);

  const handleAdvanceStage = (visitId: string, fromStage: string, toStage: string) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.append('visitId', visitId);
      fd.append('fromStage', fromStage);
      fd.append('toStage', toStage);

      const res = await advancePatientStageAction(fd);
      if (res.success) {
        toast.success(res.message || 'Stage advanced successfully.');
        await loadDashboardData();
      } else {
        toast.error(res.message || 'Stage advancement failed.');
      }
    });
  };

  const handleCalculatePayout = () => {
    if (!selectedDoctorId || selectedDoctorId === 'doc-1') {
      toast.error('Please select a valid doctor.');
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      fd.append('doctorId', selectedDoctorId);
      fd.append('settlementPeriodStart', settlementPeriod.start);
      fd.append('settlementPeriodEnd', settlementPeriod.end);

      const res = await calculateConsultantPayoutsAction(null, fd);
      if (res.success && res.data) {
        setPayoutData(res.data);
        toast.success(res.message || 'Split settlement calculated!');
      } else {
        toast.error(res.message || 'Failed to calculate payouts.');
      }
    });
  };

  const handleRegisterWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName || !walkInMobile) {
      toast.error('Patient name and mobile number are required.');
      return;
    }
    setWalkInSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('patientName', walkInName);
      fd.append('patientMobile', walkInMobile);
      if (walkInDoctorId) {
        fd.append('doctorId', walkInDoctorId);
      }

      const res = await registerWalkInVisitAction(null, fd);
      if (res.success) {
        toast.success(res.message || 'Walk-in visit registered!');
        setShowWalkInModal(false);
        setWalkInName('');
        setWalkInMobile('');
        setWalkInDoctorId('');
        await loadDashboardData();
      } else {
        toast.error(res.message || 'Failed to register walk-in.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setWalkInSubmitting(false);
    }
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
      case 'DISCHARGE':
        return 'Discharged';
      default:
        return stage;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Loading Go-Live Workspace...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* High Density Mini metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              OPD Live Queue
            </span>
            <div className="text-xl font-black text-slate-900 mt-1">
              {activeVisits.length} Patients
            </div>
          </div>
          <div className="bg-teal-50 text-teal-600 p-2.5 rounded-xl border border-teal-100">
            <Users className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Consultation Slot
            </span>
            <div className="text-xl font-black text-slate-900 mt-1">
              {data?.opdConfig?.avgConsultationMinutes || 15} Mins
            </div>
          </div>
          <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl border border-blue-100">
            <RefreshCw className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Today's Revenue
            </span>
            <div className="text-xl font-black text-emerald-600 mt-1">
              ₹{todayRevenue.toLocaleString()}
            </div>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl border border-emerald-100">
            <TrendingUp className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Departments Active
            </span>
            <div className="text-xl font-black text-slate-900 mt-1">
              {data?.departments?.length || 0} Depts
            </div>
          </div>
          <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl border border-indigo-100">
            <Sparkles className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Walk-in Modal Form */}
      {showWalkInModal && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"
        >
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5">
            <Stethoscope className="h-5 w-5 text-teal-600" /> Walk-In Patient Registration
          </h3>
          <form
            onSubmit={handleRegisterWalkIn}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Patient Name</label>
              <input
                type="text"
                required
                value={walkInName}
                onChange={(e) => setWalkInName(e.target.value)}
                placeholder="e.g. Amit Patil"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Mobile Number</label>
              <input
                type="tel"
                required
                value={walkInMobile}
                onChange={(e) => setWalkInMobile(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Assign Doctor (OPD)</label>
              <select
                value={walkInDoctorId}
                onChange={(e) => setWalkInDoctorId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
              >
                <option value="">No Doctor (General Walk-in)</option>
                {data?.doctors?.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    Dr. {doc.name} ({doc.speciality})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 flex justify-end gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowWalkInModal(false)}
                className="rounded-xl text-xs h-10 px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={walkInSubmitting}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs h-10 px-5 flex items-center gap-1.5"
              >
                {walkInSubmitting ? 'Registering...' : 'Complete Check-in'}
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Tabs Layout */}
      <div className="flex border-b border-slate-200 gap-2 mb-6">
        {[
          { key: 'queue', label: 'Patient Queue Tracker', count: activeVisits.length },
          { key: 'payouts', label: 'Visiting Consultant Settlements', count: null },
          { key: 'timeline', label: 'Unified Patient EMR Timeline', count: null },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key as any);
              if (tab.key === 'timeline' && patientsList.length > 0 && !selectedPatientId) {
                setSelectedPatientId(patientsList[0].phone);
              }
            }}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2
              ${activeTab === tab.key ? 'border-teal-600 text-teal-700 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {tab.label}
            {tab.count !== null && (
              <Badge className="bg-teal-50 text-teal-700 text-[10px] font-bold border-teal-100">
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
            {activeVisits.map((v, index) => (
              <Card
                key={v.id}
                className="p-5 border border-slate-200 rounded-2xl hover:shadow-sm transition-all bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                      OPD-{(index + 1).toString().padStart(2, '0')}
                    </span>
                    <h4 className="font-bold text-slate-800 text-base">{v.patientName}</h4>
                    <span className="text-xs text-slate-500">{v.patientPhone}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Assigned: Dr. {v.doctorName}
                  </p>

                  <div className="flex gap-2 items-center mt-3">
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100 uppercase tracking-wide">
                      {getStageLabel(v.currentStage)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Registered:{' '}
                      {new Date(v.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Flow Advance Control Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-initial text-xs font-semibold rounded-xl"
                    onClick={() => {
                      setSelectedPatientId(v.patientPhone);
                      setActiveTab('timeline');
                    }}
                  >
                    View EMR
                  </Button>

                  {v.currentStage === 'RECEPTION' && (
                    <Button
                      size="sm"
                      className="flex-1 sm:flex-initial bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl flex items-center gap-1 text-xs"
                      onClick={() => handleAdvanceStage(v.id, 'RECEPTION', 'CONSULTATION')}
                    >
                      Send to Doctor <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {v.currentStage === 'CONSULTATION' && (
                    <Button
                      size="sm"
                      className="flex-1 sm:flex-initial bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center gap-1 text-xs"
                      onClick={() => handleAdvanceStage(v.id, 'CONSULTATION', 'INVESTIGATION_LAB')}
                    >
                      Refer to Lab <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {v.currentStage === 'INVESTIGATION_LAB' && (
                    <Button
                      size="sm"
                      className="flex-1 sm:flex-initial bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center gap-1 text-xs"
                      onClick={() => handleAdvanceStage(v.id, 'INVESTIGATION_LAB', 'BILLING')}
                    >
                      Send to Billing <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {v.currentStage === 'BILLING' && (
                    <Button
                      size="sm"
                      className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1 text-xs"
                      onClick={() => handleAdvanceStage(v.id, 'BILLING', 'DISCHARGE')}
                    >
                      Clear & Discharge <CheckCircle className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}

            {activeVisits.length === 0 && (
              <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-3xl">
                <Users className="h-12 w-12 text-slate-200 mx-auto mb-2" />
                <p className="font-semibold text-sm">Active patient list is empty</p>
                <p className="text-xs text-slate-500 mt-1">
                  All OPD patient check-ins are fully completed.
                </p>
              </div>
            )}
          </div>

          {/* Right Actions / Side Card */}
          <div className="space-y-6">
            <Card className="p-5 border border-slate-200 rounded-2xl bg-white space-y-4 shadow-sm">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Pending Lab Orders
              </h4>
              <div className="space-y-3">
                {activeVisits
                  .filter((v) => v.currentStage === 'INVESTIGATION_LAB')
                  .map((v) => (
                    <div
                      key={v.id}
                      className="border border-slate-100 rounded-xl p-3 text-xs bg-slate-50/50"
                    >
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>{v.patientName}</span>
                        <span className="text-purple-600">Lab Diagnostic</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Assigned to Dr. {v.doctorName} · Awaiting specimen/results
                      </p>
                    </div>
                  ))}
                {activeVisits.filter((v) => v.currentStage === 'INVESTIGATION_LAB').length ===
                  0 && (
                  <p className="text-xs text-slate-400 italic">No pending lab investigations.</p>
                )}
              </div>
            </Card>

            <Card className="p-5 border border-slate-200 rounded-2xl bg-white space-y-3 shadow-sm">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-teal-600" /> Clinic Quick Access
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() => setShowWalkInModal(true)}
                  className="w-full text-left py-2 px-3 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex justify-between items-center"
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
          <Card className="p-6 border border-slate-200 rounded-3xl bg-white space-y-4 lg:col-span-1 h-fit shadow-sm">
            <h4 className="font-bold text-slate-800 text-base">Calculate consultant payouts</h4>
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
                  {data?.doctors?.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.name} ({doc.speciality} - {doc.revenueSharePercent}% share)
                    </option>
                  ))}
                  {(!data?.doctors || data.doctors.length === 0) && (
                    <option value="">No verified doctors affiliated</option>
                  )}
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
                disabled={isPending || !selectedDoctorId || selectedDoctorId === 'doc-1'}
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
              <Card className="p-6 border border-slate-200 rounded-3xl bg-white space-y-6 shadow-sm">
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
                    <span className="text-slate-800 font-bold">
                      ₹{(payoutData.consultantShareCents / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-slate-600">
                    <span>Clinic Administrative Share:</span>
                    <span className="text-slate-800 font-bold">
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
          <Card className="p-5 border border-slate-200 rounded-3xl bg-white space-y-3 lg:col-span-1 h-fit shadow-sm">
            <h4 className="font-bold text-slate-800 text-sm mb-4">Choose Patient</h4>
            <div className="space-y-2">
              {patientsList.map((p) => (
                <button
                  key={p.phone}
                  onClick={() => setSelectedPatientId(p.phone)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between
                    ${selectedPatientId === p.phone ? 'border-teal-500 bg-teal-50/50 text-teal-700 font-bold' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}
                >
                  <div>
                    <div className="font-bold">{p.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{p.phone}</div>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ))}
              {patientsList.length === 0 && (
                <p className="text-xs text-slate-400 italic">
                  No patients registered in the queue yet.
                </p>
              )}
            </div>
          </Card>

          {/* Timeline View Right */}
          <div className="lg:col-span-2">
            {timelineLoading ? (
              <div className="flex justify-center items-center py-20 bg-white border border-slate-200 rounded-3xl">
                <Loader2 className="h-6 w-6 text-teal-600 animate-spin" />
              </div>
            ) : selectedPatientId ? (
              <SpecialityTimeline
                patientName={
                  patientsList.find((p) => p.phone === selectedPatientId)?.name || 'Patient'
                }
                patientAge="N/A"
                patientGender="N/A"
                events={timelineEvents}
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

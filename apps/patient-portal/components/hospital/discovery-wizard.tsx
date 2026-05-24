'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  HeartPulse,
  Laptop,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  IndianRupee,
  Stethoscope,
} from 'lucide-react';
import { toast } from 'sonner';

import React, { useState, useTransition } from 'react';

import { submitDiscoveryQuestionnaireAction } from '@/app/actions';
import { Button } from '@/components/ui/button';

interface DiscoveryWizardProps {
  onComplete: (
    clinicType: 'SINGLE_DOCTOR' | 'MULTISPECIALTY_CLINIC' | 'MULTISPECIALTY_HOSPITAL',
  ) => void;
}

const STEPS = [
  { label: 'Clinic Structure', num: 1 },
  { label: 'Staff Structure', num: 2 },
  { label: 'Daily Workflow', num: 3 },
  { label: 'Revenue Flow', num: 4 },
  { label: 'Digital Depth', num: 5 },
  { label: 'Engagement', num: 6 },
];

function InfoHelp({ text }: { text: string }) {
  return (
    <span className="group relative inline-block text-slate-400 hover:text-slate-600 cursor-pointer">
      <HelpCircle className="h-3.5 w-3.5" />
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-xl bg-slate-800 p-2.5 text-center text-xs font-normal text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
        {text}
      </span>
    </span>
  );
}

type ToggleOption = {
  value: string;
  label: string;
};

function ToggleGroup({
  options,
  value,
  onChange,
  cols = 2,
  disabled = false,
}: {
  options: ToggleOption[];
  value: string;
  onChange: (v: string) => void;
  cols?: number;
  disabled?: boolean;
}) {
  return (
    <div className={`grid grid-cols-${cols} gap-2`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          className={`py-3 px-4 border rounded-xl font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed
            ${
              value === opt.value
                ? 'border-teal-500 bg-teal-50 text-teal-700 font-bold shadow-sm shadow-teal-500/10'
                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-teal-50 text-teal-600 p-2.5 rounded-xl border border-teal-100 flex-shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

export default function DiscoveryWizard({ onComplete }: DiscoveryWizardProps) {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    // Section A: Clinic Structure
    isSingleDoctor: 'true',
    hasConsultants: 'false',
    admitsPatients: 'false',
    opdOnly: 'true',
    avgDailyPatients: '10',
    hasOwnPharmacy: 'false',
    hasOwnLab: 'false',
    numberOfBeds: '0',

    // Section B: Staff Structure
    hasReceptionist: 'false',
    hasNursingStaff: 'false',
    hasPharmacist: 'false',
    hasLabTechnician: 'false',
    dailyStaffCount: '1',
    staffingChallenge: '',

    // Section C: Daily Workflow
    workflowAppointments: 'both',
    workflowRecords: 'paper',
    workflowBilling: 'both',
    workflowFollowups: 'none',
    workflowProblem: '',
    avgWaitTime: '15',

    // Section D: Revenue Flow
    primaryRevenue: 'opd_consultation',
    avgMonthlyRevenue: '',
    hasInsurance: 'false',
    hasCreditPatients: 'false',
    billingLeaks: '',
    wantsBillingAutomation: 'true',

    // Section E: Digital Maturity
    prevSoftware: '',
    whyStopped: '',
    staffComfort: 'Medium',
    preferredDevice: 'PC',
    internetReliability: 'Stable',

    // Section F: Engagement & Comms
    remindersMethod: 'none',
    chronicLost: 'false',
    whatsappOptIn: 'true',
    whatsappNumber: '',
    smsRequired: 'true',
    preferredLanguage: 'English',
    onlineBooking: 'true',
    stockManual: 'true',
    expiryTracked: 'false',
    ownLab: 'false',
    digitalUpload: 'false',
  });

  const update = (key: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: String(value) }));
  };

  const detectClinicType = ():
    | 'SINGLE_DOCTOR'
    | 'MULTISPECIALTY_CLINIC'
    | 'MULTISPECIALTY_HOSPITAL' => {
    if (formData.isSingleDoctor === 'true') return 'SINGLE_DOCTOR';
    if (formData.admitsPatients === 'true' || Number(formData.numberOfBeds) > 0)
      return 'MULTISPECIALTY_HOSPITAL';
    return 'MULTISPECIALTY_CLINIC';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => data.append(key, val));

      const res = await submitDiscoveryQuestionnaireAction(null, data);
      if (res.success) {
        toast.success('Discovery profile saved! Configuring your workspace...');
        onComplete(detectClinicType());
      } else {
        toast.error(res.message || 'Failed to submit discovery questionnaire.');
      }
    });
  };

  const slideVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className="max-w-3xl mx-auto py-4 px-4">
      {/* Step progress tracker */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max px-2">
          {STEPS.map((item, idx) => (
            <React.Fragment key={item.num}>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0
                    ${
                      step === item.num
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 scale-110'
                        : step > item.num
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-slate-100 text-slate-400'
                    }`}
                >
                  {step > item.num ? <CheckCircle2 className="h-4 w-4" /> : item.num}
                </div>
                <span
                  className={`hidden sm:inline text-xs font-semibold whitespace-nowrap
                    ${step === item.num ? 'text-teal-700 font-bold' : step > item.num ? 'text-teal-600' : 'text-slate-400'}`}
                >
                  {item.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-px flex-1 min-w-4 transition-colors ${step > item.num ? 'bg-teal-300' : 'bg-slate-200'}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm min-h-[440px] flex flex-col">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {/* ── SECTION A: Clinic Structure ─────────────────── */}
              {step === 1 && (
                <motion.div
                  key="s1"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <SectionHeader
                    title="Clinic Structure"
                    subtitle="Tell us about your facility type and services."
                    icon={<Building2 className="h-5 w-5" />}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                        Practice Type{' '}
                        <InfoHelp text="This determines your workflow. Single doctor clinics get a simpler, faster interface." />
                      </label>
                      <ToggleGroup
                        cols={2}
                        value={formData.isSingleDoctor}
                        onChange={(v) => {
                          update('isSingleDoctor', v);
                          if (v === 'true') update('hasConsultants', 'false');
                        }}
                        options={[
                          { value: 'true', label: '🩺 Solo Practice (Single Doctor)' },
                          { value: 'false', label: '🏥 Multi-Doctor / Group Practice' },
                        ]}
                      />
                    </div>

                    {formData.isSingleDoctor === 'false' && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                          Visiting Consultants?{' '}
                          <InfoHelp text="Enables commission tracking and payout settlements for external specialists." />
                        </label>
                        <ToggleGroup
                          value={formData.hasConsultants}
                          onChange={(v) => update('hasConsultants', v)}
                          options={[
                            { value: 'true', label: 'Yes, have consultants' },
                            { value: 'false', label: 'No, employed doctors only' },
                          ]}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">
                        In-patient Admissions (IPD Wards)?
                      </label>
                      <ToggleGroup
                        value={formData.admitsPatients}
                        onChange={(v) => {
                          update('admitsPatients', v);
                          update('opdOnly', v === 'true' ? 'false' : 'true');
                        }}
                        options={[
                          { value: 'true', label: 'Yes, have beds/wards' },
                          { value: 'false', label: 'No (OPD only)' },
                        ]}
                      />
                    </div>

                    {formData.admitsPatients === 'true' && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-800">
                          Approximate Bed Count
                        </label>
                        <input
                          type="number"
                          value={formData.numberOfBeds}
                          onChange={(e) => update('numberOfBeds', e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                          placeholder="e.g. 20"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">
                        In-house Pharmacy?
                      </label>
                      <ToggleGroup
                        value={formData.hasOwnPharmacy}
                        onChange={(v) => update('hasOwnPharmacy', v)}
                        options={[
                          { value: 'true', label: '💊 Yes (Activate drug store)' },
                          { value: 'false', label: 'No pharmacy' },
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">
                        In-house Diagnostics Lab?
                      </label>
                      <ToggleGroup
                        value={formData.hasOwnLab}
                        onChange={(v) => update('hasOwnLab', v)}
                        options={[
                          { value: 'true', label: '🔬 Yes (Activate lab portal)' },
                          { value: 'false', label: 'No lab' },
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">
                        Average Daily OPD Patients
                      </label>
                      <input
                        type="number"
                        value={formData.avgDailyPatients}
                        onChange={(e) => update('avgDailyPatients', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        placeholder="e.g. 15"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── SECTION B: Staff Structure ─────────────────────── */}
              {step === 2 && (
                <motion.div
                  key="s2"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <SectionHeader
                    title="Staff Structure"
                    subtitle="Who works in your clinic? This helps us configure roles and access."
                    icon={<Users className="h-5 w-5" />}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">
                        Front-desk Receptionist?
                      </label>
                      <ToggleGroup
                        value={formData.hasReceptionist}
                        onChange={(v) => update('hasReceptionist', v)}
                        options={[
                          { value: 'true', label: 'Yes' },
                          { value: 'false', label: 'No (Doctor manages)' },
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">Nursing Staff?</label>
                      <ToggleGroup
                        value={formData.hasNursingStaff}
                        onChange={(v) => update('hasNursingStaff', v)}
                        options={[
                          { value: 'true', label: 'Yes' },
                          { value: 'false', label: 'No' },
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">
                        Dedicated Pharmacist?
                      </label>
                      <ToggleGroup
                        value={formData.hasPharmacist}
                        onChange={(v) => update('hasPharmacist', v)}
                        options={[
                          { value: 'true', label: 'Yes' },
                          { value: 'false', label: 'No' },
                        ]}
                        disabled={formData.hasOwnPharmacy === 'false'}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">
                        Lab Technician?
                      </label>
                      <ToggleGroup
                        value={formData.hasLabTechnician}
                        onChange={(v) => update('hasLabTechnician', v)}
                        options={[
                          { value: 'true', label: 'Yes' },
                          { value: 'false', label: 'No' },
                        ]}
                        disabled={formData.hasOwnLab === 'false'}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">
                        Total Daily Staff On-site
                      </label>
                      <input
                        type="number"
                        value={formData.dailyStaffCount}
                        onChange={(e) => update('dailyStaffCount', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        placeholder="e.g. 3"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">
                        Biggest Staffing Challenge
                      </label>
                      <input
                        type="text"
                        value={formData.staffingChallenge}
                        onChange={(e) => update('staffingChallenge', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        placeholder="e.g. High turnover, managing attendance..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── SECTION C: Daily Workflow ─────────────────────── */}
              {step === 3 && (
                <motion.div
                  key="s3"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <SectionHeader
                    title="Daily Operations & Workflow"
                    subtitle="Tell us how you manage queues, records, and billing today."
                    icon={<Stethoscope className="h-5 w-5" />}
                  />
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">
                        How do patients book appointments today?
                      </label>
                      <select
                        value={formData.workflowAppointments}
                        onChange={(e) => update('workflowAppointments', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      >
                        <option value="walk_in">Walk-in / On-spot entry only</option>
                        <option value="phone">Phone calls booked by receptionist</option>
                        <option value="both">Both walk-ins and pre-booked appointments</option>
                        <option value="online">Mostly online (WhatsApp / website)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">
                        Where do you write prescriptions & clinical notes?
                      </label>
                      <select
                        value={formData.workflowRecords}
                        onChange={(e) => update('workflowRecords', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      >
                        <option value="paper">Handwritten on paper / prescription pad</option>
                        <option value="word">Typed in MS Word / Notepad</option>
                        <option value="hms">Legacy HMS software</option>
                        <option value="none">No written records currently</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">
                        Preferred payment collection methods?
                      </label>
                      <select
                        value={formData.workflowBilling}
                        onChange={(e) => update('workflowBilling', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      >
                        <option value="cash">Cash only</option>
                        <option value="digital">UPI / Cards only</option>
                        <option value="both">Both cash and UPI / Cards</option>
                        <option value="insurance">Mostly insurance / TPA billing</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-800">
                          Average Patient Wait Time
                        </label>
                        <select
                          value={formData.avgWaitTime}
                          onChange={(e) => update('avgWaitTime', e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        >
                          <option value="5">Under 5 minutes</option>
                          <option value="15">10–15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="60">Over 1 hour</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-800">
                          Patient follow-up method?
                        </label>
                        <select
                          value={formData.workflowFollowups}
                          onChange={(e) => update('workflowFollowups', e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        >
                          <option value="none">No systematic follow-up</option>
                          <option value="phone">Phone calls manually</option>
                          <option value="whatsapp">WhatsApp message</option>
                          <option value="auto">Automated reminders</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">
                        Biggest operational bottleneck?
                      </label>
                      <input
                        type="text"
                        value={formData.workflowProblem}
                        onChange={(e) => update('workflowProblem', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        placeholder="e.g. Long queues, billing errors, missing records..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── SECTION D: Revenue Flow ─────────────────────────── */}
              {step === 4 && (
                <motion.div
                  key="s4"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <SectionHeader
                    title="Revenue Flow"
                    subtitle="Understanding your billing helps us prevent revenue leakage."
                    icon={<IndianRupee className="h-5 w-5" />}
                  />
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">
                        Primary revenue source?
                      </label>
                      <select
                        value={formData.primaryRevenue}
                        onChange={(e) => update('primaryRevenue', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      >
                        <option value="opd_consultation">OPD Consultation fees</option>
                        <option value="procedures">Procedures / Surgeries</option>
                        <option value="pharmacy">Pharmacy sales</option>
                        <option value="lab">Lab & Diagnostics</option>
                        <option value="ipd">IPD / Inpatient billing</option>
                        <option value="mixed">Mixed (all of the above)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">
                        Approximate monthly gross revenue (₹){' '}
                        <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={formData.avgMonthlyRevenue}
                          onChange={(e) => update('avgMonthlyRevenue', e.target.value)}
                          className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                          placeholder="e.g. 150000"
                        />
                      </div>
                      <p className="text-xs text-slate-400">
                        Used only for analytics benchmarking. Never shared.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-800">
                          Insurance / TPA Billing?
                        </label>
                        <ToggleGroup
                          value={formData.hasInsurance}
                          onChange={(v) => update('hasInsurance', v)}
                          options={[
                            { value: 'true', label: 'Yes' },
                            { value: 'false', label: 'No' },
                          ]}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                          Credit Patients?{' '}
                          <InfoHelp text="Patients who pay later — usually corporates or relatives. Haspataal tracks outstanding dues." />
                        </label>
                        <ToggleGroup
                          value={formData.hasCreditPatients}
                          onChange={(v) => update('hasCreditPatients', v)}
                          options={[
                            { value: 'true', label: 'Yes' },
                            { value: 'false', label: 'No' },
                          ]}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                        Where do you think money is leaking?
                        <InfoHelp text="Common leaks: free consultations to relatives, unreported pharmacy sales, untracked lab fees." />
                      </label>
                      <input
                        type="text"
                        value={formData.billingLeaks}
                        onChange={(e) => update('billingLeaks', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        placeholder="e.g. Pharmacy not linked to billing, cash not recorded..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">
                        Want Haspataal to automate billing?
                      </label>
                      <ToggleGroup
                        value={formData.wantsBillingAutomation}
                        onChange={(v) => update('wantsBillingAutomation', v)}
                        options={[
                          {
                            value: 'true',
                            label: '✅ Yes — Auto-generate invoices after each visit',
                          },
                          { value: 'false', label: 'No — Manual billing only' },
                        ]}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── SECTION E: Digital Maturity ─────────────────────── */}
              {step === 5 && (
                <motion.div
                  key="s5"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <SectionHeader
                    title="Digital Comfort & History"
                    subtitle="Help us customize onboarding based on your tech experience."
                    icon={<Laptop className="h-5 w-5" />}
                  />
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">
                        Staff comfort level with software:
                      </label>
                      <ToggleGroup
                        cols={3}
                        value={formData.staffComfort}
                        onChange={(v) => update('staffComfort', v)}
                        options={[
                          { value: 'Low', label: '🐢 Low — First time' },
                          { value: 'Medium', label: '🚗 Medium — Some experience' },
                          { value: 'High', label: '🚀 High — Very comfortable' },
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">
                        Have you used any clinic software before?
                      </label>
                      <input
                        type="text"
                        value={formData.prevSoftware}
                        onChange={(e) => update('prevSoftware', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        placeholder="e.g. Practo, Clinikeep, MedBridge, or None"
                      />
                    </div>

                    {formData.prevSoftware && formData.prevSoftware.toLowerCase() !== 'none' && (
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <label className="text-sm font-semibold text-slate-800">
                          Why did you stop using it?
                        </label>
                        <input
                          type="text"
                          value={formData.whyStopped}
                          onChange={(e) => update('whyStopped', e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                          placeholder="e.g. Too complex, too expensive, slow, internet issues..."
                        />
                      </motion.div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">
                        Preferred device for billing & prescriptions:
                      </label>
                      <ToggleGroup
                        cols={3}
                        value={formData.preferredDevice}
                        onChange={(v) => update('preferredDevice', v)}
                        options={[
                          { value: 'PC', label: '🖥️ Desktop / Laptop' },
                          { value: 'Tablet', label: '📱 iPad / Tablet' },
                          { value: 'Mobile', label: '📱 Smartphone' },
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">
                        Internet reliability inside your clinic:
                      </label>
                      <ToggleGroup
                        value={formData.internetReliability}
                        onChange={(v) => update('internetReliability', v)}
                        options={[
                          { value: 'Stable', label: '📶 Stable broadband / Wi-Fi' },
                          { value: 'Intermittent', label: '📵 Mobile hotspot / drops often' },
                        ]}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── SECTION F: Engagement & Comms ────────────────────── */}
              {step === 6 && (
                <motion.div
                  key="s6"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <SectionHeader
                    title="Engagement & Communication"
                    subtitle="Setup automated WhatsApp reminders, online booking, and patient retention."
                    icon={<HeartPulse className="h-5 w-5" />}
                  />
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                        Activate automated WhatsApp reminders?
                        <InfoHelp text="Haspataal sends prescription copies, follow-up reminders, and invoice PDFs on WhatsApp automatically." />
                      </label>
                      <ToggleGroup
                        value={formData.whatsappOptIn}
                        onChange={(v) => update('whatsappOptIn', v)}
                        options={[
                          { value: 'true', label: '✅ Yes — WhatsApp Automation ON' },
                          { value: 'false', label: 'No — Manual only' },
                        ]}
                      />
                    </div>

                    {formData.whatsappOptIn === 'true' && (
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <label className="text-sm font-semibold text-slate-800">
                          WhatsApp Business Number
                        </label>
                        <input
                          type="tel"
                          value={formData.whatsappNumber}
                          onChange={(e) => update('whatsappNumber', e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                          placeholder="e.g. 9876543210"
                        />
                      </motion.div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">
                        Allow patient-facing online booking page?
                      </label>
                      <ToggleGroup
                        value={formData.onlineBooking}
                        onChange={(v) => update('onlineBooking', v)}
                        options={[
                          { value: 'true', label: '🔗 Yes — Generate booking link' },
                          { value: 'false', label: 'No — Internal booking only' },
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">
                        How do you remind chronic patients to return?
                      </label>
                      <select
                        value={formData.remindersMethod}
                        onChange={(e) => update('remindersMethod', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      >
                        <option value="none">No reminders currently</option>
                        <option value="phone">Manual phone calls</option>
                        <option value="whatsapp">WhatsApp (manual)</option>
                        <option value="auto">Already using automated reminders</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">
                        Primary language for patient SMS & printouts:
                      </label>
                      <select
                        value={formData.preferredLanguage}
                        onChange={(e) => update('preferredLanguage', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi / हिन्दी</option>
                        <option value="Marathi">Marathi / मराठी</option>
                        <option value="Gujarati">Gujarati / ગુજરાતી</option>
                        <option value="Tamil">Tamil / தமிழ்</option>
                        <option value="Bengali">Bengali / বাংলা</option>
                        <option value="Telugu">Telugu / తెలుగు</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation controls */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 text-slate-600 border-slate-200 rounded-xl px-5 h-12"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
            ) : (
              <div />
            )}

            {step < 6 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl px-6 h-12 flex items-center gap-1.5 shadow-sm shadow-teal-600/20"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isPending}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl px-8 h-12 flex items-center gap-2 shadow-md shadow-teal-600/10"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Analysing your clinic...
                  </>
                ) : (
                  'Analyse & Configure Workspace →'
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

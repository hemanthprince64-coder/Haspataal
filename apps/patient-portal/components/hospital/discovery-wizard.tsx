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
  Info,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

import React, { useState, useTransition } from 'react';

import { submitDiscoveryQuestionnaireAction } from '@/app/actions';
import { Button } from '@/components/ui/button';

interface DiscoveryWizardProps {
  onComplete: () => void;
}

export default function DiscoveryWizard({ onComplete }: DiscoveryWizardProps) {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [formData, setFormData] = useState({
    isSingleDoctor: 'true',
    hasConsultants: 'false',
    dailyStaffCount: '1',
    hasReceptionist: 'false',
    hasNursingStaff: 'false',
    hasPharmacy: 'false',
    hasOwnLab: 'false',
    admitsPatients: 'false',
    avgDailyPatients: '10',
    opdOnly: 'true',
    // Workflow
    workflowAppointments: 'both',
    workflowRecords: 'paper',
    workflowBilling: 'both',
    workflowFollowups: 'none',
    workflowProblem: '',
    // Digital Maturity
    prevSoftware: '',
    whyStopped: '',
    staffComfort: 'Medium',
    preferredDevice: 'PC',
    internetReliability: 'Stable',
    // Retention
    remindersMethod: 'none',
    chronicLost: 'false',
    whatsappOptIn: 'true',
    // Pharmacy/Lab configs
    stockManual: 'true',
    expiryTracked: 'false',
    ownLab: 'false',
    digitalUpload: 'false',
    // Comm
    whatsappNumber: '',
    smsRequired: 'true',
    preferredLanguage: 'English',
    onlineBooking: 'true',
  });

  const updateField = (key: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: String(value) }));
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        data.append(key, val);
      });

      const res = await submitDiscoveryQuestionnaireAction(null, data);
      if (res.success) {
        toast.success(res.message || 'Discovery responses saved successfully!');
        onComplete();
      } else {
        toast.error(res.message || 'Failed to submit discovery questionnaire.');
      }
    });
  };

  const renderSectionHeader = (title: string, subtitle: string, icon: React.ReactNode) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-teal-50 text-teal-600 p-2.5 rounded-xl border border-teal-100 flex-shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-4 px-4">
      {/* Step Tracker */}
      <div className="flex items-center justify-between mb-8 px-2">
        {[
          { label: 'Structure', num: 1 },
          { label: 'Workflow', num: 2 },
          { label: 'Digital Depth', num: 3 },
          { label: 'Engagement', num: 4 },
        ].map((item) => (
          <div key={item.num} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${step === item.num ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 scale-110' : step > item.num ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-400'}`}
            >
              {step > item.num ? <CheckCircle2 className="h-4 w-4" /> : item.num}
            </div>
            <span
              className={`hidden sm:inline text-xs font-semibold
                ${step === item.num ? 'text-teal-700 font-bold' : 'text-slate-500'}`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm"
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderSectionHeader(
                'Clinic Structure',
                'Specify clinical layouts, capacity, and ancillary stores.',
                <Building2 className="h-5 w-5" />,
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Single Doctor */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    Are you a Single-Doctor Clinic?
                    <InfoHelp text="If checked, OPD workflows will focus solely on you, bypassing multi-doctor slots." />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        updateField('isSingleDoctor', true);
                        updateField('hasConsultants', false);
                      }}
                      className={`py-3 px-4 border rounded-xl font-medium text-sm transition-all
                        ${formData.isSingleDoctor === 'true' ? 'border-teal-500 bg-teal-50/50 text-teal-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                      Yes (Solo Practice)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('isSingleDoctor', false)}
                      className={`py-3 px-4 border rounded-xl font-medium text-sm transition-all
                        ${formData.isSingleDoctor === 'false' ? 'border-teal-500 bg-teal-50/50 text-teal-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                      No (Multi-speciality)
                    </button>
                  </div>
                </div>

                {/* Visiting Consultants */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    Do you have Visiting Consultants?
                    <InfoHelp text="Allows payout and commission settlements tracking for external doctors who share revenue." />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={formData.isSingleDoctor === 'true'}
                      onClick={() => updateField('hasConsultants', true)}
                      className={`py-3 px-4 border rounded-xl font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed
                        ${formData.hasConsultants === 'true' ? 'border-teal-500 bg-teal-50/50 text-teal-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                      Yes, have consultants
                    </button>
                    <button
                      type="button"
                      disabled={formData.isSingleDoctor === 'true'}
                      onClick={() => updateField('hasConsultants', false)}
                      className={`py-3 px-4 border rounded-xl font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed
                        ${formData.hasConsultants === 'false' ? 'border-teal-500 bg-teal-50/50 text-teal-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                      No, regular staff only
                    </button>
                  </div>
                </div>

                {/* Has Receptionist */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    Do you have a front-desk receptionist?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateField('hasReceptionist', true)}
                      className={`py-3 px-4 border rounded-xl font-medium text-sm transition-all
                        ${formData.hasReceptionist === 'true' ? 'border-teal-500 bg-teal-50/50 text-teal-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('hasReceptionist', false)}
                      className={`py-3 px-4 border rounded-xl font-medium text-sm transition-all
                        ${formData.hasReceptionist === 'false' ? 'border-teal-500 bg-teal-50/50 text-teal-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                      No (Doctor handles front-desk)
                    </button>
                  </div>
                </div>

                {/* In-house Pharmacy */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    Attached / In-house Pharmacy?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateField('hasPharmacy', true)}
                      className={`py-3 px-4 border rounded-xl font-medium text-sm transition-all
                        ${formData.hasPharmacy === 'true' ? 'border-teal-500 bg-teal-50/50 text-teal-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                      Yes (Activate Drug store)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('hasPharmacy', false)}
                      className={`py-3 px-4 border rounded-xl font-medium text-sm transition-all
                        ${formData.hasPharmacy === 'false' ? 'border-teal-500 bg-teal-50/50 text-teal-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                      No pharmacy
                    </button>
                  </div>
                </div>

                {/* In-house Laboratory */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    Attached / In-house Diagnostics Lab?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateField('hasOwnLab', true)}
                      className={`py-3 px-4 border rounded-xl font-medium text-sm transition-all
                        ${formData.hasOwnLab === 'true' ? 'border-teal-500 bg-teal-50/50 text-teal-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                      Yes (Activate Lab portal)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('hasOwnLab', false)}
                      className={`py-3 px-4 border rounded-xl font-medium text-sm transition-all
                        ${formData.hasOwnLab === 'false' ? 'border-teal-500 bg-teal-50/50 text-teal-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                      No lab
                    </button>
                  </div>
                </div>

                {/* Wards/Admissions */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    Do you admit patients (IPD Wards)?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        updateField('admitsPatients', true);
                        updateField('opdOnly', false);
                      }}
                      className={`py-3 px-4 border rounded-xl font-medium text-sm transition-all
                        ${formData.admitsPatients === 'true' ? 'border-teal-500 bg-teal-50/50 text-teal-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                      Yes, have beds/wards
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateField('admitsPatients', false);
                        updateField('opdOnly', true);
                      }}
                      className={`py-3 px-4 border rounded-xl font-medium text-sm transition-all
                        ${formData.admitsPatients === 'false' ? 'border-teal-500 bg-teal-50/50 text-teal-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                      No (OPD only)
                    </button>
                  </div>
                </div>

                {/* Average Daily Patients */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Average Daily OPD Patients
                  </label>
                  <input
                    type="number"
                    value={formData.avgDailyPatients}
                    onChange={(e) => updateField('avgDailyPatients', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500"
                    placeholder="e.g. 15"
                  />
                </div>

                {/* Daily Staff Count */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Daily Staff Onsite Count
                  </label>
                  <input
                    type="number"
                    value={formData.dailyStaffCount}
                    onChange={(e) => updateField('dailyStaffCount', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500"
                    placeholder="e.g. 3"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderSectionHeader(
                'Daily Operations & Workflow',
                'Tell us how you manage queues, records, and billing.',
                <Users className="h-5 w-5" />,
              )}

              <div className="space-y-5">
                {/* Appointment settings */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">
                    How do patients book appointments today?
                  </label>
                  <select
                    value={formData.workflowAppointments}
                    onChange={(e) => updateField('workflowAppointments', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500"
                  >
                    <option value="walk_in">Walk-in/On-spot entry only</option>
                    <option value="phone">Phone calls booked manually by receptionist</option>
                    <option value="both">Both Walk-ins and Pre-booked phone appointments</option>
                  </select>
                </div>

                {/* Records storage */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Where do you write prescriptions & clinical notes?
                  </label>
                  <select
                    value={formData.workflowRecords}
                    onChange={(e) => updateField('workflowRecords', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500"
                  >
                    <option value="paper">Handwritten on paper prescription pad/files</option>
                    <option value="word">Typed in MS Word / Notepad</option>
                    <option value="hms">In a legacy HMS software</option>
                  </select>
                </div>

                {/* Billing style */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Preferred payment methods?
                  </label>
                  <select
                    value={formData.workflowBilling}
                    onChange={(e) => updateField('workflowBilling', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500"
                  >
                    <option value="cash">Cash only</option>
                    <option value="digital">Online UPI / Cards only</option>
                    <option value="both">Both Cash and UPI / Cards</option>
                  </select>
                </div>

                {/* Biggest bottleneck */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">
                    What is your biggest operational bottleneck?
                  </label>
                  <input
                    type="text"
                    value={formData.workflowProblem}
                    onChange={(e) => updateField('workflowProblem', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500"
                    placeholder="e.g. Long patient wait times, tracing old records, billing leaks"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderSectionHeader(
                'Digital Comfort & History',
                'Help us customize onboarding based on computer literacy.',
                <Laptop className="h-5 w-5" />,
              )}

              <div className="space-y-5">
                {/* Staff comfort level */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Reception / Nursing staff comfort level with software:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Low', 'Medium', 'High'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => updateField('staffComfort', lvl)}
                        className={`py-3 px-4 border rounded-xl font-medium text-sm transition-all
                          ${formData.staffComfort === lvl ? 'border-teal-500 bg-teal-50/50 text-teal-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Legacy software */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Have you used any clinic software in the past?
                  </label>
                  <input
                    type="text"
                    value={formData.prevSoftware}
                    onChange={(e) => updateField('prevSoftware', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500"
                    placeholder="e.g. Practo, Clinikeep, or None"
                  />
                </div>

                {formData.prevSoftware && formData.prevSoftware.toLowerCase() !== 'none' && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-800">
                      Why did you stop using that software?
                    </label>
                    <input
                      type="text"
                      value={formData.whyStopped}
                      onChange={(update) => updateField('whyStopped', update.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500"
                      placeholder="e.g. Too complex, expensive, slow, internet issue"
                    />
                  </div>
                )}

                {/* Device Preference */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Preferred device for billing & writing prescriptions:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['PC', 'Tablet', 'Mobile'].map((dev) => (
                      <button
                        key={dev}
                        type="button"
                        onClick={() => updateField('preferredDevice', dev)}
                        className={`py-3 px-4 border rounded-xl font-medium text-sm transition-all
                          ${formData.preferredDevice === dev ? 'border-teal-500 bg-teal-50/50 text-teal-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                      >
                        {dev}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Internet stability */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Internet reliability inside the clinic:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Stable', 'Intermittent'].map((net) => (
                      <button
                        key={net}
                        type="button"
                        onClick={() => updateField('internetReliability', net)}
                        className={`py-3 px-4 border rounded-xl font-medium text-sm transition-all
                          ${formData.internetReliability === net ? 'border-teal-500 bg-teal-50/50 text-teal-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                      >
                        {net === 'Stable'
                          ? 'Broadband / Stable Wi-Fi'
                          : 'Mobile hotspot / Drops often'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderSectionHeader(
                'Engagement & Communication',
                'Setup automated WhatsApp reminders and online booking.',
                <HeartPulse className="h-5 w-5" />,
              )}

              <div className="space-y-5">
                {/* Whatsapp configuration */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    Activate Automated WhatsApp Reminders?
                    <InfoHelp text="Haspataal sends prescription copies, follow-ups, and invoice PDFs on WhatsApp." />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateField('whatsappOptIn', true)}
                      className={`py-3 px-4 border rounded-xl font-medium text-sm transition-all
                        ${formData.whatsappOptIn === 'true' ? 'border-teal-500 bg-teal-50/50 text-teal-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                      Yes, Auto-WhatsApp Enabled
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('whatsappOptIn', false)}
                      className={`py-3 px-4 border rounded-xl font-medium text-sm transition-all
                        ${formData.whatsappOptIn === 'false' ? 'border-teal-500 bg-teal-50/50 text-teal-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                      No, Manual Only
                    </button>
                  </div>
                </div>

                {formData.whatsappOptIn === 'true' && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-800">
                      WhatsApp Business Number
                    </label>
                    <input
                      type="text"
                      value={formData.whatsappNumber}
                      onChange={(e) => updateField('whatsappNumber', e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500"
                      placeholder="e.g. 9876543210"
                    />
                  </div>
                )}

                {/* Patient booking preferences */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Allow online patient-facing booking page?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateField('onlineBooking', true)}
                      className={`py-3 px-4 border rounded-xl font-medium text-sm transition-all
                        ${formData.onlineBooking === 'true' ? 'border-teal-500 bg-teal-50/50 text-teal-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                      Yes (Generate booking link)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('onlineBooking', false)}
                      className={`py-3 px-4 border rounded-xl font-medium text-sm transition-all
                        ${formData.onlineBooking === 'false' ? 'border-teal-500 bg-teal-50/50 text-teal-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                      No (Internal booking only)
                    </button>
                  </div>
                </div>

                {/* Primary Language */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Primary communication language for patient SMS / prints:
                  </label>
                  <select
                    value={formData.preferredLanguage}
                    onChange={(e) => updateField('preferredLanguage', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi / हिन्दी</option>
                    <option value="Marathi">Marathi / मराठी</option>
                    <option value="Gujarati">Gujarati / ગુજરાતી</option>
                    <option value="Tamil">Tamil / தமிழ்</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Controls */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              className="flex items-center gap-1 text-slate-600 border-slate-200 rounded-xl px-5 py-6"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl px-6 py-6 flex items-center gap-1.5 shadow-sm"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isPending}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl px-8 py-6 flex items-center gap-2 shadow-md shadow-teal-600/10"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Provisioning workspace...
                </>
              ) : (
                'Save & Configure Workspace'
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function InfoHelp({ text }: { text: string }) {
  return (
    <span className="group relative inline-block text-slate-400 hover:text-slate-600 cursor-pointer">
      <HelpCircle className="h-3.5 w-3.5" />
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-52 -translate-x-1/2 rounded bg-slate-800 p-2 text-center text-xs font-normal text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {text}
      </span>
    </span>
  );
}

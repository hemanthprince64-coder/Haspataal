'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Activity, HelpCircle, ChevronRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState, useEffect } from 'react';

import dynamic from 'next/dynamic';

// Dynamic imports for the 12 stages
const WizardHospitalIdentity = dynamic(
  () => import('@/components/hospital/wizard-hospital-identity'),
  { ssr: false },
);
const WizardDepartmentSetup = dynamic(
  () => import('@/components/hospital/wizard-department-setup'),
  { ssr: false },
);
const StaffSetup = dynamic(() => import('@/components/hospital/staff-setup'), { ssr: false });
const WorkflowConfig = dynamic(() => import('@/components/hospital/workflow-config'), {
  ssr: false,
});
const WizardBillingSetup = dynamic(() => import('@/components/hospital/wizard-billing-setup'), {
  ssr: false,
});
const WizardWhatsappComms = dynamic(() => import('@/components/hospital/wizard-whatsapp-comms'), {
  ssr: false,
});
const GoLiveDashboard = dynamic(() => import('@/components/hospital/go-live-dashboard'), {
  ssr: false,
});

const SETUP_STAGES = [
  { num: 1, label: 'Hospital Profile' },
  { num: 2, label: 'Departments & Units' },
  { num: 3, label: 'Doctors' },
  { num: 4, label: 'OPD Timings' },
  { num: 5, label: 'Services' },
  { num: 6, label: 'Laboratory Tests' },
  { num: 7, label: 'Pharmacy Inventory' },
  { num: 8, label: 'User Accounts & Roles' },
  { num: 9, label: 'Printers & Templates' },
  { num: 10, label: 'Billing Settings' },
  { num: 11, label: 'SMS/WhatsApp' },
  { num: 12, label: 'Go-Live Checklist' },
];

function StageProgressBar({ currentStage }: { currentStage: number }) {
  const visibleStages = SETUP_STAGES;
  return (
    <div className="bg-white border-b border-slate-100 py-4 px-6 shadow-sm overflow-x-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-1 min-w-max">
          {visibleStages.map((item, idx) => {
            const isCompleted = currentStage > item.num;
            const isActive = currentStage === item.num;
            return (
              <React.Fragment key={item.num}>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all
                      ${
                        isCompleted
                          ? 'bg-teal-500 text-white'
                          : isActive
                            ? 'bg-teal-600 text-white ring-4 ring-teal-100'
                            : 'bg-slate-100 text-slate-400'
                      }`}
                  >
                    {isCompleted ? '✓' : item.num}
                  </div>
                  <span
                    className={`text-[11px] font-semibold hidden sm:inline whitespace-nowrap transition-colors
                      ${isActive ? 'text-teal-700' : isCompleted ? 'text-teal-500' : 'text-slate-400'}`}
                  >
                    {item.label}
                  </span>
                </div>
                {idx < visibleStages.length - 1 && (
                  <div
                    className={`h-px w-4 flex-shrink-0 transition-colors ${isCompleted ? 'bg-teal-300' : 'bg-slate-200'}`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function SetupWizardPage() {
  const [stage, setStage] = useState<number>(1);
  const [hospitalName, setHospitalName] = useState<string>('Your Hospital');
  const [hospitalId, setHospitalId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const savedStage = localStorage.getItem('haspataal_setup_stage');
        let initialStage = savedStage ? parseInt(savedStage, 10) : 1;

        const [stageRes, workflowRes] = await Promise.all([
          fetch('/api/hospital/setup/stage'),
          fetch('/api/hospital/setup/workflow'),
        ]);

        if (stageRes.ok) {
          const data = await stageRes.json();
          if (data.hospitalId) setHospitalId(data.hospitalId);
          if (!savedStage && data.stage) {
            initialStage = data.stage;
          }
        }

        if (workflowRes.ok) {
          const data = await workflowRes.json();
          if (data.printHeader) setHospitalName(data.printHeader);
        }

        setStage(initialStage);
      } catch (e) {
        console.error('Setup init failed:', e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const persistStage = async (nextStage: number) => {
    try {
      localStorage.setItem('haspataal_setup_stage', nextStage.toString());
      await fetch('/api/hospital/setup/stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: nextStage }),
      });
    } catch (e) {
      console.error('Failed to persist stage:', e);
    }
  };

  const goTo = (nextStage: number) => {
    setStage(nextStage);
    persistStage(nextStage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const next = () => goTo(stage + 1);
  const prev = () => goTo(stage - 1);

  const handleFinalLaunch = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/hospital/setup/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        toast.success('Your hospital is activated! Launching dashboard...');
        window.location.href = '/hospital/dashboard';
      } else {
        toast.error('Failed to activate hospital. Please check requirements.');
      }
    } catch (e) {
      toast.error('An error occurred during activation.');
    } finally {
      setLoading(false);
    }
  };

  const totalStages = SETUP_STAGES.length;
  const isLastStage = stage === totalStages;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-600">Loading your setup...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/20 flex flex-col">
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 z-20 py-3 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center shadow-md shadow-teal-600/20">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-800 leading-none">{hospitalName}</h1>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                Haspataal — Guided Setup
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isLastStage ? (
              <button
                onClick={handleFinalLaunch}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-full px-5 py-2.5 shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
              >
                Activate Hospital <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 rounded-full px-3.5 py-1.5 border border-slate-200">
                <Sparkles className="h-3.5 w-3.5 text-teal-500" />
                Step {stage} of {totalStages}
              </div>
            )}
          </div>
        </div>
      </header>

      <StageProgressBar currentStage={stage} />

      <main className="flex-1 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {stage === 1 && <WizardHospitalIdentity onNext={next} onPrev={prev} />}
            {stage === 2 && <WizardDepartmentSetup onNext={next} onPrev={prev} />}
            {stage === 3 && <StaffSetup onNext={next} onPrev={prev} label="Doctors Setup" />}
            {stage === 4 && (
              <WorkflowConfig onNext={next} onPrev={prev} label="OPD Timings & Consultation Fees" />
            )}
            {stage === 5 && (
              <WorkflowConfig onNext={next} onPrev={prev} label="Services Configuration" />
            )}
            {stage === 6 && <WorkflowConfig onNext={next} onPrev={prev} label="Laboratory Tests" />}
            {stage === 7 && (
              <WorkflowConfig onNext={next} onPrev={prev} label="Pharmacy Inventory" />
            )}
            {stage === 8 && (
              <StaffSetup onNext={next} onPrev={prev} label="User Accounts & Roles" />
            )}
            {stage === 9 && (
              <WorkflowConfig onNext={next} onPrev={prev} label="Printers & Templates" />
            )}
            {stage === 10 && <WizardBillingSetup onNext={next} onPrev={prev} />}
            {stage === 11 && <WizardWhatsappComms onNext={next} onPrev={prev} />}
            {stage === 12 && <GoLiveDashboard hospitalId={hospitalId} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {!isLastStage && (
        <div className="fixed bottom-6 right-6 z-30">
          <button
            onClick={() =>
              toast.info(
                'Call 1800-HASPATAAL for free assisted onboarding! Our team will configure everything for you.',
              )
            }
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-full px-5 py-3 shadow-xl shadow-slate-900/20 transition-all text-xs hover:scale-105 active:scale-95"
          >
            <HelpCircle className="h-4 w-4 text-teal-400" />
            Need Help?
          </button>
        </div>
      )}
    </div>
  );
}

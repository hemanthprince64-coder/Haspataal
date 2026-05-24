'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  HelpCircle,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Building2,
  Stethoscope,
} from 'lucide-react';
import { toast } from 'sonner';

import React, { useState, useEffect } from 'react';

// New Stage Components (will exist after subagent completes)
// Dynamic imports to avoid build errors if files are being created
import dynamic from 'next/dynamic';

import DataMigration from '@/components/hospital/data-migration';
import DiscoveryWizard from '@/components/hospital/discovery-wizard';
import GoLiveDashboard from '@/components/hospital/go-live-dashboard';
import SetupWizardAuto from '@/components/hospital/setup-wizard-auto';
import StaffSetup from '@/components/hospital/staff-setup';
import TrainingSim from '@/components/hospital/training-sim';
// Stage Components
import WelcomeScreen from '@/components/hospital/welcome-screen';
import WorkflowConfig from '@/components/hospital/workflow-config';

const WizardTypeResult = dynamic(() => import('@/components/hospital/wizard-type-result'), {
  loading: () => <StageLoader label="Loading..." />,
  ssr: false,
});
const WizardDoctorProfile = dynamic(() => import('@/components/hospital/wizard-doctor-profile'), {
  loading: () => <StageLoader label="Loading..." />,
  ssr: false,
});
const WizardHospitalIdentity = dynamic(
  () => import('@/components/hospital/wizard-hospital-identity'),
  {
    loading: () => <StageLoader label="Loading..." />,
    ssr: false,
  },
);
const WizardDepartmentSetup = dynamic(
  () => import('@/components/hospital/wizard-department-setup'),
  {
    loading: () => <StageLoader label="Loading..." />,
    ssr: false,
  },
);
const WizardWhatsappComms = dynamic(() => import('@/components/hospital/wizard-whatsapp-comms'), {
  loading: () => <StageLoader label="Loading..." />,
  ssr: false,
});
const WizardBillingSetup = dynamic(() => import('@/components/hospital/wizard-billing-setup'), {
  loading: () => <StageLoader label="Loading..." />,
  ssr: false,
});

// ── Types ──────────────────────────────────────────────────────────────────────

type ClinicType = 'SINGLE_DOCTOR' | 'MULTISPECIALTY_CLINIC' | 'MULTISPECIALTY_HOSPITAL' | null;

// ── Stage Definitions ──────────────────────────────────────────────────────────

const SINGLE_DOCTOR_STAGES = [
  { num: 1, label: 'Welcome' },
  { num: 2, label: 'Discovery' },
  { num: 3, label: 'Analysis' },
  { num: 4, label: 'Auto-Config' },
  { num: 5, label: 'Doctor Profile' },
  { num: 6, label: 'Staff' },
  { num: 7, label: 'WhatsApp & Comms' },
  { num: 8, label: 'Billing' },
  { num: 9, label: 'Go-Live' },
];

const MULTISPECIALTY_CLINIC_STAGES = [
  { num: 1, label: 'Welcome' },
  { num: 2, label: 'Discovery' },
  { num: 3, label: 'Analysis' },
  { num: 4, label: 'Auto-Config' },
  { num: 5, label: 'Identity' },
  { num: 6, label: 'Departments' },
  { num: 7, label: 'Staff' },
  { num: 8, label: 'WhatsApp & Comms' },
  { num: 9, label: 'Billing' },
  { num: 10, label: 'Go-Live' },
];

const MULTISPECIALTY_HOSPITAL_STAGES = [
  { num: 1, label: 'Welcome' },
  { num: 2, label: 'Discovery' },
  { num: 3, label: 'Analysis' },
  { num: 4, label: 'Auto-Config' },
  { num: 5, label: 'Identity' },
  { num: 6, label: 'Departments' },
  { num: 7, label: 'Doctors' },
  { num: 8, label: 'Staff & Roles' },
  { num: 9, label: 'WhatsApp & Comms' },
  { num: 10, label: 'Pharmacy' },
  { num: 11, label: 'Lab / Diagnostics' },
  { num: 12, label: 'Billing & Finance' },
  { num: 13, label: 'Data Migration' },
  { num: 14, label: 'Go-Live' },
];

function getStages(clinicType: ClinicType) {
  if (clinicType === 'SINGLE_DOCTOR') return SINGLE_DOCTOR_STAGES;
  if (clinicType === 'MULTISPECIALTY_CLINIC') return MULTISPECIALTY_CLINIC_STAGES;
  if (clinicType === 'MULTISPECIALTY_HOSPITAL') return MULTISPECIALTY_HOSPITAL_STAGES;
  // Before detection: show first 4 stages
  return SINGLE_DOCTOR_STAGES.slice(0, 4);
}

// ── Loader ─────────────────────────────────────────────────────────────────────

function StageLoader({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-500 font-medium">{label}</span>
      </div>
    </div>
  );
}

// ── Progress Bar ───────────────────────────────────────────────────────────────

function StageProgressBar({
  stages,
  currentStage,
}: {
  stages: typeof SINGLE_DOCTOR_STAGES;
  currentStage: number;
}) {
  // Show max 8 visible stage dots; scroll if more
  const visible = stages.slice(0, 8);
  const hasMore = stages.length > 8;

  return (
    <div className="bg-white border-b border-slate-100 py-4 px-6 shadow-sm overflow-x-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-1 min-w-max">
          {stages.map((item, idx) => {
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
                {idx < stages.length - 1 && (
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

// ── Clinic Type Badge ──────────────────────────────────────────────────────────

function ClinicTypeBadge({ clinicType }: { clinicType: ClinicType }) {
  if (!clinicType) return null;
  const map = {
    SINGLE_DOCTOR: {
      icon: <Stethoscope className="h-3 w-3" />,
      label: 'Solo Clinic',
      color: 'bg-teal-100 text-teal-800 border-teal-200',
    },
    MULTISPECIALTY_CLINIC: {
      icon: <Building2 className="h-3 w-3" />,
      label: 'Multispecialty Clinic',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    MULTISPECIALTY_HOSPITAL: {
      icon: <Building2 className="h-3 w-3" />,
      label: 'Hospital',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
    },
  };
  const { icon, label, color } = map[clinicType];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold border rounded-full px-3 py-1 ${color}`}
    >
      {icon} {label}
    </span>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function SetupWizardPage() {
  const [stage, setStage] = useState<number>(1);
  const [clinicType, setClinicType] = useState<ClinicType>(null);
  const [hospitalName, setHospitalName] = useState<string>('Your Clinic');
  const [hospitalId, setHospitalId] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Fetch initial stage from DB
  useEffect(() => {
    const init = async () => {
      try {
        const [stageRes, workflowRes] = await Promise.all([
          fetch('/api/hospital/setup/stage'),
          fetch('/api/hospital/setup/workflow'),
        ]);
        if (stageRes.ok) {
          const data = await stageRes.json();
          if (data.hospitalId) setHospitalId(data.hospitalId);
          if (data.contactNumber) setContactNumber(data.contactNumber);
          if (data.clinicType) {
            setClinicType(data.clinicType);
            setStage(data.stage || 5);
          } else {
            setStage(Math.min(data.stage || 1, 2));
          }
        }
        if (workflowRes.ok) {
          const data = await workflowRes.json();
          if (data.printHeader) setHospitalName(data.printHeader);
        }
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

  const handleDiscoveryComplete = (detectedType: ClinicType) => {
    setClinicType(detectedType);
    next();
  };

  const handleFinalLaunch = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/hospital/setup/stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: totalStages }),
      });
      if (res.ok) {
        toast.success('Your workspace is activated! Launching dashboard...');
        window.location.href = '/hospital/dashboard';
      } else {
        toast.error('Failed to activate workspace. Please check requirements.');
      }
    } catch (e) {
      toast.error('An error occurred during activation.');
    } finally {
      setLoading(false);
    }
  };

  const stages = getStages(clinicType);
  const totalStages = stages.length;
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
      {/* ── Header ── */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 z-20 py-3 px-6 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center shadow-md shadow-teal-600/20">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-800 leading-none">{hospitalName}</h1>
                <ClinicTypeBadge clinicType={clinicType} />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                Haspataal — Clinic Setup
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stage counter or Launch button */}
            {isLastStage ? (
              <button
                onClick={handleFinalLaunch}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-full px-5 py-2.5 shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
              >
                Launch Main Dashboard <ChevronRight className="h-4 w-4" />
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

      {/* ── Progress Bar ── */}
      {!isLastStage && <StageProgressBar stages={stages} currentStage={stage} />}

      {/* ── Wizard Content ── */}
      <main className="flex-1 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${stage}-${clinicType}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Stage 1 — Welcome */}
            {stage === 1 && <WelcomeScreen hospitalName={hospitalName} onStart={() => goTo(2)} />}

            {/* Stage 2 — Discovery Questionnaire (6 sections) */}
            {stage === 2 && (
              <DiscoveryWizard
                hospitalId={hospitalId}
                contactNumber={contactNumber}
                onComplete={handleDiscoveryComplete}
              />
            )}

            {/* Stage 3 — Clinic Type Result / Analysis */}
            {stage === 3 && (
              <WizardTypeResult
                clinicType={clinicType || 'SINGLE_DOCTOR'}
                hospitalName={hospitalName}
                onNext={next}
              />
            )}

            {/* Stage 4 — Auto-Config (runs provisioning) */}
            {stage === 4 && <SetupWizardAuto clinicType={clinicType} onComplete={next} />}

            {/* ── SINGLE DOCTOR TRACK ── */}
            {clinicType === 'SINGLE_DOCTOR' && (
              <>
                {stage === 5 && <WizardDoctorProfile onNext={next} onPrev={prev} />}
                {stage === 6 && <StaffSetup onNext={next} onPrev={prev} />}
                {stage === 7 && <WizardWhatsappComms onNext={next} onPrev={prev} />}
                {stage === 8 && <WizardBillingSetup onNext={next} onPrev={prev} />}
                {stage === 9 && <GoLiveDashboard hospitalId={hospitalId} />}
              </>
            )}

            {/* ── MULTISPECIALTY CLINIC TRACK ── */}
            {clinicType === 'MULTISPECIALTY_CLINIC' && (
              <>
                {stage === 5 && <WizardHospitalIdentity onNext={next} onPrev={prev} />}
                {stage === 6 && <WizardDepartmentSetup onNext={next} onPrev={prev} />}
                {stage === 7 && <StaffSetup onNext={next} onPrev={prev} />}
                {stage === 8 && <WizardWhatsappComms onNext={next} onPrev={prev} />}
                {stage === 9 && <WizardBillingSetup onNext={next} onPrev={prev} />}
                {stage === 10 && <GoLiveDashboard hospitalId={hospitalId} />}
              </>
            )}

            {/* ── MULTISPECIALTY HOSPITAL TRACK ── */}
            {clinicType === 'MULTISPECIALTY_HOSPITAL' && (
              <>
                {stage === 5 && <WizardHospitalIdentity onNext={next} onPrev={prev} />}
                {stage === 6 && <WizardDepartmentSetup onNext={next} onPrev={prev} />}
                {stage === 7 && <StaffSetup onNext={next} onPrev={prev} label="Doctors Setup" />}
                {stage === 8 && <StaffSetup onNext={next} onPrev={prev} label="Staff & Roles" />}
                {stage === 9 && <WizardWhatsappComms onNext={next} onPrev={prev} />}
                {stage === 10 && (
                  <WorkflowConfig onNext={next} onPrev={prev} label="Pharmacy Configuration" />
                )}
                {stage === 11 && (
                  <WorkflowConfig onNext={next} onPrev={prev} label="Lab & Diagnostics" />
                )}
                {stage === 12 && <WizardBillingSetup onNext={next} onPrev={prev} />}
                {stage === 13 && <DataMigration onNext={next} onPrev={prev} />}
                {stage === 14 && <GoLiveDashboard hospitalId={hospitalId} />}
              </>
            )}

            {/* Fallback: if clinicType not yet determined and stage > 4, wait */}
            {!clinicType && stage > 4 && (
              <div className="max-w-3xl mx-auto py-16 px-4 text-center">
                <p className="text-slate-500">Please complete the discovery questionnaire first.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Floating Help Button ── */}
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

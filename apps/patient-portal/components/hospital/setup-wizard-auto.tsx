'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Loader2,
  Sparkles,
  Building2,
  Users,
  Stethoscope,
  Pill,
  TestTube,
  MessageSquare,
  Calendar,
  CreditCard,
  ChevronRight,
} from 'lucide-react';

import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';

type ClinicType = 'SINGLE_DOCTOR' | 'MULTISPECIALTY_CLINIC' | 'MULTISPECIALTY_HOSPITAL' | null;

interface SetupWizardAutoProps {
  clinicType?: ClinicType;
  onComplete: () => void;
}

interface ProvisioningStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  durationMs: number;
}

function getProvisioningSteps(clinicType: ClinicType): ProvisioningStep[] {
  const common: ProvisioningStep[] = [
    {
      id: 'workspace',
      label: 'Creating secure workspace',
      description: 'Isolated database schema with encryption at rest',
      icon: <Building2 className="h-4 w-4" />,
      durationMs: 800,
    },
    {
      id: 'roles',
      label: 'Configuring staff roles & permissions',
      description: 'Hospital Admin, Doctor, Receptionist, Nurse roles',
      icon: <Users className="h-4 w-4" />,
      durationMs: 700,
    },
    {
      id: 'opd',
      label: 'Setting up OPD workflow',
      description: 'Token queue, slot management, patient check-in flow',
      icon: <Calendar className="h-4 w-4" />,
      durationMs: 900,
    },
    {
      id: 'billing',
      label: 'Initialising billing engine',
      description: 'Invoice sequences, GST config, payment modes',
      icon: <CreditCard className="h-4 w-4" />,
      durationMs: 600,
    },
    {
      id: 'notifications',
      label: 'Preparing notification templates',
      description: 'WhatsApp, SMS, and email templates ready',
      icon: <MessageSquare className="h-4 w-4" />,
      durationMs: 500,
    },
  ];

  if (clinicType === 'SINGLE_DOCTOR') {
    return [
      ...common,
      {
        id: 'prescription',
        label: 'Enabling digital prescription pad',
        description: 'Auto-filled templates with doctor signature',
        icon: <Stethoscope className="h-4 w-4" />,
        durationMs: 700,
      },
    ];
  }

  if (clinicType === 'MULTISPECIALTY_CLINIC' || clinicType === 'MULTISPECIALTY_HOSPITAL') {
    return [
      ...common,
      {
        id: 'departments',
        label: 'Provisioning department structure',
        description: 'Multi-speciality OPD + IPD department scaffold',
        icon: <Building2 className="h-4 w-4" />,
        durationMs: 800,
      },
      {
        id: 'pharmacy',
        label: 'Activating pharmacy module',
        description: 'Drug catalog, stock management, expiry alerts',
        icon: <Pill className="h-4 w-4" />,
        durationMs: 700,
      },
      {
        id: 'lab',
        label: 'Activating diagnostics lab',
        description: 'Test catalog, pricing engine, report upload',
        icon: <TestTube className="h-4 w-4" />,
        durationMs: 600,
      },
    ];
  }

  return common;
}

function getClinicTypeLabel(clinicType: ClinicType): {
  label: string;
  emoji: string;
  color: string;
} {
  if (clinicType === 'SINGLE_DOCTOR')
    return { label: 'Solo Doctor Clinic', emoji: '🩺', color: 'text-teal-600' };
  if (clinicType === 'MULTISPECIALTY_CLINIC')
    return { label: 'Multispecialty Clinic', emoji: '🏥', color: 'text-blue-600' };
  if (clinicType === 'MULTISPECIALTY_HOSPITAL')
    return { label: 'Hospital', emoji: '🏨', color: 'text-purple-600' };
  return { label: 'Your Clinic', emoji: '🏥', color: 'text-teal-600' };
}

export default function SetupWizardAuto({ clinicType = null, onComplete }: SetupWizardAutoProps) {
  const steps = getProvisioningSteps(clinicType);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<string | null>(steps[0]?.id || null);
  const [allDone, setAllDone] = useState(false);
  const { label, emoji, color } = getClinicTypeLabel(clinicType);

  useEffect(() => {
    let cancelled = false;
    const delay = 400;

    const runSteps = async () => {
      for (const step of steps) {
        if (cancelled) break;
        setCurrentStep(step.id);
        await new Promise((r) => setTimeout(r, step.durationMs));
        if (cancelled) break;
        setCompletedSteps((prev) => [...prev, step.id]);
      }
      if (!cancelled) {
        setCurrentStep(null);
        await new Promise((r) => setTimeout(r, 500));
        setAllDone(true);
      }
    };

    const timer = setTimeout(runSteps, delay);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const totalSteps = steps.length;
  const progress = (completedSteps.length / totalSteps) * 100;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm overflow-hidden relative"
      >
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-start gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-2xl flex-shrink-0">
            {emoji}
          </div>
          <div>
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
              Auto-Configuration
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-0.5">Provisioning your {label}</h2>
            <p className="text-sm text-slate-500 mt-1">
              Setting up your workspace with the right modules based on your answers.
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-500">
              {allDone
                ? 'Complete!'
                : `${completedSteps.length} of ${totalSteps} modules configured`}
            </span>
            <span className="text-sm font-bold text-teal-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Steps list */}
        <div className="space-y-3 mb-8">
          {steps.map((step) => {
            const isDone = completedSteps.includes(step.id);
            const isRunning = currentStep === step.id;
            const isPending = !isDone && !isRunning;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all
                  ${
                    isDone
                      ? 'bg-teal-50/60 border-teal-100'
                      : isRunning
                        ? 'bg-blue-50/60 border-blue-100 shadow-sm'
                        : 'bg-slate-50 border-slate-100'
                  }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                    ${
                      isDone
                        ? 'bg-teal-500 text-white'
                        : isRunning
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-200 text-slate-400'
                    }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isRunning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    step.icon
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold leading-tight
                      ${isDone ? 'text-teal-800' : isRunning ? 'text-blue-800' : 'text-slate-400'}`}
                  >
                    {step.label}
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${isDone || isRunning ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    {step.description}
                  </p>
                </div>

                {isDone && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-teal-500 flex-shrink-0"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Done state */}
        {allDone ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-center mb-6 p-5 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border border-teal-100">
              <div className="text-3xl mb-2">🎉</div>
              <h3 className="font-black text-slate-900 text-lg">Workspace Ready!</h3>
              <p className="text-sm text-slate-600 mt-1">
                All {totalSteps} modules have been configured for your {label.toLowerCase()}.
              </p>
            </div>
            <Button
              onClick={onComplete}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-13 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 text-base"
            >
              <Sparkles className="h-4 w-4" />
              Continue to Setup
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Please wait while we configure your workspace...
          </div>
        )}
      </motion.div>
    </div>
  );
}

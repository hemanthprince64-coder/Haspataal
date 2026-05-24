'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronRight, Activity, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState, useEffect } from 'react';

import DataMigration from '@/components/hospital/data-migration';
import DiscoveryWizard from '@/components/hospital/discovery-wizard';
import GoLiveDashboard from '@/components/hospital/go-live-dashboard';
import SetupWizardAuto from '@/components/hospital/setup-wizard-auto';
import StaffSetup from '@/components/hospital/staff-setup';
import TrainingSim from '@/components/hospital/training-sim';
// Import Sub-Wizard Components
import WelcomeScreen from '@/components/hospital/welcome-screen';
import WorkflowConfig from '@/components/hospital/workflow-config';

export default function SetupPage() {
  const [stage, setStage] = useState<number>(1);
  const [hospitalName, setHospitalName] = useState<string>('Your Clinic');
  const [hospitalId, setHospitalId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStage = async () => {
    try {
      const res = await fetch('/api/hospital/setup/stage');
      if (res.ok) {
        const data = await res.json();
        setStage(data.stage || 1);
      }
    } catch (e) {
      console.error('Failed to fetch stage:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitalInfo = async () => {
    try {
      const res = await fetch('/api/hospital/setup/completion');
      if (res.ok) {
        const data = await res.json();
        // Since legalName isn't returned directly, we can fetch from a generic endpoint
        // or default to a friendly name
        setHospitalId(data.hospitalId || '');
      }

      const resInfo = await fetch('/api/hospital/setup/workflow');
      if (resInfo.ok) {
        const dataInfo = await resInfo.json();
        if (dataInfo.printHeader) {
          setHospitalName(dataInfo.printHeader);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStage();
    fetchHospitalInfo();
  }, []);

  const handleUpdateStage = async (nextStage: number) => {
    setStage(nextStage);
    try {
      await fetch('/api/hospital/setup/stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: nextStage }),
      });
    } catch (e) {
      console.error('Failed to update stage in DB:', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Activity className="h-8 w-8 text-teal-600 animate-pulse" />
          <span className="text-sm font-semibold text-slate-600">Loading your clinic setup...</span>
        </div>
      </div>
    );
  }

  // Define Stage Step list for top tracker
  const stagesList = [
    { label: 'Welcome', num: 1 },
    { label: 'Discovery', num: 2 },
    { label: 'Auto-Config', num: 3 },
    { label: 'Staffing', num: 4 },
    { label: 'Workflows', num: 5 },
    { label: 'Migration', num: 6 },
    { label: 'Training', num: 7 },
    { label: 'Live Portal', num: 8 },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Premium Top Navigation header */}
      <header className="sticky top-0 bg-white border-b border-slate-100 z-10 py-4 px-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-teal-600 text-white p-2 rounded-xl">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800">{hospitalName}</h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Haspataal HMS Setup
              </p>
            </div>
          </div>

          {stage < 8 && (
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 rounded-full px-3.5 py-1.5 border border-slate-200">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" /> Stage {stage} of 8
            </div>
          )}
        </div>
      </header>

      {/* Top stage checklist progress bar (only shown if not Go-Live Dashboard) */}
      {stage < 8 && (
        <div className="bg-white border-b border-slate-200 py-4 px-6 mb-8 shadow-sm">
          <div className="max-w-6xl mx-auto overflow-x-auto flex items-center justify-between gap-4 pb-2">
            {stagesList.map((item) => {
              const isCompleted = stage > item.num;
              const isActive = stage === item.num;
              return (
                <div key={item.num} className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all
                      ${isCompleted ? 'bg-teal-500 text-white' : isActive ? 'bg-teal-600 text-white ring-4 ring-teal-100' : 'bg-slate-100 text-slate-400'}`}
                  >
                    {isCompleted ? '✓' : item.num}
                  </div>
                  <span
                    className={`text-xs font-bold transition-all
                      ${isActive ? 'text-teal-700' : 'text-slate-500'}`}
                  >
                    {item.label}
                  </span>
                  {item.num < 8 && (
                    <ChevronRight className="h-3 w-3 text-slate-300 ml-1 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Content wrapper */}
      <div className="pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {stage === 1 && (
              <WelcomeScreen hospitalName={hospitalName} onStart={() => handleUpdateStage(2)} />
            )}
            {stage === 2 && <DiscoveryWizard onComplete={() => handleUpdateStage(3)} />}
            {stage === 3 && <SetupWizardAuto onComplete={() => handleUpdateStage(4)} />}
            {stage === 4 && (
              <StaffSetup onNext={() => handleUpdateStage(5)} onPrev={() => handleUpdateStage(3)} />
            )}
            {stage === 5 && (
              <WorkflowConfig
                onNext={() => handleUpdateStage(6)}
                onPrev={() => handleUpdateStage(4)}
              />
            )}
            {stage === 6 && (
              <DataMigration
                onNext={() => handleUpdateStage(7)}
                onPrev={() => handleUpdateStage(5)}
              />
            )}
            {stage === 7 && (
              <TrainingSim
                onComplete={() => handleUpdateStage(8)}
                onPrev={() => handleUpdateStage(6)}
              />
            )}
            {stage === 8 && <GoLiveDashboard hospitalId={hospitalId} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Support floating button */}
      {stage < 8 && (
        <div className="fixed bottom-6 right-6 z-20">
          <button
            onClick={() => alert('Call 1800-Haspataal for instant onboarding assistance!')}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-full px-5 py-3 shadow-lg shadow-slate-900/10 transition-all text-xs"
          >
            <HelpCircle className="h-4 w-4 text-teal-400" /> Assisted Onboarding Help
          </button>
        </div>
      )}
    </div>
  );
}

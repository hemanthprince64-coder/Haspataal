'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Sparkles, Building, Settings, ShieldAlert, Cpu } from 'lucide-react';

import React, { useState, useEffect } from 'react';

import { Card } from '@/components/ui/card';

interface SetupWizardAutoProps {
  onComplete: () => void;
}

export default function SetupWizardAuto({ onComplete }: SetupWizardAutoProps) {
  const [currentTask, setCurrentTask] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);

  const tasks = [
    { label: 'Initializing hospital secure workspace...', key: 'workspace' },
    {
      label: 'Provisioning default clinical departments (OPD, General Ward)...',
      key: 'departments',
    },
    { label: 'Configuring access control profiles (Doctor, Reception, Nurse)...', key: 'roles' },
    { label: 'Tuning module engine settings (Pharmacy/Lab/Billing)...', key: 'modules' },
    { label: 'Setting up automated communication nodes...', key: 'comm' },
  ];

  useEffect(() => {
    if (currentTask >= tasks.length) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }

    const interval = setTimeout(() => {
      setCompletedTasks((prev) => [...prev, currentTask]);
      setCurrentTask((prev) => prev + 1);
    }, 1200);

    return () => clearTimeout(interval);
  }, [currentTask, tasks.length, onComplete]);

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Card className="p-8 border border-teal-100 bg-gradient-to-br from-white via-slate-50/50 to-teal-50/10 rounded-3xl shadow-xl shadow-teal-900/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 text-teal-600">
          <Cpu className="h-32 w-32 animate-pulse" />
        </div>

        <div className="flex flex-col items-center text-center mb-8 relative">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-2xl bg-teal-100/50 text-teal-600 flex items-center justify-center animate-spin duration-3000">
              <Settings className="h-8 w-8" />
            </div>
            <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-teal-500/10 animate-ping" />
          </div>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Haspataal Intelligent Configuration
          </span>
          <h2 className="text-2xl font-bold text-slate-800">Auto-Configuring Workspace</h2>
          <p className="text-slate-500 text-sm mt-1.5 max-w-md">
            Our operational engine is analyzing your clinic discovery profile to dynamically enable
            relevant features and establish standard settings.
          </p>
        </div>

        {/* Task list with animation */}
        <div className="space-y-3.5 max-w-lg mx-auto">
          {tasks.map((task, idx) => {
            const isCompleted = completedTasks.includes(idx);
            const isActive = currentTask === idx;
            const isPending = idx > currentTask;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl border transition-all duration-300
                  ${isActive ? 'border-teal-200 bg-teal-50/40 shadow-sm' : isCompleted ? 'border-slate-100 bg-slate-50/50 opacity-90' : 'border-transparent opacity-40'}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                    ${isCompleted ? 'bg-teal-500 text-white' : isActive ? 'bg-teal-100 text-teal-700 animate-pulse' : 'bg-slate-100 text-slate-400'}`}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : isActive ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`text-sm font-medium transition-colors
                    ${isActive ? 'text-teal-900 font-semibold' : isCompleted ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-500'}`}
                >
                  {task.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Informational Footer box */}
        <div className="mt-8 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 max-w-sm mx-auto">
          <Building className="h-4 w-4" /> Configured profiles are fully customizable later inside
          setup settings.
        </div>
      </Card>
    </div>
  );
}

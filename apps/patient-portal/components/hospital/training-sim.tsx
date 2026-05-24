'use client';

import { motion } from 'framer-motion';
import {
  PlayCircle,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  GraduationCap,
  Video,
} from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';

interface TrainingSimProps {
  onComplete: () => void;
  onPrev: () => void;
}

export default function TrainingSim({ onComplete, onPrev }: TrainingSimProps) {
  const [videoWatched, setVideoWatched] = useState(false);
  const [simulated, setSimulated] = useState(false);

  const handleSimulate = () => {
    toast.info('Simulating patient check-in: Test Patient added to OPD Queue!');
    setSimulated(true);
  };

  return (
    <div className="max-w-3xl mx-auto py-4 px-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-50 text-purple-600 p-2.5 rounded-xl border border-purple-100 flex-shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Training & Workflow Simulation</h2>
            <p className="text-sm text-slate-500 mt-1">
              Test your workspace in sandbox mode. Learn to check in patients and write electronic
              prescriptions.
            </p>
          </div>
        </div>

        {/* Training Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Item 1: Video Tutorial */}
          <div className="border border-slate-100 rounded-2xl p-5 hover:border-purple-300 transition-colors flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Video className="h-5 w-5 text-purple-500" />
                {videoWatched ? (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Completed
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    Required
                  </span>
                )}
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Watch system walk-through</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                A 3-minute video showing doctor logins, queue tracking, and prescription layouts.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setVideoWatched(true);
                toast.success('System walk-through marked as watched!');
              }}
              className="border-slate-200 mt-4 text-xs font-bold w-full rounded-xl flex items-center justify-center gap-1"
            >
              <PlayCircle className="h-4 w-4 text-purple-500" /> Watch Video
            </Button>
          </div>

          {/* Item 2: Simulation */}
          <div className="border border-slate-100 rounded-2xl p-5 hover:border-purple-300 transition-colors flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                {simulated ? (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Completed
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                )}
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Simulate patient visit</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add a dummy patient to check how your receptionist sees queue lists and registers
                tokens.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleSimulate}
              className="border-slate-200 mt-4 text-xs font-bold w-full rounded-xl flex items-center justify-center gap-1"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Run Simulation
            </Button>
          </div>
        </div>

        {/* Go Live Ready box */}
        {videoWatched && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center"
          >
            <h4 className="font-bold text-emerald-800 text-sm">Ready to Go Live!</h4>
            <p className="text-xs text-emerald-600 mt-1">
              Your staff profiles, operational structure, and configurations are ready. You can now
              launch your clinic portal.
            </p>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-100">
          <Button
            variant="outline"
            onClick={onPrev}
            className="rounded-xl border-slate-300 font-bold px-6"
          >
            Back
          </Button>
          <Button
            onClick={onComplete}
            disabled={!videoWatched}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl px-8 flex items-center gap-1.5 shadow-md shadow-teal-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Go Live & Launch Portal <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

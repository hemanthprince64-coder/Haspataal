/* eslint-disable */
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

type ClinicType = 'SINGLE_DOCTOR' | 'MULTISPECIALTY_CLINIC' | 'MULTISPECIALTY_HOSPITAL';

interface WizardTypeResultProps {
  clinicType: ClinicType;
  hospitalName: string;
  onNext: () => void;
}

const CLINIC_CONFIG: Record<
  ClinicType,
  {
    emoji: string;
    label: string;
    description: string;
    color: string;
    steps: string[];
  }
> = {
  SINGLE_DOCTOR: {
    emoji: '🏥',
    label: 'Solo Clinic',
    description:
      'A single-doctor practice optimised for fast OPD workflows, personal patient care, and lightweight billing.',
    color: 'from-teal-400 to-cyan-500',
    steps: [
      'Doctor Profile & Credentials',
      'Clinic Identity & Branding',
      'OPD Schedule & Slot Configuration',
      'Consultation Fees & Billing',
      'WhatsApp / SMS Communication',
      'Prescription Templates',
      'Patient Portal Settings',
      'Review & Go Live',
    ],
  },
  MULTISPECIALTY_CLINIC: {
    emoji: '🏨',
    label: 'Multispecialty Clinic',
    description:
      'A multi-doctor clinic with shared reception, cross-specialty referrals, and consolidated billing under one roof.',
    color: 'from-violet-500 to-purple-600',
    steps: [
      'Hospital Identity & Branding',
      'Department & Specialty Setup',
      'Doctor Profiles & Schedules',
      'OPD Slot Configuration',
      'Consultation & Service Fees',
      'WhatsApp / SMS Communication',
      'Reception & Queue Management',
      'Prescription Templates',
      'Lab & Diagnostics (Basic)',
      'Patient Portal Settings',
      'Review & Go Live',
    ],
  },
  MULTISPECIALTY_HOSPITAL: {
    emoji: '🏗️',
    label: 'Multispecialty Hospital',
    description:
      'A full-scale hospital with OPD + IPD, multi-department management, bed tracking, lab, pharmacy, and end-to-end billing.',
    color: 'from-orange-400 to-rose-500',
    steps: [
      'Hospital Identity & Legal Details',
      'Department & Specialty Setup',
      'Doctor Profiles & Credentials',
      'OPD / IPD Scheduling',
      'Bed & Ward Management',
      'Consultation & Service Fees',
      'GST & Billing Configuration',
      'WhatsApp / SMS Communication',
      'Reception & Queue Management',
      'Prescription Templates',
      'Lab & Diagnostics',
      'Pharmacy Integration',
      'Patient Portal Settings',
      'Review & Go Live',
    ],
  },
};

// CSS-only animated confetti particles
function ConfettiParticle({ index }: { index: number }) {
  const colors = [
    '#0d9488',
    '#06b6d4',
    '#8b5cf6',
    '#f59e0b',
    '#10b981',
    '#ec4899',
    '#3b82f6',
    '#f97316',
  ];
  const color = colors[index % colors.length];
  const size = 6 + (index % 4) * 3;
  const left = `${(index * 7.3) % 100}%`;
  const delay = `${(index * 0.15) % 2}s`;
  const duration = `${2.5 + (index % 3) * 0.5}s`;
  const shape = index % 3 === 0 ? '50%' : index % 3 === 1 ? '2px' : '0%';

  return (
    <span
      style={{
        position: 'absolute',
        left,
        top: '-10px',
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: shape,
        animation: `confettiFall ${duration} ${delay} ease-in forwards`,
        opacity: 0,
      }}
    />
  );
}

export default function WizardTypeResult({
  clinicType,
  hospitalName,
  onNext,
}: WizardTypeResultProps) {
  const config = CLINIC_CONFIG[clinicType];
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(520px) rotate(720deg); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Confetti layer */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
            {Array.from({ length: 40 }).map((_, i) => (
              <ConfettiParticle key={i} index={i} />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm overflow-hidden relative"
        >
          {/* Background gradient blob */}
          <div
            className={`absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-br ${config.color} opacity-10 blur-3xl pointer-events-none`}
          />

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
              style={{ animation: 'float 3s ease-in-out infinite', display: 'inline-block' }}
              className="text-7xl mb-4 leading-none"
            >
              {config.emoji}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <div
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${config.color} mb-4 shadow-md`}
                style={{
                  backgroundSize: '200% auto',
                  animation: 'shimmer 3s linear infinite',
                }}
              >
                <Sparkles className="w-4 h-4" />
                Auto-Detected
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2"
            >
              {hospitalName}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="text-slate-500 text-base"
            >
              We identified your setup as a
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.72, type: 'spring', stiffness: 180 }}
              className={`inline-block mt-2 px-5 py-2 rounded-2xl bg-gradient-to-r ${config.color} text-white text-2xl font-bold shadow-lg`}
            >
              {config.label}
            </motion.div>
          </div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.82 }}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 text-center"
          >
            <p className="text-slate-600 text-sm leading-relaxed">{config.description}</p>
          </motion.div>

          {/* Steps list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.92 }}
          >
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 text-center">
              Your Configuration Journey — {config.steps.length} Steps
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {config.steps.map((step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 + i * 0.06, duration: 0.35 }}
                  className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:border-teal-200 hover:bg-teal-50/30 transition-colors duration-200"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  </span>
                  <span className="text-sm text-slate-700 font-medium">{step}</span>
                  <span className="ml-auto text-xs text-slate-400 font-mono tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 + config.steps.length * 0.06 }}
            className="mt-10 flex justify-center"
          >
            <Button
              onClick={onNext}
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-10 py-4 rounded-2xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 gap-2 text-base h-auto"
            >
              Start Configuration
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}

/* eslint-disable */
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Plus,
  BedDouble,
  User,
  Layers,
  Badge,
} from 'lucide-react';
import { toast } from 'sonner';

import { useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';

interface WizardDepartmentSetupProps {
  onNext: () => void;
  onPrev: () => void;
}

const ALL_SPECIALITIES = [
  'General Medicine',
  'Cardiology',
  'Orthopedics',
  'Pediatrics',
  'Gynecology & Obstetrics',
  'ENT',
  'Ophthalmology',
  'Dermatology',
  'Neurology',
  'Urology',
  'Psychiatry',
  'Dental',
  'Radiology',
  'Emergency / Casualty',
  'ICU / CCU',
];

const SPECIALITY_ICONS: Record<string, string> = {
  'General Medicine': '🩺',
  Cardiology: '❤️',
  Orthopedics: '🦴',
  Pediatrics: '🧒',
  'Gynecology & Obstetrics': '🤰',
  ENT: '👂',
  Ophthalmology: '👁️',
  Dermatology: '🧴',
  Neurology: '🧠',
  Urology: '🫁',
  Psychiatry: '🧘',
  Dental: '🦷',
  Radiology: '🔬',
  'Emergency / Casualty': '🚨',
  'ICU / CCU': '💊',
};

type DeptType = 'OPD' | 'OPD_IPD';

interface DeptConfig {
  enabled: boolean;
  type: DeptType;
  bedCount: string;
  headDoctor: string;
}

type DepartmentMap = Record<string, DeptConfig>;

const defaultDept = (): DeptConfig => ({
  enabled: false,
  type: 'OPD',
  bedCount: '',
  headDoctor: '',
});

const inputCls =
  'w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200';

export default function WizardDepartmentSetup({ onNext, onPrev }: WizardDepartmentSetupProps) {
  const [departments, setDepartments] = useState<DepartmentMap>(() =>
    Object.fromEntries(ALL_SPECIALITIES.map((s) => [s, defaultDept()])),
  );
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(
    () => ALL_SPECIALITIES.filter((s) => s.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  const selectedCount = Object.values(departments).filter((d) => d.enabled).length;

  const updateDept = (name: string, patch: Partial<DeptConfig>) =>
    setDepartments((prev) => ({
      ...prev,
      [name]: { ...prev[name], ...patch },
    }));

  const toggleDept = (name: string) => {
    updateDept(name, { enabled: !departments[name].enabled });
  };

  const handleSubmit = async () => {
    if (selectedCount === 0) {
      toast.error('Please select at least one department.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = Object.entries(departments)
        .filter(([, d]) => d.enabled)
        .map(([name, d]) => ({ name, ...d }));
      console.log('saveDepartmentsAction:', payload);
      await new Promise((r) => setTimeout(r, 700));
      toast.success(`${selectedCount} department${selectedCount > 1 ? 's' : ''} configured!`);
      onNext();
    } catch {
      toast.error('Failed to save departments.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
              <Layers className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Department Setup</h2>
              <p className="text-slate-500 text-sm">Activate specialties your hospital offers</p>
            </div>
          </div>
          <AnimatePresence>
            {selectedCount > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-teal-500/30"
              >
                <CheckCircle2 className="w-4 h-4" />
                {selectedCount} Selected
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all duration-200"
              placeholder="Search speciality…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Department Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AnimatePresence>
              {filtered.map((name) => {
                const dept = departments[name];
                return (
                  <motion.div
                    key={name}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                      dept.enabled
                        ? 'border-teal-400 bg-teal-50/40 shadow-sm shadow-teal-100'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Card header */}
                    <button
                      type="button"
                      onClick={() => toggleDept(name)}
                      className="w-full flex items-center gap-3 p-4 text-left"
                    >
                      <span className="text-2xl leading-none">
                        {SPECIALITY_ICONS[name] ?? '🏥'}
                      </span>
                      <span
                        className={`flex-1 text-sm font-semibold transition-colors ${
                          dept.enabled ? 'text-teal-800' : 'text-slate-700'
                        }`}
                      >
                        {name}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                          dept.enabled ? 'border-teal-500 bg-teal-500' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {dept.enabled && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 bg-white rounded-full"
                          />
                        )}
                      </div>
                    </button>

                    {/* Expanded options */}
                    <AnimatePresence>
                      {dept.enabled && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3 border-t border-teal-100 pt-3">
                            {/* Dept Type */}
                            <div>
                              <p className="text-xs font-medium text-slate-500 mb-2">
                                Department Type
                              </p>
                              <div className="flex gap-2">
                                {(['OPD', 'OPD_IPD'] as DeptType[]).map((t) => (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => updateDept(name, { type: t })}
                                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                                      dept.type === t
                                        ? 'border-teal-500 bg-teal-500 text-white'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300'
                                    }`}
                                  >
                                    {t === 'OPD' ? 'OPD Only' : 'OPD + IPD'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Bed count */}
                            <AnimatePresence>
                              {dept.type === 'OPD_IPD' && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                >
                                  <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                                    <BedDouble className="w-3 h-3" />
                                    Bed Count
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    className={inputCls}
                                    placeholder="e.g. 20"
                                    value={dept.bedCount}
                                    onChange={(e) => updateDept(name, { bedCount: e.target.value })}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Head Doctor */}
                            <div>
                              <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                                <User className="w-3 h-3" />
                                Head Doctor
                                <span className="text-slate-400 font-normal">(optional)</span>
                              </label>
                              <input
                                className={inputCls}
                                placeholder="Dr. Name"
                                value={dept.headDoctor}
                                onChange={(e) => updateDept(name, { headDoctor: e.target.value })}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="sm:col-span-2 py-12 text-center text-slate-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No speciality found for "{search}"</p>
              </div>
            )}
          </div>

          {/* Validation */}
          <AnimatePresence>
            {selectedCount === 0 && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
              >
                Select at least one department to continue.
              </motion.p>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              type="button"
              variant="ghost"
              onClick={onPrev}
              className="gap-2 text-slate-600 hover:text-slate-900"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={selectedCount === 0 || submitting}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 gap-2 h-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {submitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Saving…
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

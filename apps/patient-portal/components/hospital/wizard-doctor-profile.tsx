/* eslint-disable */
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Stethoscope,
  BadgeCheck,
  Building2,
  IndianRupee,
  Clock,
  Camera,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

import { useState, useRef, ChangeEvent } from 'react';

import { Button } from '@/components/ui/button';

interface WizardDoctorProfileProps {
  onNext: () => void;
  onPrev: () => void;
}

const SPECIALITIES = [
  'General Medicine',
  'Pediatrics',
  'Gynecology',
  'Dermatology',
  'Orthopedics',
  'ENT',
  'Ophthalmology',
  'Psychiatry',
  'Cardiology',
  'Dentistry',
  'Homeopathy',
  'Ayurveda',
  'Other',
];

const SLOT_DURATIONS = [
  { value: '10', label: '10 min' },
  { value: '15', label: '15 min' },
  { value: '20', label: '20 min' },
  { value: '30', label: '30 min' },
];

interface FormState {
  fullName: string;
  speciality: string;
  registrationNumber: string;
  medicalCouncil: string;
  consultationFee: string;
  morningStart: string;
  morningEnd: string;
  eveningStart: string;
  eveningEnd: string;
  slotDuration: string;
  profilePhoto: File | null;
  photoPreview: string | null;
}

const initialForm: FormState = {
  fullName: '',
  speciality: '',
  registrationNumber: '',
  medicalCouncil: '',
  consultationFee: '',
  morningStart: '09:00',
  morningEnd: '13:00',
  eveningStart: '17:00',
  eveningEnd: '21:00',
  slotDuration: '15',
  profilePhoto: null,
  photoPreview: null,
};

const inputCls =
  'w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200';

const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5';

export default function WizardDoctorProfile({ onNext, onPrev }: WizardDoctorProfileProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof FormState, value: string | File | null) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, profilePhoto: file, photoPreview: url }));
  };

  const requiredFilled =
    form.fullName.trim().length > 0 &&
    form.speciality.length > 0 &&
    form.registrationNumber.trim().length > 0 &&
    form.consultationFee.trim().length > 0;

  const handleSubmit = async () => {
    if (!requiredFilled) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined) {
          if (v instanceof File) fd.append(k, v);
          else fd.append(k, v as string);
        }
      });
      // Server action placeholder
      console.log('saveDoctorProfileAction called with:', Object.fromEntries(fd.entries()));
      await new Promise((r) => setTimeout(r, 700));
      toast.success('Doctor profile saved!', {
        description: `Dr. ${form.fullName} · ${form.speciality}`,
      });
      onNext();
    } catch {
      toast.error('Failed to save profile. Please try again.');
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Doctor Profile</h2>
              <p className="text-slate-500 text-sm">Set up your professional details</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
          {/* Profile Photo */}
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative group w-28 h-28 rounded-3xl border-2 border-dashed border-slate-300 hover:border-teal-400 bg-slate-50 hover:bg-teal-50/30 flex items-center justify-center transition-all duration-200 overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {form.photoPreview ? (
                  <motion.img
                    key="preview"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    src={form.photoPreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover rounded-3xl"
                  />
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <Camera className="w-7 h-7 text-slate-400 group-hover:text-teal-500 transition-colors" />
                    <span className="text-xs text-slate-400 group-hover:text-teal-500 font-medium transition-colors">
                      Upload Photo
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              {form.photoPreview && (
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <p className="text-xs text-slate-400">JPG, PNG or WebP · Max 5MB</p>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Personal Details */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Personal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className={labelCls}>
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="Dr. Arjun Mehta"
                  value={form.fullName}
                  onChange={(e) => set('fullName', e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Speciality <span className="text-red-500">*</span>
                </label>
                <select
                  className={inputCls}
                  value={form.speciality}
                  onChange={(e) => set('speciality', e.target.value)}
                >
                  <option value="">Select speciality…</option>
                  {SPECIALITIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>
                  Consultation Fee (INR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <IndianRupee className="w-4 h-4" />
                  </span>
                  <input
                    className={`${inputCls} pl-9`}
                    type="number"
                    min="0"
                    placeholder="500"
                    value={form.consultationFee}
                    onChange={(e) => set('consultationFee', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Registration */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <BadgeCheck className="w-3.5 h-3.5" /> Registration
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>
                  Medical Registration Number <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="MH-12345"
                  value={form.registrationNumber}
                  onChange={(e) => set('registrationNumber', e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Medical Council</label>
                <input
                  className={inputCls}
                  placeholder="e.g. Maharashtra Medical Council"
                  value={form.medicalCouncil}
                  onChange={(e) => set('medicalCouncil', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* OPD Hours */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> OPD Hours
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Morning Start</label>
                <input
                  type="time"
                  className={inputCls}
                  value={form.morningStart}
                  onChange={(e) => set('morningStart', e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Morning End</label>
                <input
                  type="time"
                  className={inputCls}
                  value={form.morningEnd}
                  onChange={(e) => set('morningEnd', e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Evening Start</label>
                <input
                  type="time"
                  className={inputCls}
                  value={form.eveningStart}
                  onChange={(e) => set('eveningStart', e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Evening End</label>
                <input
                  type="time"
                  className={inputCls}
                  value={form.eveningEnd}
                  onChange={(e) => set('eveningEnd', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Slot Duration */}
          <div>
            <label className={labelCls}>Slot Duration</label>
            <div className="flex gap-3 flex-wrap">
              {SLOT_DURATIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => set('slotDuration', d.value)}
                  className={`flex-1 min-w-[80px] px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                    form.slotDuration === d.value
                      ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm shadow-teal-100'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Validation hint */}
          <AnimatePresence>
            {!requiredFilled && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
              >
                Please fill in all required fields (marked with{' '}
                <span className="text-red-500">*</span>) to continue.
              </motion.p>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
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
              disabled={!requiredFilled || submitting}
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

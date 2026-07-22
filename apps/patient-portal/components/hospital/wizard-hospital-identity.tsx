/* eslint-disable */
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Upload,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { useState, useRef, ChangeEvent } from 'react';

import { Button } from '@/components/ui/button';

interface WizardHospitalIdentityProps {
  onNext: () => void;
  onPrev: () => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu & Kashmir',
  'Ladakh',
  'Puducherry',
  'Chandigarh',
  'Andaman & Nicobar',
  'Dadra & Nagar Haveli',
  'Lakshadweep',
];

interface FormState {
  legalName: string;
  displayName: string;
  logo: File | null;
  logoPreview: string | null;
  nabh: boolean | null;
  email: string;
  phone: string;
  address1: string;
  city: string;
  state: string;
  pincode: string;
  googleMapsUrl: string;
  gstApplicable: boolean | null;
  gstNumber: string;
  registrationNumber: string;
  invoicePrefix: string;
}

const initial: FormState = {
  legalName: '',
  displayName: '',
  logo: null,
  logoPreview: null,
  nabh: null,
  email: '',
  phone: '',
  address1: '',
  city: '',
  state: '',
  pincode: '',
  googleMapsUrl: '',
  gstApplicable: null,
  gstNumber: '',
  registrationNumber: '',
  invoicePrefix: '',
};

const inputCls =
  'w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200';

const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5';

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-9 h-9 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-teal-600" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function YesNoToggle({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex gap-2">
      {[true, false].map((v) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
            value === v
              ? v
                ? 'border-teal-500 bg-teal-50 text-teal-700'
                : 'border-rose-400 bg-rose-50 text-rose-600'
              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
          }`}
        >
          {v ? 'Yes' : 'No'}
        </button>
      ))}
    </div>
  );
}

export default function WizardHospitalIdentity({ onNext, onPrev }: WizardHospitalIdentityProps) {
  const [form, setForm] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    set('logo', file);
    set('logoPreview', URL.createObjectURL(file));
  };

  const requiredFilled =
    form.legalName.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.phone.trim().length > 0 &&
    form.address1.trim().length > 0 &&
    form.city.trim().length > 0 &&
    form.state.length > 0 &&
    form.pincode.trim().length === 6;

  const handleSubmit = async () => {
    if (!requiredFilled) return;
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      toast.success('Hospital identity saved!', { description: form.legalName });
      onNext();
    } catch {
      toast.error('Failed to save. Please try again.');
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
        {/* Page header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Hospital Identity</h2>
            <p className="text-slate-500 text-sm">Branding, contact, and legal information</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* ───── Section 1 – Basic Identity ───── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm"
          >
            <SectionHeader
              icon={Building2}
              title="Basic Identity"
              subtitle="Official name and branding"
            />

            <div className="space-y-5">
              <div>
                <label className={labelCls}>
                  Legal / Official Hospital Name <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="City General Hospital Pvt. Ltd."
                  value={form.legalName}
                  onChange={(e) => set('legalName', e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>
                  Display / Brand Name
                  <span className="ml-1.5 text-xs text-slate-400 font-normal">
                    (shown on patient-facing pages)
                  </span>
                </label>
                <input
                  className={inputCls}
                  placeholder="City General Hospital"
                  value={form.displayName}
                  onChange={(e) => set('displayName', e.target.value)}
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className={labelCls}>Hospital Logo</label>
                <div
                  onClick={() => logoRef.current?.click()}
                  className="relative cursor-pointer group border-2 border-dashed border-slate-300 hover:border-teal-400 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 bg-slate-50 hover:bg-teal-50/20 transition-all duration-200 min-h-[120px]"
                >
                  <input
                    ref={logoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <AnimatePresence mode="wait">
                    {form.logoPreview ? (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <img
                          src={form.logoPreview}
                          alt="Logo preview"
                          className="h-16 max-w-[180px] object-contain rounded-xl"
                        />
                        <span className="text-xs text-teal-600 font-medium">Click to change</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <Upload className="w-8 h-8 text-slate-400 group-hover:text-teal-500 transition-colors" />
                        <p className="text-sm text-slate-500 group-hover:text-teal-600 transition-colors">
                          Click to upload logo
                        </p>
                        <p className="text-xs text-slate-400">
                          PNG, SVG, JPG · transparent background recommended
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* NABH */}
              <div>
                <label className={labelCls}>NABH Accredited?</label>
                <YesNoToggle value={form.nabh} onChange={(v) => set('nabh', v)} />
              </div>
            </div>
          </motion.div>

          {/* ───── Section 2 – Contact & Location ───── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm"
          >
            <SectionHeader
              icon={MapPin}
              title="Contact & Location"
              subtitle="Reach & address details"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>
                  Official Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    className={`${inputCls} pl-9`}
                    placeholder="admin@hospital.com"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    className={`${inputCls} pl-9`}
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="Plot 12, Sector 5, Near Civil Hospital"
                  value={form.address1}
                  onChange={(e) => set('address1', e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="Mumbai"
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  className={inputCls}
                  value={form.state}
                  onChange={(e) => set('state', e.target.value)}
                >
                  <option value="">Select state…</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="400001"
                  maxLength={6}
                  value={form.pincode}
                  onChange={(e) => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>

              <div>
                <label className={labelCls}>
                  Google Maps URL
                  <span className="ml-1.5 text-xs text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="https://maps.google.com/…"
                  value={form.googleMapsUrl}
                  onChange={(e) => set('googleMapsUrl', e.target.value)}
                />
              </div>
            </div>
          </motion.div>

          {/* ───── Section 3 – GST & Registration ───── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm"
          >
            <SectionHeader
              icon={FileText}
              title="GST & Registration"
              subtitle="Tax and legal identifiers"
            />

            <div className="space-y-5">
              <div>
                <label className={labelCls}>GST Applicable?</label>
                <YesNoToggle value={form.gstApplicable} onChange={(v) => set('gstApplicable', v)} />
              </div>

              <AnimatePresence>
                {form.gstApplicable === true && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <label className={labelCls}>
                      GST Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      className={inputCls}
                      placeholder="27AABCU9603R1ZX"
                      maxLength={15}
                      value={form.gstNumber}
                      onChange={(e) => set('gstNumber', e.target.value.toUpperCase())}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Hospital Registration Number</label>
                  <input
                    className={inputCls}
                    placeholder="HRN-MH-2024-001"
                    value={form.registrationNumber}
                    onChange={(e) => set('registrationNumber', e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelCls}>Invoice Prefix</label>
                  <div className="relative">
                    <input
                      className={inputCls}
                      placeholder="HAST"
                      maxLength={6}
                      value={form.invoicePrefix}
                      onChange={(e) =>
                        set('invoicePrefix', e.target.value.toUpperCase().slice(0, 6))
                      }
                    />
                    {form.invoicePrefix && (
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                        {form.invoicePrefix}-00001
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Max 6 characters · used in invoice numbering
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex items-center justify-between pt-2 pb-4"
          >
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
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

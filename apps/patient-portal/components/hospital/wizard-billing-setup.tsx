'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt,
  IndianRupee,
  CreditCard,
  Banknote,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Check,
  Percent,
  Building2,
  Smartphone,
  Shield,
  Wifi,
} from 'lucide-react';
import { toast } from 'sonner';

import { useState, ReactNode } from 'react';

import { Button } from '@/components/ui/button';

interface WizardBillingSetupProps {
  onNext: () => void;
  onPrev: () => void;
}

const inputCls =
  'w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200';

const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5';

// ─── Collapsible Section ────────────────────────────────────────────────────
function CollapsibleSection({
  icon: Icon,
  title,
  subtitle,
  complete,
  total,
  children,
  delay = 0,
  defaultOpen = true,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  complete: number;
  total: number;
  children: ReactNode;
  delay?: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const pct = total > 0 ? Math.round((complete / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden"
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-4 px-6 sm:px-8 py-5 text-left hover:bg-slate-50/60 transition-colors"
      >
        <div className="w-9 h-9 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-900">{title}</span>
            {pct === 100 && (
              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-semibold">
                ✓ Complete
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        {/* Progress ring */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-teal-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, delay: delay + 0.2 }}
              />
            </div>
            <span className="text-xs font-medium text-slate-500 tabular-nums w-7 text-right">
              {pct}%
            </span>
          </div>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </motion.div>
        </div>
      </button>

      {/* Body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 sm:px-8 pb-8 pt-1 border-t border-slate-100 space-y-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Toggle Switch ───────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 transition-colors duration-200 ${
        value ? 'border-teal-500 bg-teal-500' : 'border-slate-300 bg-slate-200'
      }`}
    >
      <motion.span
        layout
        className="inline-block w-4 h-4 rounded-full bg-white shadow-sm"
        style={{ translateY: '-1px' }}
        animate={{ x: value ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

// ─── Button Toggle Group ─────────────────────────────────────────────────────
function ButtonGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all duration-150 ${
            value === opt.value
              ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

type GSTRate = '0' | '5' | '12' | '18';
type AccountType = 'SAVINGS' | 'CURRENT';

interface FormState {
  invoicePrefix: string;
  gstApplicable: boolean;
  gstRate: GSTRate | null;
  gstNumber: string;
  defaultConsultFee: string;
  revisitFee: string;
  emergencyFee: string;
  cashEnabled: boolean;
  upiEnabled: boolean;
  upiVpa: string;
  cardEnabled: boolean;
  insuranceEnabled: boolean;
  onlinePayEnabled: boolean;
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  showAccountNumber: boolean;
  ifsc: string;
  accountType: AccountType | null;
}

const initial: FormState = {
  invoicePrefix: '',
  gstApplicable: false,
  gstRate: null,
  gstNumber: '',
  defaultConsultFee: '',
  revisitFee: '',
  emergencyFee: '',
  cashEnabled: true,
  upiEnabled: false,
  upiVpa: '',
  cardEnabled: false,
  insuranceEnabled: false,
  onlinePayEnabled: false,
  accountHolder: '',
  bankName: '',
  accountNumber: '',
  showAccountNumber: false,
  ifsc: '',
  accountType: null,
};

function countFilled(...vals: (string | boolean | null)[]): number {
  return vals.filter((v) => {
    if (typeof v === 'string') return v.trim().length > 0;
    if (typeof v === 'boolean') return true;
    return v !== null;
  }).length;
}

export default function WizardBillingSetup({ onNext, onPrev }: WizardBillingSetupProps) {
  const [form, setForm] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Section completion counts
  const s1Done = countFilled(
    form.invoicePrefix,
    form.gstApplicable ? 'yes' : null,
    form.gstApplicable ? form.gstRate : 'skip',
    form.gstApplicable ? form.gstNumber : 'skip',
  );
  const s1Total = form.gstApplicable ? 4 : 2;

  const s2Done = countFilled(form.defaultConsultFee, form.revisitFee, form.emergencyFee);
  const s2Total = 3;

  const s3Done = [
    form.cashEnabled,
    form.upiEnabled,
    form.cardEnabled,
    form.insuranceEnabled,
    form.onlinePayEnabled,
  ].filter(Boolean).length;
  const s3Total = 5;

  const s4Done = countFilled(
    form.accountHolder,
    form.bankName,
    form.accountNumber,
    form.ifsc,
    form.accountType,
  );
  const s4Total = 5;

  const requiredFilled =
    form.invoicePrefix.trim().length > 0 && form.defaultConsultFee.trim().length > 0;

  const maskedAccount = form.accountNumber ? form.accountNumber.replace(/.(?=.{4})/g, '•') : '';

  const handleSubmit = async () => {
    if (!requiredFilled) return;
    setSubmitting(true);
    try {
      console.log('saveBillingSetupAction:', form);
      await new Promise((r) => setTimeout(r, 700));
      toast.success('Billing configuration saved!', {
        description: `Invoice prefix: ${form.invoicePrefix || 'Not set'}`,
      });
      onNext();
    } catch {
      toast.error('Failed to save billing settings.');
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
            <Receipt className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Billing & Finance</h2>
            <p className="text-slate-500 text-sm">Configure invoicing, fees, and payment methods</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* ──── Section 1 – Invoice Settings ──── */}
          <CollapsibleSection
            icon={Receipt}
            title="Invoice Settings"
            subtitle="Prefix, currency, and GST"
            complete={s1Done}
            total={s1Total}
            delay={0.08}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>
                  Invoice Prefix <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    className={inputCls}
                    placeholder="HAST"
                    maxLength={6}
                    value={form.invoicePrefix}
                    onChange={(e) => set('invoicePrefix', e.target.value.toUpperCase().slice(0, 6))}
                  />
                  {form.invoicePrefix && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                      Preview: {form.invoicePrefix}-00001
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">Max 6 chars</p>
              </div>

              <div>
                <label className={labelCls}>Billing Currency</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-xl">🇮🇳</span>
                  <span className="text-sm font-semibold text-slate-700">INR — Indian Rupee</span>
                  <IndianRupee className="w-4 h-4 text-slate-400 ml-auto" />
                </div>
              </div>
            </div>

            {/* GST */}
            <div>
              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-800">GST Applicable?</p>
                  <p className="text-xs text-slate-500">
                    Enable if your practice charges GST on services
                  </p>
                </div>
                <Toggle value={form.gstApplicable} onChange={(v) => set('gstApplicable', v)} />
              </div>
            </div>

            <AnimatePresence>
              {form.gstApplicable && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-4"
                >
                  <div>
                    <label className={labelCls}>GST Rate</label>
                    <ButtonGroup
                      options={[
                        { value: '0', label: '0%' },
                        { value: '5', label: '5%' },
                        { value: '12', label: '12%' },
                        { value: '18', label: '18%' },
                      ]}
                      value={form.gstRate}
                      onChange={(v) => set('gstRate', v as GSTRate)}
                    />
                  </div>
                  <div>
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CollapsibleSection>

          {/* ──── Section 2 – Default Fees ──── */}
          <CollapsibleSection
            icon={IndianRupee}
            title="Default Fees"
            subtitle="Consultation and service charges"
            complete={s2Done}
            total={s2Total}
            delay={0.14}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { key: 'defaultConsultFee', label: 'Default Consultation', required: true },
                { key: 'revisitFee', label: 'Revisit / Follow-up', required: false },
                { key: 'emergencyFee', label: 'Emergency Consultation', required: false },
              ].map(({ key, label, required }) => (
                <div key={key}>
                  <label className={labelCls}>
                    {label} {required && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      className={`${inputCls} pl-9`}
                      placeholder="500"
                      value={(form as any)[key]}
                      onChange={(e) => set(key as keyof FormState, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* ──── Section 3 – Payment Methods ──── */}
          <CollapsibleSection
            icon={CreditCard}
            title="Payment Methods"
            subtitle="Accepted modes at your facility"
            complete={s3Done}
            total={s3Total}
            delay={0.2}
          >
            <div className="space-y-3">
              {/* Cash – always on */}
              <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-teal-200 bg-teal-50/40">
                <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-teal-900">Cash</p>
                  <p className="text-xs text-teal-600">Always accepted · cannot be disabled</p>
                </div>
                <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              </div>

              {/* UPI */}
              <div
                className={`border-2 rounded-2xl transition-all duration-200 ${
                  form.upiEnabled ? 'border-teal-300 bg-teal-50/30' : 'border-slate-200 bg-white'
                }`}
              >
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => set('upiEnabled', !form.upiEnabled)}
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">UPI</p>
                    <p className="text-xs text-slate-500">QR code / VPA payments</p>
                  </div>
                  <Toggle value={form.upiEnabled} onChange={(v) => set('upiEnabled', v)} />
                </div>
                <AnimatePresence>
                  {form.upiEnabled && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-teal-100 pt-3">
                        <label className={labelCls}>UPI VPA / QR Code ID</label>
                        <input
                          className={inputCls}
                          placeholder="yourname@upi"
                          value={form.upiVpa}
                          onChange={(e) => set('upiVpa', e.target.value)}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Card, Insurance, Online */}
              {[
                {
                  key: 'cardEnabled',
                  label: 'Card (Swipe Machine)',
                  desc: 'Debit & credit card payments',
                  Icon: CreditCard,
                  iconBg: 'bg-blue-100',
                  iconColor: 'text-blue-600',
                },
                {
                  key: 'insuranceEnabled',
                  label: 'Insurance',
                  desc: 'TPA cashless & reimbursement',
                  Icon: Shield,
                  iconBg: 'bg-green-100',
                  iconColor: 'text-green-600',
                },
                {
                  key: 'onlinePayEnabled',
                  label: 'Online Pre-payment',
                  desc: 'Razorpay / Stripe payment links',
                  Icon: Wifi,
                  iconBg: 'bg-orange-100',
                  iconColor: 'text-orange-600',
                },
              ].map(({ key, label, desc, Icon, iconBg, iconColor }) => (
                <div
                  key={key}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                    (form as any)[key]
                      ? 'border-teal-300 bg-teal-50/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                  onClick={() => set(key as keyof FormState, !(form as any)[key])}
                >
                  <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{label}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                  <Toggle
                    value={(form as any)[key]}
                    onChange={(v) => set(key as keyof FormState, v)}
                  />
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* ──── Section 4 – Bank Account ──── */}
          <CollapsibleSection
            icon={Building2}
            title="Bank Account"
            subtitle="Settlement & payout details"
            complete={s4Done}
            total={s4Total}
            delay={0.26}
            defaultOpen={false}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className={labelCls}>Account Holder Name</label>
                <input
                  className={inputCls}
                  placeholder="City General Hospital Pvt. Ltd."
                  value={form.accountHolder}
                  onChange={(e) => set('accountHolder', e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>Bank Name</label>
                <input
                  className={inputCls}
                  placeholder="State Bank of India"
                  value={form.bankName}
                  onChange={(e) => set('bankName', e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>IFSC Code</label>
                <input
                  className={inputCls}
                  placeholder="SBIN0001234"
                  maxLength={11}
                  value={form.ifsc}
                  onChange={(e) => set('ifsc', e.target.value.toUpperCase())}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Account Number</label>
                <div className="relative">
                  <input
                    type={form.showAccountNumber ? 'text' : 'password'}
                    className={`${inputCls} pr-12`}
                    placeholder="••••••••••••"
                    value={form.accountNumber}
                    onChange={(e) => set('accountNumber', e.target.value.replace(/\D/g, ''))}
                  />
                  <button
                    type="button"
                    onClick={() => set('showAccountNumber', !form.showAccountNumber)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {form.showAccountNumber ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {form.accountNumber && !form.showAccountNumber && (
                  <p className="text-xs text-slate-400 mt-1 font-mono">{maskedAccount}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Account Type</label>
                <div className="flex gap-3">
                  {(['SAVINGS', 'CURRENT'] as AccountType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set('accountType', t)}
                      className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-150 ${
                        form.accountType === t
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {t === 'SAVINGS' ? 'Savings' : 'Current'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Validation hint */}
          <AnimatePresence>
            {!requiredFilled && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
              >
                Please fill in Invoice Prefix and Default Consultation Fee to continue.
              </motion.p>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.38 }}
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

/* eslint-disable */
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Phone,
  Bell,
  Globe,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Check,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

import { useState } from 'react';

import { Button } from '@/components/ui/button';

interface WizardWhatsappCommsProps {
  onNext: () => void;
  onPrev: () => void;
}

type WhatsAppProvider = 'META' | 'TWILIO' | 'GUPSHUP' | 'WATI';
type SMSProvider = 'MSG91' | 'FAST2SMS';
type Language = 'English' | 'Hindi' | 'Marathi' | 'Gujarati' | 'Tamil' | 'Bengali';

const WHATSAPP_PROVIDERS: { id: WhatsAppProvider; label: string; desc: string; badge?: string }[] =
  [
    {
      id: 'META',
      label: 'Meta Business API',
      desc: 'Official Meta Cloud API',
      badge: 'Recommended',
    },
    { id: 'TWILIO', label: 'Twilio', desc: 'Enterprise-grade messaging' },
    { id: 'GUPSHUP', label: 'Gupshup', desc: 'Popular in India' },
    { id: 'WATI', label: 'WATI', desc: 'WhatsApp Team Inbox' },
  ];

const SMS_PROVIDERS: { id: SMSProvider; label: string; desc: string }[] = [
  { id: 'MSG91', label: 'MSG91', desc: 'DLT compliant, widely used' },
  { id: 'FAST2SMS', label: 'Fast2SMS', desc: 'Low-cost bulk SMS' },
];

const NOTIFICATION_TYPES = [
  { id: 'appt_confirm', label: 'Appointment Confirmation', icon: '📅' },
  { id: 'prescription', label: 'Prescription PDF', icon: '💊' },
  { id: 'invoice', label: 'Invoice / Bill', icon: '🧾' },
  { id: 'followup', label: 'Follow-up Reminders', icon: '🔔' },
  { id: 'lab_report', label: 'Lab Report Ready', icon: '🔬' },
  { id: 'discharge', label: 'Discharge Summary', icon: '🏥' },
];

const LANGUAGES: Language[] = ['English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Bengali'];

const inputCls =
  'w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200';

const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5';

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-teal-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function BigToggle({
  value,
  onChange,
  yesLabel = 'Yes',
  noLabel = 'No',
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
}) {
  return (
    <div className="flex gap-3">
      {[true, false].map((v) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${
            value === v
              ? v
                ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm'
                : 'border-slate-400 bg-slate-100 text-slate-700'
              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
          }`}
        >
          {v ? yesLabel : noLabel}
        </button>
      ))}
    </div>
  );
}

function RadioCard<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string; desc: string; badge?: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
            value === opt.id
              ? 'border-teal-500 bg-teal-50/60'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          {opt.badge && (
            <span className="absolute top-2.5 right-2.5 text-xs bg-teal-500 text-white px-2 py-0.5 rounded-full font-semibold">
              {opt.badge}
            </span>
          )}
          <div
            className={`w-4 h-4 rounded-full border-2 mb-2 flex items-center justify-center transition-all ${
              value === opt.id ? 'border-teal-500 bg-teal-500' : 'border-slate-300 bg-white'
            }`}
          >
            {value === opt.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
          </div>
          <p className="text-sm font-semibold text-slate-900">{opt.label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
        </button>
      ))}
    </div>
  );
}

export default function WizardWhatsappComms({ onNext, onPrev }: WizardWhatsappCommsProps) {
  const [whatsappEnabled, setWhatsappEnabled] = useState<boolean | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappProvider, setWhatsappProvider] = useState<WhatsAppProvider | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const [smsEnabled, setSmsEnabled] = useState<boolean | null>(null);
  const [smsProvider, setSmsProvider] = useState<SMSProvider | null>(null);

  const [notifications, setNotifications] = useState<Set<string>>(
    () => new Set(['appt_confirm', 'prescription', 'invoice']),
  );

  const [language, setLanguage] = useState<Language>('English');
  const [use24h, setUse24h] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState(false);

  const toggleNotif = (id: string) =>
    setNotifications((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      toast.success('Communication settings saved!');
      onNext();
    } catch {
      toast.error('Failed to save settings.');
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
            <MessageCircle className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Communication Setup</h2>
            <p className="text-slate-500 text-sm">WhatsApp, SMS & notification preferences</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* ── Section 1 – WhatsApp Business ── */}
          <SectionCard
            icon={MessageCircle}
            title="WhatsApp Business"
            subtitle="Send appointment & prescription messages"
            delay={0.08}
          >
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Enable WhatsApp?</label>
                <BigToggle
                  value={whatsappEnabled}
                  onChange={setWhatsappEnabled}
                  yesLabel="✅ Yes, Enable"
                  noLabel="Skip for now"
                />
              </div>

              <AnimatePresence>
                {whatsappEnabled === true && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-5"
                  >
                    <div>
                      <label className={labelCls}>
                        WhatsApp Business Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          className={`${inputCls} pl-9`}
                          placeholder="+91 98765 43210"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>API Provider</label>
                      <RadioCard
                        options={WHATSAPP_PROVIDERS}
                        value={whatsappProvider}
                        onChange={(v) => setWhatsappProvider(v as WhatsAppProvider)}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>API Key / Access Token</label>
                      <div className="relative">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          className={`${inputCls} pr-12`}
                          placeholder="Paste your API key…"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey((p) => !p)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showApiKey ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5">
                        Stored encrypted — never shared
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </SectionCard>

          {/* ── Section 2 – SMS Fallback ── */}
          <SectionCard
            icon={Phone}
            title="SMS Fallback"
            subtitle="For patients without WhatsApp"
            delay={0.15}
          >
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Enable SMS?</label>
                <BigToggle value={smsEnabled} onChange={setSmsEnabled} />
              </div>

              <AnimatePresence>
                {smsEnabled === true && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <label className={labelCls}>SMS Provider</label>
                    <RadioCard
                      options={SMS_PROVIDERS}
                      value={smsProvider}
                      onChange={(v) => setSmsProvider(v as SMSProvider)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </SectionCard>

          {/* ── Section 3 – Notifications ── */}
          <SectionCard
            icon={Bell}
            title="Notifications Config"
            subtitle="What to send to patients automatically"
            delay={0.22}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {NOTIFICATION_TYPES.map((n) => {
                const active = notifications.has(n.id);
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => toggleNotif(n.id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                      active
                        ? 'border-teal-400 bg-teal-50/60'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl leading-none">{n.icon}</span>
                    <span
                      className={`flex-1 text-sm font-medium transition-colors ${
                        active ? 'text-teal-800' : 'text-slate-700'
                      }`}
                    >
                      {n.label}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                        active ? 'border-teal-500 bg-teal-500' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {active && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          {/* ── Section 4 – Language & Region ── */}
          <SectionCard
            icon={Globe}
            title="Language & Region"
            subtitle="Message language and time preferences"
            delay={0.29}
          >
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Primary Language</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLanguage(lang)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                        language === lang
                          ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">24-Hour Time Format</p>
                    <p className="text-xs text-slate-500">e.g. 14:30 instead of 2:30 PM</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUse24h((p) => !p)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 transition-colors duration-200 ${
                    use24h ? 'border-teal-500 bg-teal-500' : 'border-slate-300 bg-slate-200'
                  }`}
                >
                  <motion.span
                    layout
                    className="inline-block w-4 h-4 rounded-full bg-white shadow-sm translate-y-[-1px]"
                    animate={{ x: use24h ? 20 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>
          </SectionCard>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
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
              disabled={submitting}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 gap-2 h-auto disabled:opacity-50"
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

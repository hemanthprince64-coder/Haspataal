'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Hospital,
  Shield,
  Clock,
  Palette,
  ChevronDown,
  ChevronUp,
  Save,
  CheckCircle,
  AlertCircle,
  Upload,
  Loader2,
  MapPin,
  Mail,
  Phone,
  Globe,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';

// ─── Schema ────────────────────────────────────────────────────────────────────

const identitySchema = z
  .object({
    legalName: z.string().min(2, 'Legal name required'),
    displayName: z.string().min(2, 'Display name required'),
    hospitalType: z.enum([
      'HOSPITAL',
      'CLINIC',
      'DIAGNOSTIC_CENTER',
      'NURSING_HOME',
      'MULTISPECIALTY',
      'CORPORATE',
    ]),
    brandColor: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, 'Must be hex color')
      .optional()
      .or(z.literal('')),
    stateRegistrationNumber: z.string().optional(),
    registrationNumber: z.string().optional(),
    gstNumber: z
      .string()
      .optional()
      .refine((v) => !v || v.length === 15, 'GST must be 15 chars'),
    panNumber: z.string().optional(),
    cinNumber: z.string().optional(),
    officialEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
    contactNumber: z.string().regex(/^\+?[\d\s-]{10,}$/, 'Valid contact number required'),
    addressLine1: z.string().min(1, 'Address Line 1 is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
    nabhAccredited: z.boolean().default(false),
    nablAccredited: z.boolean().default(false),
    timezone: z.string().default('Asia/Kolkata'),
    workingDays: z.array(z.string()).default(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
    emergencyContact: z.string().optional(),
    isMultiBranch: z.boolean().default(false),
    letterheadTemplate: z.string().optional(),
    prescriptionHeader: z.string().optional(),
    prescriptionFooter: z.string().optional(),
    logoUrl: z.string().optional().or(z.literal('')),
    faviconUrl: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.openTime && data.closeTime) {
        return data.openTime < data.closeTime;
      }
      return true;
    },
    {
      message: 'Closing time must be after opening time',
      path: ['closeTime'],
    },
  )
  .refine(
    (data) => {
      if (data.hospitalType === 'CORPORATE' && !data.cinNumber) {
        return false;
      }
      return true;
    },
    {
      message: 'CIN Number is required for Corporate hospitals',
      path: ['cinNumber'],
    },
  );

type IdentityForm = z.infer<typeof identitySchema>;

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMEZONES = [
  'Asia/Kolkata',
  'Asia/Colombo',
  'Asia/Dhaka',
  'Asia/Kathmandu',
  'Asia/Dubai',
  'Asia/Singapore',
  'UTC',
];
const HOSPITAL_TYPES = [
  { value: 'HOSPITAL', label: 'Hospital' },
  { value: 'CLINIC', label: 'Clinic' },
  { value: 'DIAGNOSTIC_CENTER', label: 'Diagnostic Center' },
  { value: 'NURSING_HOME', label: 'Nursing Home' },
  { value: 'MULTISPECIALTY', label: 'Multispecialty Hospital' },
  { value: 'CORPORATE', label: 'Corporate Hospital' },
];

// ─── Collapsible Section ───────────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        suppressHydrationWarning
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Icon className="h-4 w-4 text-blue-600" />
          </div>
          <span className="font-semibold text-slate-800 text-sm">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Field Component ───────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
  required,
  hint,
}: {
  label: string;
  error?: any;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold text-slate-600">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {hint && <span className="text-[10px] text-slate-400 font-medium">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1 font-medium">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function HospitalIdentityPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const autosaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const DRAFT_KEY = 'identity_draft_v2';

  const form = useForm<IdentityForm>({
    resolver: zodResolver(identitySchema) as any,
    defaultValues: {
      legalName: '',
      displayName: '',
      hospitalType: 'MULTISPECIALTY',
      brandColor: '#2563eb',
      nabhAccredited: false,
      nablAccredited: false,
      timezone: 'Asia/Kolkata',
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      isMultiBranch: false,
      contactNumber: '',
      officialEmail: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = form;

  // Load existing data
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const d = JSON.parse(draft);
        Object.entries(d).forEach(([k, v]) => setValue(k as keyof IdentityForm, v as any));
      } catch {}
    }

    fetch('/api/hospital/identity')
      .then((r) => r.json())
      .then((data) => {
        if (data.hospital) {
          const h = data.hospital;
          const fields: Partial<IdentityForm> = {
            legalName: h.legalName ?? '',
            displayName: h.displayName ?? '',
            hospitalType: h.hospitalType ?? 'MULTISPECIALTY',
            brandColor: h.brandColor ?? '#2563eb',
            stateRegistrationNumber: h.stateRegistrationNumber ?? '',
            registrationNumber: h.registrationNumber ?? '',
            gstNumber: h.gstNumber ?? '',
            panNumber: h.panNumber ?? '',
            cinNumber: h.cinNumber ?? '',
            officialEmail: h.officialEmail ?? '',
            nabhAccredited: h.nabhAccredited ?? false,
            nablAccredited: h.nablAccredited ?? false,
            timezone: h.timezone ?? 'Asia/Kolkata',
            workingDays: h.workingDays?.length
              ? h.workingDays
              : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            openTime: h.openTime ?? '',
            closeTime: h.closeTime ?? '',
            emergencyContact: h.emergencyContact ?? '',
            isMultiBranch: h.isMultiBranch ?? false,
            contactNumber: h.contactNumber ?? '',
            addressLine1: h.addressLine1 ?? '',
            addressLine2: h.addressLine2 ?? '',
            city: h.city ?? '',
            state: h.state ?? '',
            pincode: h.pincode ?? '',
            letterheadTemplate: h.letterheadTemplate ?? '',
            prescriptionHeader: h.prescriptionHeader ?? '',
            prescriptionFooter: h.prescriptionFooter ?? '',
            logoUrl: h.logoUrl ?? '',
            faviconUrl: h.faviconUrl ?? '',
          };

          Object.entries(fields).forEach(([k, v]) => setValue(k as keyof IdentityForm, v as any));
        }
      })
      .catch(() => {});
  }, [setValue]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'faviconUrl') => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validation: 2MB max
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new (window as any).Image();
        img.onload = () => {
          // Validation: Min dimensions for logo (512x512 recommended, but let's check min)
          if (field === 'logoUrl' && (img.width < 100 || img.height < 100)) {
            toast.warning('Logo dimensions seem too small for high-quality printing.');
          }
          setValue(field, reader.result as string);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    },
    [setValue],
  );

  // Auto-save draft every 30s
  const formValues = watch();
  useEffect(() => {
    clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formValues));
    }, 30000);
    return () => clearTimeout(autosaveRef.current);
  }, [formValues]);

  const onSubmit = async (data: IdentityForm) => {
    setSaveState('saving');
    try {
      const res = await fetch('/api/hospital/identity', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || 'Save failed');
      }
      localStorage.removeItem(DRAFT_KEY);
      setSaveState('saved');
      toast.success('Hospital identity saved successfully!');
      setTimeout(() => {
        router.push('/hospital/dashboard/setup');
      }, 1000);
    } catch (error) {
      setSaveState('error');
      const msg = error instanceof Error ? error.message : 'Save failed';
      toast.error(msg);
      setTimeout(() => setSaveState('idle'), 3000);
    }
  };

  const workingDays = watch('workingDays');
  const toggleDay = (day: string) => {
    const current = workingDays ?? [];
    setValue(
      'workingDays',
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day],
    );
  };

  const nextStep = async () => {
    // Trigger validation for Step 1 fields
    const fieldsToValidate: (keyof IdentityForm)[] = [
      'legalName',
      'displayName',
      'contactNumber',
      'addressLine1',
      'city',
      'state',
      'pincode',
    ];
    if (watch('hospitalType') === 'CORPORATE') fieldsToValidate.push('cinNumber');

    const result = await trigger(fieldsToValidate);
    if (result) setStep(2);
    else toast.error('Please fix the errors in Step 1 before proceeding.');
  };

  return (
    <div className="max-w-3xl mx-auto p-6 min-h-screen pb-24">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
            <Hospital className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hospital Identity</h1>
            <p className="text-sm text-slate-500 font-medium">
              Configure your core clinical profile and branding
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setStep(1)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${step === 1 ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            1. Core Identity
          </button>
          <button
            onClick={nextStep}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${step === 2 ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            2. Branding
          </button>
        </div>
      </div>

      {/* Save Banner */}
      {saveState !== 'idle' && (
        <div
          className={`flex items-center gap-3 px-5 py-4 rounded-2xl mb-6 text-sm font-semibold shadow-sm border
            ${saveState === 'saving' ? 'bg-blue-50 text-blue-700 border-blue-100' : saveState === 'saved' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}
        >
          {saveState === 'saving' && <Loader2 className="h-5 w-5 animate-spin" />}
          {saveState === 'saved' && <CheckCircle className="h-5 w-5" />}
          {saveState === 'error' && <AlertCircle className="h-5 w-5" />}
          {saveState === 'saving'
            ? 'Saving hospital data...'
            : saveState === 'saved'
              ? 'Identity saved successfully!'
              : 'Error saving data. Please check your connection.'}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        {step === 1 ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Section A — Basic Details */}
            <Section title="Basic Details" icon={Hospital}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mt-3">
                <Field
                  label="Legal Name"
                  required
                  error={errors.legalName?.message}
                  hint="As per registration"
                >
                  <Input
                    {...register('legalName')}
                    placeholder="Apollo Hospitals Enterprise Ltd"
                    className="h-10 text-sm"
                  />
                </Field>
                <Field
                  label="Display Name"
                  required
                  error={errors.displayName?.message}
                  hint="Used on prescriptions"
                >
                  <Input
                    {...register('displayName')}
                    placeholder="Apollo Hospital, Bannerghatta"
                    className="h-10 text-sm"
                  />
                </Field>
                <Field label="Hospital Type" required error={errors.hospitalType?.message}>
                  <select
                    {...register('hospitalType')}
                    suppressHydrationWarning
                    className="w-full px-3 h-10 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {HOSPITAL_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </Field>
                {watch('hospitalType') === 'CORPORATE' && (
                  <Field
                    label="CIN Number"
                    required
                    error={errors.cinNumber?.message}
                    hint="Corporate Identity Number"
                  >
                    <Input
                      {...register('cinNumber')}
                      placeholder="U85110KA1983PLC005230"
                      className="font-mono h-10 text-sm"
                    />
                  </Field>
                )}
              </div>
            </Section>

            {/* Section B — Contact Information */}
            <Section title="Contact Information" icon={Phone}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mt-3">
                <Field
                  label="Primary Contact Number"
                  required
                  error={errors.contactNumber?.message}
                >
                  <Input
                    {...register('contactNumber')}
                    placeholder="+91 98765 43210"
                    className="h-10 text-sm"
                  />
                </Field>
                <Field label="Official Email" error={errors.officialEmail?.message}>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      {...register('officialEmail')}
                      placeholder="info@hospital.com"
                      className="pl-9 h-10 text-sm"
                    />
                  </div>
                </Field>
                <Field label="Emergency Contact" error={errors.emergencyContact?.message}>
                  <Input
                    {...register('emergencyContact')}
                    placeholder="+91 98765 00000"
                    className="h-10 text-sm"
                  />
                </Field>
                <Field label="Website (Optional)">
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input placeholder="https://www.hospital.com" className="pl-9 h-10 text-sm" />
                  </div>
                </Field>
              </div>
            </Section>

            {/* Section C — Address & Location */}
            <Section title="Address & Location" icon={MapPin}>
              <div className="space-y-4 mt-3">
                <Field label="Address Line 1" required error={errors.addressLine1?.message}>
                  <Input
                    {...register('addressLine1')}
                    placeholder="Building No, Street Name"
                    className="h-10 text-sm"
                  />
                </Field>
                <Field label="Address Line 2 (Optional)">
                  <Input
                    {...register('addressLine2')}
                    placeholder="Landmark, Area"
                    className="h-10 text-sm"
                  />
                </Field>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Field label="City" required error={errors.city?.message}>
                    <Input {...register('city')} placeholder="Bangalore" className="h-10 text-sm" />
                  </Field>
                  <Field label="State" required error={errors.state?.message}>
                    <Input
                      {...register('state')}
                      placeholder="Karnataka"
                      className="h-10 text-sm"
                    />
                  </Field>
                  <Field label="Pincode" required error={errors.pincode?.message}>
                    <Input
                      {...register('pincode')}
                      placeholder="560076"
                      maxLength={6}
                      className="h-10 text-sm font-mono"
                    />
                  </Field>
                </div>
              </div>
            </Section>

            {/* Section D — Compliance */}
            <Section title="Compliance & Registration" icon={Shield}>
              <div className="mt-3 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <Field
                    label="State Registration Number"
                    error={errors.stateRegistrationNumber?.message}
                  >
                    <Input
                      {...register('stateRegistrationNumber')}
                      placeholder="MH-HOSP-2024-XXXXX"
                      className="h-10 text-sm"
                    />
                  </Field>
                  <Field
                    label="Master Registration Number"
                    error={errors.registrationNumber?.message}
                  >
                    <Input
                      {...register('registrationNumber')}
                      placeholder="HOSP-CORE-ID-123"
                      className="h-10 text-sm"
                    />
                  </Field>
                  <Field label="GST Number" error={errors.gstNumber?.message}>
                    <Input
                      {...register('gstNumber')}
                      placeholder="29ABCDE1234F1Z5"
                      className="font-mono h-10 text-sm"
                      maxLength={15}
                    />
                  </Field>
                  <Field label="PAN Number" error={errors.panNumber?.message}>
                    <Input
                      {...register('panNumber')}
                      placeholder="ABCDE1234F"
                      className="font-mono h-10 text-sm"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-xs font-bold text-slate-800">NABH Accredited</p>
                      <p className="text-[10px] text-slate-500">Quality health standards</p>
                    </div>
                    <Switch
                      checked={watch('nabhAccredited')}
                      onCheckedChange={(v) => setValue('nabhAccredited', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-xs font-bold text-slate-800">NABL Accredited</p>
                      <p className="text-[10px] text-slate-500">Laboratory standards</p>
                    </div>
                    <Switch
                      checked={watch('nablAccredited')}
                      onCheckedChange={(v) => setValue('nablAccredited', v)}
                    />
                  </div>
                </div>
              </div>
            </Section>

            <div className="pt-4">
              <Button
                type="button"
                onClick={nextStep}
                className="w-full py-6 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl flex items-center justify-center gap-2 group transition-all"
              >
                Continue to Branding{' '}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-6">
            {/* Branding Section */}
            <Section title="Visual Identity" icon={Palette}>
              <div className="space-y-6 mt-4">
                <Field label="Hospital Logo" hint="Max 2MB, Min 512x512 recommended">
                  <div className="flex items-center gap-6">
                    <div className="relative h-24 w-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group">
                      {watch('logoUrl') ? (
                        <Image
                          src={watch('logoUrl') || ''}
                          alt="Logo"
                          fill
                          className="object-contain p-2"
                          unoptimized
                        />
                      ) : (
                        <Hospital className="h-8 w-8 text-slate-300" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                      <Input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml"
                        onChange={(e) => handleFileUpload(e, 'logoUrl')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                        Upload your official logo. This will appear on prescriptions, invoices, and
                        the patient portal.
                      </p>
                      {watch('logoUrl') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setValue('logoUrl', '')}
                          className="text-red-500 h-7 text-[10px] font-bold px-2"
                        >
                          Remove Logo
                        </Button>
                      )}
                    </div>
                  </div>
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Favicon (Tab Icon)" hint="32x32px .ico or .png">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden">
                        {watch('faviconUrl') ? (
                          <Image
                            src={watch('faviconUrl') || ''}
                            alt="Favicon"
                            fill
                            className="object-contain p-1"
                            unoptimized
                          />
                        ) : (
                          <Upload className="h-4 w-4 text-slate-300" />
                        )}
                        <Input
                          type="file"
                          accept="image/x-icon,image/png"
                          onChange={(e) => handleFileUpload(e, 'faviconUrl')}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">Browser tab icon</p>
                    </div>
                  </Field>

                  <Field label="Brand Color">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                        <input
                          type="color"
                          {...register('brandColor')}
                          className="absolute -inset-2 h-14 w-14 cursor-pointer"
                        />
                      </div>
                      <Input
                        {...register('brandColor')}
                        placeholder="#2563eb"
                        className="font-mono h-10 text-sm flex-1"
                      />
                    </div>
                  </Field>
                </div>
              </div>
            </Section>

            {/* Operational Section */}
            <Section title="Operational Context" icon={Clock}>
              <div className="mt-3 space-y-5">
                <Field label="Timezone">
                  <select
                    {...register('timezone')}
                    suppressHydrationWarning
                    className="w-full px-3 h-10 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Working Days">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {DAYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all
                          ${
                            workingDays?.includes(day)
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                              : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                          }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-6">
                  <Field label="Opening Time" error={errors.openTime?.message}>
                    <Input type="time" {...register('openTime')} className="h-10" />
                  </Field>
                  <Field label="Closing Time" error={errors.closeTime?.message}>
                    <Input type="time" {...register('closeTime')} className="h-10" />
                  </Field>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Multi-Branch Platform</p>
                    <p className="text-[10px] text-slate-500">
                      Enable if you have multiple clinics/campuses
                    </p>
                  </div>
                  <Switch
                    checked={watch('isMultiBranch')}
                    onCheckedChange={(v) => setValue('isMultiBranch', v)}
                  />
                </div>
              </div>
            </Section>

            {/* Branding templates */}
            <Section title="Clinical Branding Templates" icon={Palette} defaultOpen={false}>
              <div className="mt-3 space-y-4">
                <Field
                  label="Letterhead Template (HTML)"
                  hint="Use {{hospital_name}}, {{doctor_name}}"
                >
                  <textarea
                    {...register('letterheadTemplate')}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y bg-slate-50/50"
                    placeholder="<div style='text-align:center;'><h1>{{hospital_name}}</h1></div>"
                  />
                </Field>
                <Field label="Prescription Header">
                  <textarea
                    {...register('prescriptionHeader')}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y bg-slate-50/50"
                    placeholder="Dr. {{doctor_name}} | {{speciality}}"
                  />
                </Field>
                <Field label="Prescription Footer">
                  <textarea
                    {...register('prescriptionFooter')}
                    rows={2}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y bg-slate-50/50"
                    placeholder="Valid for 30 days. Emergency: {{hospital_phone}}"
                  />
                </Field>
              </div>
            </Section>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="py-6 border-slate-200 text-slate-600 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Step 1
              </Button>
              <Button
                type="submit"
                disabled={saveState === 'saving'}
                suppressHydrationWarning
                className="py-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center gap-2"
              >
                {saveState === 'saving' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Finalize Identity
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

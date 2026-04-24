"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Hospital, Shield, Clock, Palette, ChevronDown, ChevronUp,
  Save, CheckCircle, AlertCircle, Upload, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

// ─── Schema ────────────────────────────────────────────────────────────────────

const identitySchema = z.object({
  legalName: z.string().min(2, "Legal name required"),
  displayName: z.string().min(2, "Display name required"),
  hospitalType: z.enum(["CLINIC", "NURSING_HOME", "MULTISPECIALTY", "CORPORATE"]),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be hex color").optional().or(z.literal("")),
  stateRegistrationNumber: z.string().optional(),
  gstNumber: z.string().optional().refine((v) => !v || v.length === 15, "GST must be 15 chars"),
  panNumber: z.string().optional(),
  nabhAccredited: z.boolean().default(false),
  nablAccredited: z.boolean().default(false),
  timezone: z.string().default("Asia/Kolkata"),
  workingDays: z.array(z.string()).default(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  emergencyContact: z.string().optional(),
  isMultiBranch: z.boolean().default(false),
  letterheadTemplate: z.string().optional(),
  prescriptionHeader: z.string().optional(),
  prescriptionFooter: z.string().optional(),
});

type IdentityForm = z.infer<typeof identitySchema>;

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIMEZONES = ["Asia/Kolkata", "Asia/Colombo", "Asia/Dhaka", "Asia/Kathmandu"];
const HOSPITAL_TYPES = [
  { value: "CLINIC", label: "Clinic" },
  { value: "NURSING_HOME", label: "Nursing Home" },
  { value: "MULTISPECIALTY", label: "Multispecialty Hospital" },
  { value: "CORPORATE", label: "Corporate Hospital" },
];

// ─── Collapsible Section ───────────────────────────────────────────────────────

function Section({
  title, icon: Icon, children, defaultOpen = true,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Icon className="h-4 w-4 text-blue-600" />
          </div>
          <span className="font-semibold text-slate-800 text-sm">{title}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1 border-t border-slate-100">{children}</div>}
    </div>
  );
}

// ─── Field Component ───────────────────────────────────────────────────────────

function Field({ label, error, children, required }: { label: string; error?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function HospitalIdentityPage() {
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const autosaveRef = useRef<ReturnType<typeof setTimeout>>();
  const DRAFT_KEY = "identity_draft";

  const form = useForm<IdentityForm>({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      legalName: "",
      displayName: "",
      hospitalType: "MULTISPECIALTY",
      brandColor: "#2563eb",
      nabhAccredited: false,
      nablAccredited: false,
      timezone: "Asia/Kolkata",
      workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      isMultiBranch: false,
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;

  // Load existing data
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const d = JSON.parse(draft);
        Object.entries(d).forEach(([k, v]) => setValue(k as keyof IdentityForm, v as string));
      } catch {}
    }

    fetch("/api/hospital/identity")
      .then((r) => r.json())
      .then((data) => {
        if (data.hospital) {
          const h = data.hospital;
          const fields: Partial<IdentityForm> = {
            legalName: h.legalName ?? "",
            displayName: h.displayName ?? "",
            hospitalType: h.hospitalType ?? "MULTISPECIALTY",
            brandColor: h.brandColor ?? "#2563eb",
            stateRegistrationNumber: h.stateRegistrationNumber ?? "",
            gstNumber: h.gstNumber ?? "",
            panNumber: h.panNumber ?? "",
            nabhAccredited: h.nabhAccredited ?? false,
            nablAccredited: h.nablAccredited ?? false,
            timezone: h.timezone ?? "Asia/Kolkata",
            workingDays: h.workingDays?.length ? h.workingDays : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            openTime: h.openTime ?? "",
            closeTime: h.closeTime ?? "",
            emergencyContact: h.emergencyContact ?? "",
            isMultiBranch: h.isMultiBranch ?? false,
            letterheadTemplate: h.letterheadTemplate ?? "",
            prescriptionHeader: h.prescriptionHeader ?? "",
            prescriptionFooter: h.prescriptionFooter ?? "",
          };
          Object.entries(fields).forEach(([k, v]) => setValue(k as keyof IdentityForm, v as string));
        }
      })
      .catch(() => {});
  }, [setValue]);

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
    setSaveState("saving");
    try {
      const res = await fetch("/api/hospital/identity", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Save failed");
      localStorage.removeItem(DRAFT_KEY);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 3000);
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  };

  const workingDays = watch("workingDays");
  const toggleDay = (day: string) => {
    const current = workingDays ?? [];
    setValue("workingDays", current.includes(day) ? current.filter((d) => d !== day) : [...current, day]);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-blue-50 rounded-xl">
            <Hospital className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Hospital Identity</h1>
            <p className="text-xs text-slate-500">Configure your hospital profile, compliance, and branding</p>
          </div>
        </div>
      </div>

      {/* Save Banner */}
      {saveState !== "idle" && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm font-medium
            ${saveState === "saving" ? "bg-blue-50 text-blue-700" : saveState === "saved" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
        >
          {saveState === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
          {saveState === "saved" && <CheckCircle className="h-4 w-4" />}
          {saveState === "error" && <AlertCircle className="h-4 w-4" />}
          {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved successfully!" : "Save failed. Please try again."}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Section 1 — Basic Identity */}
        <Section title="Basic Identity" icon={Hospital}>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <Field label="Legal Name" required error={errors.legalName?.message}>
              <Input {...register("legalName")} placeholder="Apollo Hospitals Pvt Ltd" />
            </Field>
            <Field label="Display Name" required error={errors.displayName?.message}>
              <Input {...register("displayName")} placeholder="Apollo Hospital" />
            </Field>
          </div>
          <Field label="Hospital Type" error={errors.hospitalType?.message}>
            <select
              {...register("hospitalType")}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {HOSPITAL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Brand Color">
            <div className="flex items-center gap-3">
              <input
                type="color"
                {...register("brandColor")}
                className="h-9 w-16 rounded-lg cursor-pointer border border-slate-200"
              />
              <Input {...register("brandColor")} placeholder="#2563eb" className="font-mono" />
            </div>
          </Field>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Upload className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-500">Logo & Favicon upload — connect cloud storage to enable</span>
          </div>
        </Section>

        {/* Section 2 — Compliance */}
        <Section title="Compliance & Registration" icon={Shield} defaultOpen={false}>
          <div className="mt-3 space-y-3">
            <Field label="State Registration Number" error={errors.stateRegistrationNumber?.message}>
              <Input {...register("stateRegistrationNumber")} placeholder="MH-HOSP-2024-XXXXX" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="GST Number" error={errors.gstNumber?.message}>
                <Input {...register("gstNumber")} placeholder="29ABCDE1234F1Z5" className="font-mono" maxLength={15} />
              </Field>
              <Field label="PAN Number" error={errors.panNumber?.message}>
                <Input {...register("panNumber")} placeholder="ABCDE1234F" className="font-mono" />
              </Field>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-xs font-semibold text-slate-700">NABH Accredited</p>
                <p className="text-xs text-slate-400">National Accreditation Board</p>
              </div>
              <Switch
                checked={watch("nabhAccredited")}
                onCheckedChange={(v) => setValue("nabhAccredited", v)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-xs font-semibold text-slate-700">NABL Accredited</p>
                <p className="text-xs text-slate-400">National Accreditation Board for Labs</p>
              </div>
              <Switch
                checked={watch("nablAccredited")}
                onCheckedChange={(v) => setValue("nablAccredited", v)}
              />
            </div>
          </div>
        </Section>

        {/* Section 3 — Operational */}
        <Section title="Operational Settings" icon={Clock} defaultOpen={false}>
          <div className="mt-3 space-y-3">
            <Field label="Timezone">
              <select
                {...register("timezone")}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                      ${workingDays?.includes(day)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Opening Time">
                <Input type="time" {...register("openTime")} />
              </Field>
              <Field label="Closing Time">
                <Input type="time" {...register("closeTime")} />
              </Field>
            </div>
            <Field label="Emergency Contact">
              <Input type="tel" {...register("emergencyContact")} placeholder="+91 98765 43210" />
            </Field>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-xs font-semibold text-slate-700">Multi-Branch Hospital</p>
                <p className="text-xs text-slate-400">Enable to manage multiple locations</p>
              </div>
              <Switch
                checked={watch("isMultiBranch")}
                onCheckedChange={(v) => setValue("isMultiBranch", v)}
              />
            </div>
          </div>
        </Section>

        {/* Section 4 — Branding */}
        <Section title="Prescription & Branding Templates" icon={Palette} defaultOpen={false}>
          <div className="mt-3 space-y-3">
            <Field label="Letterhead Template (HTML)">
              <textarea
                {...register("letterheadTemplate")}
                rows={4}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder="<div>{{hospital_name}}</div> Use {{doctor_name}}, {{date}}, {{patient_name}} variables"
              />
            </Field>
            <Field label="Prescription Header">
              <textarea
                {...register("prescriptionHeader")}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder="Dr. {{doctor_name}} | {{hospital_name}}"
              />
            </Field>
            <Field label="Prescription Footer">
              <textarea
                {...register("prescriptionFooter")}
                rows={2}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder="This prescription is valid for 30 days. {{hospital_phone}}"
              />
            </Field>
          </div>
        </Section>

        {/* Save Button */}
        <Button
          type="submit"
          disabled={saveState === "saving"}
          className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-200"
        >
          {saveState === "saving" ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
          ) : (
            <><Save className="h-4 w-4 mr-2" /> Save Hospital Identity</>
          )}
        </Button>
      </form>
    </div>
  );
}

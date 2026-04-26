"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hospital, Users, Stethoscope, Calendar, ClipboardList,
  BedDouble, CreditCard, Pill, TestTube, Bell, Plug,
  RefreshCw, Store, CheckCircle2, Clock, Lock,
  AlertTriangle, ChevronRight, ArrowRight, Settings, MapPin,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ─── Step Definitions ─────────────────────────────────────────────────────────

const STEPS = [
  {
    id: "identity",
    title: "Hospital Identity",
    subtitle: "Legal name, logo, branding, compliance",
    icon: Hospital,
    href: "/hospital/dashboard/setup/identity",
    weight: 2,
    critical: true,
    depends: [],
    warning: "No identity configured → compliance and invoicing risk",
  },
  {
    id: "branches",
    title: "Multi-Branch Support",
    subtitle: "Satellite clinics, campuses, locations",
    icon: MapPin,
    href: "/hospital/dashboard/setup/branches",
    weight: 0.5,
    critical: false,
    depends: ["identity"],
    warning: "No branches configured → only main campus active",
  },
  {
    id: "departments",
    title: "Departments & Units",
    subtitle: "OPD, IPD, ICU, OT and sub-units",
    icon: ClipboardList,
    href: "/hospital/dashboard/setup/departments",
    weight: 1,
    critical: false,
    depends: ["identity"],
    warning: "No departments → doctors cannot be assigned",
  },
  {
    id: "staff",
    title: "Staff & Roles",
    subtitle: "RBAC, permissions, invite team",
    icon: Users,
    href: "/hospital/dashboard/setup/staff",
    weight: 2,
    critical: true,
    depends: ["identity"],
    warning: "No staff configured → system cannot operate",
  },
  {
    id: "doctors",
    title: "Doctor Configuration",
    subtitle: "Fees, slots, specialities, marketplace",
    icon: Stethoscope,
    href: "/hospital/dashboard/setup/doctors",
    weight: 2,
    critical: true,
    depends: ["departments", "staff"],
    warning: "No doctors configured → OPD bookings will fail",
  },
  {
    id: "opd",
    title: "OPD Workflow",
    subtitle: "Token system, queue, overbooking rules",
    icon: Calendar,
    href: "/hospital/dashboard/setup/opd",
    weight: 1,
    critical: false,
    depends: ["doctors"],
    warning: "OPD workflow unconfigured → front desk impaired",
  },
  {
    id: "ipd",
    title: "IPD / Ward Setup",
    subtitle: "Beds, wards, admission workflow",
    icon: BedDouble,
    href: "/hospital/dashboard/setup/wards",
    weight: 1,
    critical: false,
    depends: ["departments"],
    warning: "No beds configured → IPD admissions not possible",
  },
  {
    id: "billing",
    title: "Billing System",
    subtitle: "Service catalog, GST, payment gateways",
    icon: CreditCard,
    href: "/hospital/dashboard/setup/billing",
    weight: 2,
    critical: true,
    depends: ["identity"],
    warning: "No billing configured → revenue loss risk",
  },
  {
    id: "pharmacy",
    title: "Pharmacy Setup",
    subtitle: "Drug catalog, stock, dispensing rules",
    icon: Pill,
    href: "/hospital/dashboard/setup/pharmacy",
    weight: 1,
    critical: false,
    depends: ["billing"],
    warning: "No pharmacy → in-house dispensing unavailable",
  },
  {
    id: "diagnostics",
    title: "Diagnostics Setup",
    subtitle: "Lab tests, imaging, pricing",
    icon: TestTube,
    href: "/hospital/dashboard/setup/diagnostics",
    weight: 1,
    critical: false,
    depends: ["billing"],
    warning: "No diagnostics priced → lab revenue inactive",
  },
  {
    id: "notifications",
    title: "Notification Engine",
    subtitle: "WhatsApp, SMS, email templates",
    icon: Bell,
    href: "/hospital/dashboard/setup/notifications",
    weight: 1,
    critical: false,
    depends: ["identity"],
    warning: "No notifications → patient engagement disabled",
  },
  {
    id: "integrations",
    title: "Integration Layer",
    subtitle: "Razorpay, WhatsApp API, ABHA, Google",
    icon: Plug,
    href: "/hospital/dashboard/setup/integrations",
    weight: 1,
    critical: false,
    depends: ["billing"],
    warning: "No integrations → payment and messaging unavailable",
  },
  {
    id: "retention",
    title: "Retention Engine",
    subtitle: "Follow-up rules, chronic tracking, AI recall",
    icon: RefreshCw,
    href: "/hospital/dashboard/setup/retention",
    weight: 0.5,
    critical: false,
    depends: ["notifications"],
    warning: "No retention rules → patient recall revenue uncaptured",
  },
  {
    id: "marketplace",
    title: "Marketplace Setup",
    subtitle: "Public listing on Haspataal.in",
    icon: Store,
    href: "/hospital/dashboard/setup/marketplace",
    weight: 0.5,
    critical: false,
    depends: ["identity", "doctors"],
    warning: "Not listed → missing patient acquisition channel",
  },
  {
    id: "activation",
    title: "Final Review & Activation",
    subtitle: "Validate critical setup and activate production workflows",
    icon: CheckCircle2,
    href: "/hospital/dashboard/setup",
    weight: 1,
    critical: true,
    depends: ["identity", "staff", "doctors", "opd", "billing"],
    warning: "Activation blocked until critical configuration is complete",
  },
];

type StepState = "complete" | "in_progress" | "locked";

// ─── Weighted Completion ───────────────────────────────────────────────────────

function computeWeightedScore(completion: Record<string, boolean>): number {
  const totalWeight = STEPS.reduce((s, step) => s + step.weight, 0);
  const earned = STEPS.reduce((s, step) => s + (completion[step.id] ? step.weight : 0), 0);
  return Math.round((earned / totalWeight) * 100);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SetupWizardPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<string>(STEPS[0].id);
  const [completion, setCompletion] = useState<Record<string, boolean>>({});
  const [serverWarnings, setServerWarnings] = useState<Record<string, string[]>>({});
  const [activationError, setActivationError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load real completion from server
  useEffect(() => {
    fetch("/api/hospital/setup/completion")
      .then((r) => r.json())
      .then((data) => {
        if (data.stepStatuses) {
          const map: Record<string, boolean> = {};
          const warnings: Record<string, string[]> = {};
          for (const [id, status] of Object.entries(data.stepStatuses as Record<string, { complete: boolean; warnings?: string[] }>)) {
            map[id] = status.complete;
            warnings[id] = status.warnings ?? [];
          }
          setCompletion(map);
          setServerWarnings(warnings);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const weightedScore = computeWeightedScore(completion);

  const getStepState = useCallback(
    (step: (typeof STEPS)[number]): StepState => {
      if (completion[step.id]) return "complete";
      const depsComplete = step.depends.every((dep) => completion[dep]);
      if (!depsComplete) return "locked";
      return "in_progress";
    },
    [completion]
  );

  const activeStepDef = STEPS.find((s) => s.id === activeStep) ?? STEPS[0];
  const activeState = getStepState(activeStepDef);

  const criticalWarnings = STEPS.filter(
    (s) => s.critical && !completion[s.id]
  );

  const progressColor =
    weightedScore >= 80 ? "#22c55e" : weightedScore >= 50 ? "#f59e0b" : "#ef4444";

  const handleConfigure = async () => {
    setActivationError("");
    if (activeStepDef.id !== "activation") {
      router.push(activeStepDef.href);
      return;
    }

    const response = await fetch("/api/hospital/setup/activate", { method: "POST" });
    const data = await response.json();
    if (!response.ok) {
      const missing = Array.isArray(data.missing) ? data.missing.join(", ") : "critical steps";
      const security = Array.isArray(data.security) && data.security.length ? ` ${data.security.join(", ")}` : "";
      setActivationError(`Activation blocked: ${missing}.${security}`);
      return;
    }

    setCompletion((current) => ({ ...current, activation: true }));
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ── Sidebar Stepper ── */}
      <aside className="w-72 flex-shrink-0 sticky top-0 h-screen bg-white border-r border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="h-5 w-5 text-blue-600" />
            <h1 className="text-base font-bold text-slate-900">Setup Wizard</h1>
          </div>
          <p className="text-xs text-slate-500">Configure your HMS in 14 steps</p>
        </div>

        {/* Weighted Progress */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-600">Overall Completion</span>
            <span
              className="text-sm font-bold"
              style={{ color: progressColor }}
            >
              {isLoading ? "..." : `${weightedScore}%`}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{ width: `${weightedScore}%`, background: progressColor }}
            />
          </div>
          <div className="flex gap-3 mt-2">
            <span className="text-xs text-slate-400">
              {STEPS.filter((s) => completion[s.id]).length}/{STEPS.length} steps
            </span>
            {criticalWarnings.length > 0 && (
              <span className="text-xs font-medium text-red-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {criticalWarnings.length} critical
              </span>
            )}
          </div>
        </div>

        {/* Steps List */}
        <nav className="flex-1 overflow-y-auto py-2">
          {STEPS.map((step, idx) => {
            const state = getStepState(step);
            const isActive = activeStep === step.id;
            const Icon = step.icon;
            return (
              <button
                key={step.id}
                onClick={() => {
                  if (state !== "locked") setActiveStep(step.id);
                }}
                disabled={state === "locked"}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all group
                  ${isActive ? "bg-blue-50 border-r-2 border-blue-500" : "hover:bg-slate-50"}
                  ${state === "locked" ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {/* Step number / icon */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
                    ${state === "complete" ? "bg-green-100 text-green-700" : isActive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}
                >
                  {state === "complete" ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-semibold truncate
                        ${isActive ? "text-blue-700" : state === "complete" ? "text-green-700" : "text-slate-700"}`}
                    >
                      {step.title}
                    </span>
                    {step.critical && (
                      <span className="text-[9px] bg-red-100 text-red-600 font-bold px-1 rounded">CRITICAL</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {state === "complete" ? (
                      <Badge variant="default" className="text-[9px] px-1 py-0 bg-green-500">Complete</Badge>
                    ) : state === "locked" ? (
                      <span className="flex items-center gap-0.5 text-[9px] text-slate-400">
                        <Lock className="h-2.5 w-2.5" /> Locked
                      </span>
                    ) : (
                      <Badge variant="secondary" className="text-[9px] px-1 py-0">In Progress</Badge>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto">
        {/* Critical Warnings Banner */}
        {criticalWarnings.length > 0 && (
          <div className="m-6 mb-0 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-bold text-red-700">
                {criticalWarnings.length} Critical Configuration{criticalWarnings.length > 1 ? "s" : ""} Missing
              </span>
            </div>
            <ul className="space-y-1">
              {criticalWarnings.map((s) => (
                <li key={s.id} className="text-xs text-red-600 flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3" />
                  {s.warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Step Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
            >
              <StepContent
                step={activeStepDef}
                state={activeState}
                completion={completion}
                allSteps={STEPS}
                warnings={serverWarnings[activeStep] ?? []}
                activationError={activationError}
                onNavigate={(id) => setActiveStep(id)}
                onConfigure={handleConfigure}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ─── Step Content Panel ───────────────────────────────────────────────────────

function StepContent({
  step,
  state,
  completion,
  allSteps,
  warnings,
  activationError,
  onNavigate,
  onConfigure,
}: {
  step: (typeof STEPS)[number];
  state: StepState;
  completion: Record<string, boolean>;
  allSteps: typeof STEPS;
  warnings: string[];
  activationError: string;
  onNavigate: (id: string) => void;
  onConfigure: () => void;
}) {
  const Icon = step.icon;
  const lockedDeps = step.depends.filter((dep) => !completion[dep]);
  const nextSteps = allSteps.filter(
    (s) => s.depends.includes(step.id) && !completion[s.id]
  );

  const stateColors = {
    complete: { bg: "bg-green-50", border: "border-green-200", badge: "text-green-700 bg-green-100", icon: "text-green-600 bg-green-100" },
    in_progress: { bg: "bg-blue-50", border: "border-blue-200", badge: "text-blue-700 bg-blue-100", icon: "text-blue-600 bg-blue-100" },
    locked: { bg: "bg-slate-50", border: "border-slate-200", badge: "text-slate-500 bg-slate-100", icon: "text-slate-400 bg-slate-100" },
  };
  const colors = stateColors[state];

  return (
    <div className="max-w-2xl">
      {/* Header Card */}
      <div className={`rounded-2xl border-2 ${colors.border} ${colors.bg} p-6 mb-6`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${colors.icon}`}>
            <Icon className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-slate-900">{step.title}</h2>
              {step.critical && (
                <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">CRITICAL</span>
              )}
            </div>
            <p className="text-sm text-slate-500 mb-3">{step.subtitle}</p>
            <div className="flex items-center gap-2">
              {state === "complete" ? (
                <Badge className="bg-green-500 text-white">✓ Complete</Badge>
              ) : state === "locked" ? (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Locked
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1 border-blue-300 text-blue-600">
                  <Clock className="h-3 w-3" /> In Progress
                </Badge>
              )}
              <span className="text-xs text-slate-400">Weight: {step.weight}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Locked Dependencies */}
      {state === "locked" && lockedDeps.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">Complete these steps first:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lockedDeps.map((depId) => {
              const dep = allSteps.find((s) => s.id === depId);
              if (!dep) return null;
              return (
                <button
                  key={depId}
                  onClick={() => onNavigate(depId)}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-1"
                >
                  {dep.title} <ArrowRight className="h-3 w-3" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Warning (if not complete) */}
      {state !== "complete" && state !== "locked" && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-orange-700">{warnings[0] ?? step.warning}</span>
        </div>
      )}

      {activationError && step.id === "activation" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-red-700">{activationError}</span>
        </div>
      )}

      {/* CTA */}
      {state !== "locked" && (
        <Button
          onClick={onConfigure}
          className={`w-full py-6 text-sm font-semibold rounded-xl transition-all ${
            state === "complete"
              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
          }`}
        >
          {step.id === "activation" ? "Activate Hospital" : state === "complete" ? "Review & Update Configuration" : "Configure →"}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      )}

      {/* Next Unlocks */}
      {state === "complete" && nextSteps.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
            Completing this unlocks:
          </p>
          <div className="flex flex-wrap gap-2">
            {nextSteps.map((s) => {
              const SIcon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => onNavigate(s.id)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:border-blue-300 hover:text-blue-600 transition-all"
                >
                  <SIcon className="h-3.5 w-3.5" />
                  {s.title}
                  <ChevronRight className="h-3 w-3" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* All Steps Overview Grid */}
      <div className="mt-8">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">All Steps</h3>
        <div className="grid grid-cols-2 gap-2">
          {allSteps.map((s) => {
            const sState = s.depends.every((d) => completion[d])
              ? completion[s.id] ? "complete" : "in_progress"
              : "locked";
            const SIcon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => sState !== "locked" && onNavigate(s.id)}
                disabled={sState === "locked"}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all
                  ${s.id === step.id ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}
                  ${sState === "locked" ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0
                    ${sState === "complete" ? "bg-green-100" : sState === "locked" ? "bg-slate-100" : "bg-blue-100"}`}
                >
                  <SIcon
                    className={`h-3.5 w-3.5 ${sState === "complete" ? "text-green-600" : sState === "locked" ? "text-slate-400" : "text-blue-600"}`}
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 truncate">{s.title}</div>
                  <div className="text-[10px] text-slate-400">
                    {sState === "complete" ? "✓ Done" : sState === "locked" ? "Locked" : "Pending"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

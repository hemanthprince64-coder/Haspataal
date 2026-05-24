'use client';

import { Calendar, CreditCard, Clipboard, HelpCircle, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface WorkflowConfigProps {
  onNext: () => void;
  onPrev: () => void;
  label?: string;
}

export default function WorkflowConfig({
  onNext,
  onPrev,
  label = 'Workflow Configuration',
}: WorkflowConfigProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    appointmentFlow: 'token',
    avgDuration: 15,
    consultationFee: 500,
    followupDays: 7,
    allowOverbooking: true,
    invoicePrefix: 'INV',
    printHeader: 'Haspataal Standard Letterhead',
    printFooter: 'Thank you for choosing our clinic. For emergency services, contact 108.',
    emrTemplate: 'STANDARD_OPD',
  });

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/hospital/setup/workflow');
      if (res.ok) {
        const data = await res.json();
        if (data) setFormData(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hospital/setup/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Clinic workflow configuration saved successfully!');
      } else {
        toast.error('Failed to save workflow settings.');
      }
    } catch (e) {
      toast.error('An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStage = async () => {
    await handleSave();
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form options */}
        <div className="md:col-span-2 space-y-6">
          {/* Section 1: Appointment & Token Flow */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="h-5 w-5 text-teal-600" /> Patient Queue & Token settings
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">OPD Queue System</label>
                <select
                  value={formData.appointmentFlow}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, appointmentFlow: e.target.value }))
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500 bg-white"
                >
                  <option value="token">
                    Dynamic Token System (Recommended - first come first served)
                  </option>
                  <option value="time">Strict Time slots (e.g. 10:15 AM slots)</option>
                  <option value="walkin">Plain walk-in queue list</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Average Session duration
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={formData.avgDuration}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          avgDuration: parseInt(e.target.value) || 15,
                        }))
                      }
                      className="rounded-xl border-slate-200"
                    />
                    <span className="text-xs text-slate-500 font-medium shrink-0">Mins</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Allow Overbooking?</label>
                  <select
                    value={String(formData.allowOverbooking)}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        allowOverbooking: e.target.value === 'true',
                      }))
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500 bg-white"
                  >
                    <option value="true">Yes, queue can overflow</option>
                    <option value="false">No, block booking when full</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Billing & Payout window */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="h-5 w-5 text-teal-600" /> Revenue & Billing preferences
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Default Consultation Fee
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-400">₹</span>
                  <Input
                    type="number"
                    value={formData.consultationFee}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        consultationFee: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="rounded-xl border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Follow-up Validity window
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={formData.followupDays}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        followupDays: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="rounded-xl border-slate-200"
                  />
                  <span className="text-xs text-slate-500 font-medium shrink-0">Days</span>
                </div>
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-sm font-semibold text-slate-700">Invoice prefix tag</label>
                <Input
                  type="text"
                  value={formData.invoicePrefix}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      invoicePrefix: e.target.value.toUpperCase(),
                    }))
                  }
                  className="rounded-xl border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Prescription Printing Layouts */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clipboard className="h-5 w-5 text-teal-600" /> Letterhead & Prescription Printing
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Prescription Header styling
                </label>
                <Input
                  type="text"
                  value={formData.printHeader}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, printHeader: e.target.value }))
                  }
                  className="rounded-xl border-slate-200"
                  placeholder="Hospital Legal name + specialization tags"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Prescription Footer / Disclaimers
                </label>
                <textarea
                  value={formData.printFooter}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, printFooter: e.target.value }))
                  }
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-500 bg-white"
                  placeholder="Standard clinical guidance disclaimers"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Default EMR Writing template
                </label>
                <select
                  value={formData.emrTemplate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, emrTemplate: e.target.value }))
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500 bg-white"
                >
                  <option value="STANDARD_OPD">
                    Standard OPD (Symptoms → Vitals → Diagnosis → Rx)
                  </option>
                  <option value="PEDIATRIC">
                    Pediatrics specialize (Growth charts + immunization alerts)
                  </option>
                  <option value="GYNAECOLOGY">Obstetrics / ANC tracker</option>
                  <option value="CARDIOLOGY">Cardiology core timeline</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Preview / Help */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
            <h3 className="font-bold text-sm text-teal-400 mb-3 tracking-wide uppercase">
              Operational Intelligence
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed mb-4">
              Your workflow setup details establish how the platform automates notifications.
              Choosing <strong>7 days follow-up</strong> tells Haspataal's recall engine to alert
              patients on Day 6 to schedule their free visit if needed.
            </p>
            <div className="border-t border-slate-800 pt-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Recall Trigger:</span>
                <span className="font-semibold text-emerald-400">WhatsApp Alert</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment node:</span>
                <span className="font-semibold text-emerald-400">Standard UPI QR</span>
              </div>
            </div>
          </div>

          {/* Setup controls */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 py-5"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}{' '}
              Save Settings
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onPrev}
                className="flex-1 rounded-xl border-slate-300 font-bold"
              >
                Back
              </Button>
              <Button
                onClick={handleNextStage}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
              >
                Next Stage
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

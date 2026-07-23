'use client';

import {
  ChevronRight,
  ChevronLeft,
  Check,
  Settings,
  Calendar,
  Pill,
  FlaskConical,
  AlertCircle,
  Users,
  Shield,
  Bell,
  Printer,
  Rocket,
  Baby,
} from 'lucide-react';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const STEPS = [
  { id: 'protocol', label: 'ANC Protocol', icon: Settings, desc: 'Select visit frequency' },
  { id: 'schedule', label: 'Visit Schedule', icon: Calendar, desc: 'Auto-populate dates' },
  { id: 'supplements', label: 'Supplements', icon: Pill, desc: 'IFA, Calcium, TT' },
  { id: 'labs', label: 'Lab Schedule', icon: FlaskConical, desc: 'ANC investigations' },
  { id: 'highrisk', label: 'High-Risk Rules', icon: AlertCircle, desc: 'Alert criteria' },
  { id: 'asha', label: 'ASHA Assignment', icon: Users, desc: 'Link frontline workers' },
  { id: 'schemes', label: 'Schemes', icon: Shield, desc: 'JSY/PMMVY auto-check' },
  { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'SMS/WhatsApp templates' },
  { id: 'print', label: 'Print Templates', icon: Printer, desc: 'MCP card & referral slips' },
  { id: 'activate', label: 'Activate', icon: Rocket, desc: 'Generate care plan' },
];

export default function FollowUpWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    protocol: 'WHO_4',
    customVisits: 4,
    supplements: { ifa: true, calcium: true, folicAcid: true, tt: true },
    labs: { hbEveryVisit: true, vdrlOnce: true, hivOnce: true, dipsiGdm: true },
    highRiskRules: {
      age: true,
      height: true,
      bmi: true,
      gravida: true,
      previousComplications: true,
      rhNegative: true,
    },
    ashaAssignment: 'pincode',
    schemes: { jsy: true, pmmvy: true },
    notificationLanguage: 'hi',
    printFormat: 'thermal_80mm',
  });

  const updateField = (key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const StepIcon = STEPS[currentStep].icon;

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">
          ANC Follow-Up Setup
        </h1>
        <p className="text-slate-500 font-medium">
          Configure your hospital's Antenatal Care protocol
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center gap-1 shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  idx <= currentStep ? 'bg-pink-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`w-4 h-0.5 ${idx < currentStep ? 'bg-pink-600' : 'bg-slate-200'}`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className="bg-pink-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <Card className="rounded-2xl shadow-xl border-slate-200/60 mb-8">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600">
              <StepIcon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-black tracking-tight">
                {STEPS[currentStep].label}
              </CardTitle>
              <CardDescription className="text-slate-500 font-medium">
                {STEPS[currentStep].desc}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {currentStep === 0 && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-slate-800">Select ANC Protocol</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'WHO_4', label: 'WHO Standard', desc: '4 visits minimum' },
                  { id: 'WHO_8', label: 'WHO Extended', desc: '8 visits (high-risk)' },
                  { id: 'CUSTOM', label: 'Custom', desc: 'Define your own' },
                ].map((p) => (
                  <div
                    key={p.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.protocol === p.id ? 'border-pink-500 bg-pink-50' : 'border-slate-200 hover:border-pink-300'}`}
                    onClick={() => updateField('protocol', p.id)}
                  >
                    <p className="font-bold text-slate-800">{p.label}</p>
                    <p className="text-sm text-slate-500">{p.desc}</p>
                  </div>
                ))}
              </div>
              {formData.protocol === 'CUSTOM' && (
                <div className="mt-4">
                  <Label className="font-bold text-slate-700">Number of Visits</Label>
                  <Input
                    type="number"
                    value={formData.customVisits}
                    onChange={(e) => updateField('customVisits', parseInt(e.target.value))}
                    className="mt-2 w-32"
                  />
                </div>
              )}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-slate-800">Visit Schedule</h3>
              <p className="text-sm text-slate-500">
                Dates auto-populate based on LMP/EDD when a patient is registered.
              </p>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((v) => (
                  <div
                    key={v}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center"
                  >
                    <p className="font-bold text-slate-800">Visit {v}</p>
                    <p className="text-xs text-slate-500">
                      Week {v === 1 ? '12' : v === 2 ? '20' : v === 3 ? '28' : '36'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-slate-800">Supplement Protocol</h3>
              <div className="space-y-4">
                {[
                  { key: 'ifa', label: 'Iron-Folic Acid (IFA)', target: 180, unit: 'tablets' },
                  { key: 'calcium', label: 'Calcium', target: 90, unit: 'tablets' },
                  { key: 'folicAcid', label: 'Folic Acid', target: 90, unit: 'tablets' },
                  { key: 'tt', label: 'TT Vaccination', target: 2, unit: 'doses' },
                ].map((supp) => (
                  <div
                    key={supp.key}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <Pill className="w-5 h-5 text-pink-600" />
                      <div>
                        <p className="font-bold text-slate-800">{supp.label}</p>
                        <p className="text-xs text-slate-500">
                          {supp.target} {supp.unit} total
                        </p>
                      </div>
                    </div>
                    <Checkbox
                      checked={(formData.supplements as Record<string, boolean>)[supp.key]}
                      onCheckedChange={(checked) =>
                        updateField('supplements', {
                          ...formData.supplements,
                          [supp.key]: !!checked,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-slate-800">Lab Investigation Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'hbEveryVisit', label: 'Hemoglobin (every visit)' },
                  { key: 'vdrlOnce', label: 'VDRL (1st visit)' },
                  { key: 'hivOnce', label: 'HIV (1st visit)' },
                  { key: 'dipsiGdm', label: 'DIPSI GDM (24-28w)' },
                ].map((lab) => (
                  <div
                    key={lab.key}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <Checkbox
                      checked={(formData.labs as Record<string, boolean>)[lab.key]}
                      onCheckedChange={(checked) =>
                        updateField('labs', { ...formData.labs, [lab.key]: !!checked })
                      }
                    />
                    <span className="text-sm font-medium text-slate-700">{lab.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-slate-800">High-Risk Auto-Flagging Rules</h3>
              <div className="space-y-3">
                {[
                  { key: 'age', label: 'Age <18 or >35 years' },
                  { key: 'height', label: 'Height <145 cm' },
                  { key: 'bmi', label: 'BMI <18.5 or >30' },
                  { key: 'gravida', label: 'Gravida >=4' },
                  { key: 'previousComplications', label: 'Previous C-section / PPH / Eclampsia' },
                  { key: 'rhNegative', label: 'Rh-negative without anti-D' },
                ].map((rule) => (
                  <div
                    key={rule.key}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <Checkbox
                      checked={(formData.highRiskRules as Record<string, boolean>)[rule.key]}
                      onCheckedChange={(checked) =>
                        updateField('highRiskRules', {
                          ...formData.highRiskRules,
                          [rule.key]: !!checked,
                        })
                      }
                    />
                    <span className="text-sm font-medium text-slate-700">{rule.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-slate-800">ASHA Worker Assignment</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl border-2 border-pink-200">
                  <Users className="w-6 h-6 text-pink-600" />
                  <div>
                    <p className="font-bold text-slate-800">Auto-assign by Pincode / Village</p>
                    <p className="text-sm text-slate-500">
                      Link ASHA workers to patients based on address
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-slate-800">Government Scheme Enrollment</h3>
              <div className="space-y-4">
                {[
                  {
                    key: 'jsy',
                    label: 'Janani Suraksha Yojana (JSY)',
                    desc: 'Cash incentive for institutional delivery',
                  },
                  { key: 'pmmvy', label: 'PMMVY', desc: 'Maternity benefit of Rs. 5,000' },
                ].map((scheme) => (
                  <div
                    key={scheme.key}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-pink-600" />
                      <div>
                        <p className="font-bold text-slate-800">{scheme.label}</p>
                        <p className="text-xs text-slate-500">{scheme.desc}</p>
                      </div>
                    </div>
                    <Checkbox
                      checked={(formData.schemes as Record<string, boolean>)[scheme.key]}
                      onCheckedChange={(checked) =>
                        updateField('schemes', { ...formData.schemes, [scheme.key]: !!checked })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-slate-800">Notification Templates</h3>
              <div className="space-y-4">
                <div>
                  <Label className="font-bold text-slate-700">Default Language</Label>
                  <select
                    className="mt-2 w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium"
                    value={formData.notificationLanguage}
                    onChange={(e) => updateField('notificationLanguage', e.target.value)}
                  >
                    <option value="hi">Hindi</option>
                    <option value="bho">Bhojpuri</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-800 mb-2">Sample Reminder (Hindi)</p>
                  <p className="text-sm text-slate-500 italic">
                    Namaste name, aapki agli chek-up date ko hai. Kripya time par aayen.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 8 && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-slate-800">Print Templates</h3>
              <div className="space-y-4">
                {[
                  { label: 'MCP Card Summary', desc: '80mm thermal receipt printer' },
                  { label: 'Referral Slip', desc: 'A4 + 80mm thermal' },
                ].map((p) => (
                  <div
                    key={p.label}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <Printer className="w-5 h-5 text-pink-600" />
                      <div>
                        <p className="font-bold text-slate-800">{p.label}</p>
                        <p className="text-xs text-slate-500">{p.desc}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Default</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 9 && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Baby className="w-10 h-10 text-pink-600" />
              </div>
              <h3 className="font-bold text-2xl text-slate-800">Ready to Activate</h3>
              <p className="text-slate-500">
                Your ANC protocol is configured. Click activate to generate care plans for all
                registered patients.
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-6">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <p className="font-bold text-slate-800">
                    {formData.protocol === 'WHO_4' ? '4' : formData.customVisits} Visits
                  </p>
                  <p className="text-xs text-slate-500">Scheduled</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <p className="font-bold text-slate-800">
                    {Object.values(formData.supplements).filter(Boolean).length} Supplements
                  </p>
                  <p className="text-xs text-slate-500">Tracked</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="rounded-xl font-bold"
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Previous
        </Button>
        <div className="flex gap-2">
          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={nextStep}
              className="bg-pink-600 hover:bg-pink-700 rounded-xl font-bold"
            >
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => alert('ANC Protocol Activated!')}
              className="bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold"
            >
              <Rocket className="w-4 h-4 mr-2" /> Activate Protocol
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

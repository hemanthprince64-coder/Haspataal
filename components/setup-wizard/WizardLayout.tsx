import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Step1Specialities } from './Step1Specialities';
import { Step2Doctors } from './Step2Doctors';
import { Step3Beds } from './Step3Beds';
import { Step4OPDTimings } from './Step4OPDTimings';
import { Step5Pricing } from './Step5Pricing';
import { Step6Review } from './Step6Review';
import { Trophy } from 'lucide-react';

export function WizardLayout() {
  const [step, setStep] = useState(1);
  const [pct, setPct] = useState(0);
  const [config, setConfig] = useState<any>({
    specialities: [],
    doctors: [],
    bed_counts: { general: 0, icu: 0, private: 0, semi: 0 },
    opd_timings: {},
    pricing: { opd_fees: 0, ipd_rate: 0, diag_markup: 0 }
  });
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    // Load existing config on mount (save & resume)
    fetch('/api/setup/config')
      .then(res => res.json())
      .then(data => {
        if (data && data.config) {
          setConfig((prev: any) => ({ ...prev, ...data.config }));
          setPct(data.pct || 0);
          // Auto-resume to correct step based on pct
          if (data.pct < 100) {
            setStep(Math.floor(data.pct / 16.6) + 1);
          } else {
            setActivated(true);
          }
        }
      });
  }, []);

  const handleSaveStep = async (stepNumber: number, partialConfig: any) => {
    const newConfig = { ...config, ...partialConfig };
    setConfig(newConfig);
    
    // Save partial config
    await fetch('/api/setup/partial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: stepNumber, config: newConfig })
    });
    
    setPct(Math.min(stepNumber * 16.6, 99));
    setStep(stepNumber + 1);
  };

  const handleActivate = async () => {
    await fetch('/api/setup/activate', { method: 'POST' });
    setPct(100);
    setActivated(true);
    setTimeout(() => {
      window.location.href = '/hms/dashboard';
    }, 3000);
  };

  if (activated) {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
        <div className="animate-bounce mb-6">
          <Trophy className="w-24 h-24 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold text-green-800">Hospital Activated!</h1>
        <p className="text-green-600 mt-2">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-xl border-0">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-1/4 bg-slate-100 p-6 border-r border-slate-200">
            <h2 className="font-bold text-lg mb-6">Setup Progress</h2>
            
            {/* Progress Ring */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="text-slate-200"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-600 transition-all duration-500"
                  strokeDasharray={`${pct}, 100`}
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold text-xl">
                {Math.round(pct)}%
              </div>
            </div>

            <ul className="space-y-4 text-sm font-medium text-slate-500">
              <li className={step === 1 ? 'text-blue-600' : ''}>1. Specialities</li>
              <li className={step === 2 ? 'text-blue-600' : ''}>2. Doctors</li>
              <li className={step === 3 ? 'text-blue-600' : ''}>3. Beds & Wards</li>
              <li className={step === 4 ? 'text-blue-600' : ''}>4. OPD Timings</li>
              <li className={step === 5 ? 'text-blue-600' : ''}>5. Pricing</li>
              <li className={step === 6 ? 'text-blue-600' : ''}>6. Review & Go Live</li>
            </ul>
          </div>

          {/* Main Content */}
          <CardContent className="w-3/4 p-8">
            {step === 1 && <Step1Specialities config={config} onSave={(data) => handleSaveStep(1, { specialities: data })} />}
            {step === 2 && <Step2Doctors config={config} onSave={(data) => handleSaveStep(2, { doctors: data })} />}
            {step === 3 && <Step3Beds config={config} onSave={(data) => handleSaveStep(3, { bed_counts: data })} />}
            {step === 4 && <Step4OPDTimings config={config} onSave={(data) => handleSaveStep(4, { opd_timings: data })} />}
            {step === 5 && <Step5Pricing config={config} onSave={(data) => handleSaveStep(5, { pricing: data })} />}
            {step === 6 && <Step6Review config={config} onActivate={handleActivate} />}
          </CardContent>
        </div>
      </Card>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DocumentUpload } from './DocumentUpload';
import { ChecklistWidget } from './ChecklistWidget';

export function OnboardingStepper() {
  const [step, setStep] = useState(0); // 0: Checklist, 1: Basics, 2: Rep, 3: Docs, 4: Login
  const [formData, setFormData] = useState({
    hospitalName: '', city: '', type: 'clinic',
    repName: '', repPhone: '',
    email: '', password: ''
  });
  const [hospitalId, setHospitalId] = useState<string | null>(null);

  // Auto-save draft on blur
  const handleBlur = () => {
    localStorage.setItem('haspataal_onboarding_draft', JSON.stringify({ step, formData }));
  };

  useEffect(() => {
    const draft = localStorage.getItem('haspataal_onboarding_draft');
    if (draft) {
      const parsed = JSON.parse(draft);
      setStep(parsed.step);
      setFormData(parsed.formData);
    }
  }, []);

  const handleNext = async () => {
    if (step === 4) {
      // Final Submit -> POST /hospitals/register
      // This triggers hospital_registered event in backend
      const res = await fetch('/api/hospitals/register', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setHospitalId(data.hospital_id);
      window.location.href = `/verification-pending?id=${data.hospital_id}`;
      return;
    }
    setStep(s => s + 1);
    handleBlur();
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <ChecklistWidget />
            <Button className="w-full" onClick={handleNext}>I have these ready</Button>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Hospital Basics</h2>
            <div className="space-y-2">
              <Label>Hospital Name</Label>
              <Input 
                value={formData.hospitalName} 
                onChange={e => setFormData({ ...formData, hospitalName: e.target.value })}
                onBlur={handleBlur}
                placeholder="City Hospital"
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input 
                value={formData.city} 
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                onBlur={handleBlur}
              />
            </div>
            <Button className="w-full mt-6" onClick={handleNext}>Next: Representative Details</Button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Representative Details</h2>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input 
                value={formData.repName} 
                onChange={e => setFormData({ ...formData, repName: e.target.value })}
                onBlur={handleBlur}
              />
            </div>
            <div className="space-y-2">
              <Label>Mobile Number</Label>
              <Input 
                type="tel"
                value={formData.repPhone} 
                onChange={e => setFormData({ ...formData, repPhone: e.target.value })}
                onBlur={handleBlur}
                placeholder="+91"
              />
            </div>
            <Button className="w-full mt-6" onClick={handleNext}>Next: Documents</Button>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Required Documents</h2>
            <DocumentUpload hospitalId="draft" docType="license" label="Hospital License" onUploadSuccess={() => {}} />
            <DocumentUpload hospitalId="draft" docType="gst" label="GST Certificate (Optional)" onUploadSuccess={() => {}} />
            <Button className="w-full mt-6" onClick={handleNext}>Next: Create Login</Button>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Create Admin Login</h2>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                type="email"
                value={formData.email} 
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                onBlur={handleBlur}
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input 
                type="password"
                value={formData.password} 
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                onBlur={handleBlur}
              />
            </div>
            <Button className="w-full mt-6" onClick={handleNext}>Complete Registration</Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardContent className="p-6">
          {step > 0 && (
            <div className="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-300" 
                style={{ width: `${(step / 4) * 100}%` }} 
              />
            </div>
          )}
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
}

/* eslint-disable */
import {
  Plus,
  Thermometer,
  HeartPulse,
  Activity,
  Droplets,
  Wind,
  Ruler,
  Weight,
} from 'lucide-react';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface VitalsFormProps {
  patientId: string;
  visitId?: string;
  onSaved?: (vital: any) => void;
}

export function VitalsForm({ patientId, visitId, onSaved }: VitalsFormProps) {
  const [formData, setFormData] = useState({
    temperature: '',
    pulse: '',
    bloodPressure: '',
    respiratoryRate: '',
    spo2: '',
    height: '',
    weight: '',
    bloodSugar: '',
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!patientId) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/clinical/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          visitId,
          temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
          pulse: formData.pulse ? parseInt(formData.pulse) : undefined,
          bloodPressure: formData.bloodPressure,
          respiratoryRate: formData.respiratoryRate
            ? parseInt(formData.respiratoryRate)
            : undefined,
          spo2: formData.spo2 ? parseFloat(formData.spo2) : undefined,
          height: formData.height ? parseFloat(formData.height) : undefined,
          weight: formData.weight ? parseFloat(formData.weight) : undefined,
          bloodSugar: formData.bloodSugar ? parseFloat(formData.bloodSugar) : undefined,
          notes: formData.notes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onSaved?.(data.vital);
        setFormData({
          temperature: '',
          pulse: '',
          bloodPressure: '',
          respiratoryRate: '',
          spo2: '',
          height: '',
          weight: '',
          bloodSugar: '',
          notes: '',
        });
      }
    } catch (err) {
      console.error('Failed to save vitals:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const bmi =
    formData.weight && formData.height
      ? (parseFloat(formData.weight) / Math.pow(parseFloat(formData.height) / 100, 2)).toFixed(1)
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Vitals Recording
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="temperature" className="flex items-center gap-1 text-xs">
              <Thermometer className="w-3 h-3" /> Temperature (°F)
            </Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              placeholder="102.4"
              value={formData.temperature}
              onChange={(e) => handleChange('temperature', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pulse" className="flex items-center gap-1 text-xs">
              <HeartPulse className="w-3 h-3" /> Pulse (/min)
            </Label>
            <Input
              id="pulse"
              type="number"
              placeholder="110"
              value={formData.pulse}
              onChange={(e) => handleChange('pulse', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bloodPressure" className="flex items-center gap-1 text-xs">
              <HeartPulse className="w-3 h-3" /> BP (mmHg)
            </Label>
            <Input
              id="bloodPressure"
              placeholder="120/80"
              value={formData.bloodPressure}
              onChange={(e) => handleChange('bloodPressure', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="respiratoryRate" className="flex items-center gap-1 text-xs">
              <Wind className="w-3 h-3" /> RR (/min)
            </Label>
            <Input
              id="respiratoryRate"
              type="number"
              placeholder="18"
              value={formData.respiratoryRate}
              onChange={(e) => handleChange('respiratoryRate', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spo2" className="flex items-center gap-1 text-xs">
              <Droplets className="w-3 h-3" /> SpO2 (%)
            </Label>
            <Input
              id="spo2"
              type="number"
              step="0.1"
              placeholder="98"
              value={formData.spo2}
              onChange={(e) => handleChange('spo2', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height" className="flex items-center gap-1 text-xs">
              <Ruler className="w-3 h-3" /> Height (cm)
            </Label>
            <Input
              id="height"
              type="number"
              placeholder="175"
              value={formData.height}
              onChange={(e) => handleChange('height', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight" className="flex items-center gap-1 text-xs">
              <Weight className="w-3 h-3" /> Weight (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="70"
              value={formData.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bloodSugar" className="flex items-center gap-1 text-xs">
              <Droplets className="w-3 h-3" /> Blood Sugar (mg/dL)
            </Label>
            <Input
              id="bloodSugar"
              type="number"
              placeholder="120"
              value={formData.bloodSugar}
              onChange={(e) => handleChange('bloodSugar', e.target.value)}
            />
          </div>
          {bmi && (
            <div className="space-y-2">
              <Label className="text-xs">BMI</Label>
              <div className="px-3 py-2 bg-slate-50 rounded-md">
                <span className="font-bold">{bmi}</span>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-xs">
            Notes
          </Label>
          <Textarea
            id="notes"
            placeholder="Any additional observations..."
            rows={2}
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
          />
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Record Vitals'}
        </Button>
      </CardContent>
    </Card>
  );
}

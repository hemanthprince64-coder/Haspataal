/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, BedDouble } from 'lucide-react';
import { toast } from 'sonner';

export function Step3Beds({ config, onSave }: { config: any; onSave: (data: any) => void }) {
  const [beds, setBeds] = useState<{ general: number; icu: number; private: number; semi: number }>(
    config.bed_counts || {
      general: 0,
      icu: 0,
      private: 0,
      semi: 0,
    },
  );

  // Generate unique IDs for inputs
  const idGeneral = React.useId();
  const idIcu = React.useId();
  const idPrivate = React.useId();
  const idSemi = React.useId();

  // Apply smart defaults if user hasn't entered anything
  useEffect(() => {
    setBeds((prev) => {
      if (Object.values(prev).every((v) => v === 0)) {
        return { general: 20, icu: 5, private: 5, semi: 10 };
      }
      return prev;
    });
  }, []);

  const handleChange = (field: 'general' | 'icu' | 'private' | 'semi', value: string) => {
    const num = parseInt(value, 10);
    setBeds((prev) => ({ ...prev, [field]: isNaN(num) ? 0 : Math.max(0, num) }));
  };

  const totalBeds: number = Object.values(beds).reduce(
    (acc, curr) => acc + (typeof curr === 'number' ? curr : 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold">Beds & Wards</h2>
          <p className="text-slate-500">Define your inpatient capacity.</p>
        </div>
        <div className="flex items-center text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
          <Clock className="w-3 h-3 mr-1" /> ~1 min
        </div>
      </div>

      <div
        className="bg-blue-50 text-blue-800 p-4 rounded-lg flex justify-between items-center font-semibold"
        aria-live="polite"
      >
        <span>Total Hospital Bed Capacity:</span>
        <span className="text-2xl">{totalBeds} Beds</span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor={idGeneral}>General Ward Beds</Label>
          <Input
            id={idGeneral}
            type="number"
            value={beds.general}
            onChange={(e) => handleChange('general', e.target.value)}
            aria-describedby="general-help"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={idIcu}>ICU / NICU Beds</Label>
          <Input
            id={idIcu}
            type="number"
            value={beds.icu}
            onChange={(e) => handleChange('icu', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={idPrivate}>Private Rooms</Label>
          <Input
            id={idPrivate}
            type="number"
            value={beds.private}
            onChange={(e) => handleChange('private', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={idSemi}>Semi-Private Beds</Label>
          <Input
            id={idSemi}
            type="number"
            value={beds.semi}
            onChange={(e) => handleChange('semi', e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          onClick={() => {
            onSave(beds);
            toast.success('Bed capacity saved successfully');
          }}
        >
          Save & Continue
        </Button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';

export function Step3Beds({ config, onSave }: { config: any, onSave: (data: any) => void }) {
  const [beds, setBeds] = useState(config.bed_counts || {
    general: 0, icu: 0, private: 0, semi: 0
  });

  useEffect(() => {
    if (Object.values(beds).every(v => v === 0)) {
      // Smart Defaults for a mid-size setup
      setBeds({ general: 20, icu: 5, private: 5, semi: 10 });
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    const num = parseInt(value, 10);
    setBeds({ ...beds, [field]: isNaN(num) ? 0 : Math.max(0, num) });
  };

  const totalBeds = Object.values(beds).reduce((acc: number, curr: number) => acc + curr, 0);

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

      <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex justify-between items-center font-semibold">
        <span>Total Hospital Bed Capacity:</span>
        <span className="text-2xl">{totalBeds} Beds</span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>General Ward Beds</Label>
          <Input 
            type="number" 
            value={beds.general} 
            onChange={(e) => handleChange('general', e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <Label>ICU / NICU Beds</Label>
          <Input 
            type="number" 
            value={beds.icu} 
            onChange={(e) => handleChange('icu', e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <Label>Private Rooms</Label>
          <Input 
            type="number" 
            value={beds.private} 
            onChange={(e) => handleChange('private', e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <Label>Semi-Private Beds</Label>
          <Input 
            type="number" 
            value={beds.semi} 
            onChange={(e) => handleChange('semi', e.target.value)} 
          />
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button onClick={() => onSave(beds)}>
          Save & Continue
        </Button>
      </div>
    </div>
  );
}

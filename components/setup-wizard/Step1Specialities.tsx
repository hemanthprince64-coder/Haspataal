import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

const SPECIALITIES_LIST = [
  'General Medicine', 'Orthopedics', 'Cardiology', 'Gynecology', 
  'Pediatrics', 'ENT', 'Dermatology', 'Neurology', 'Oncology'
];

export function Step1Specialities({ config, onSave }: { config: any, onSave: (data: any) => void }) {
  const [selected, setSelected] = useState<string[]>(config.specialities || []);

  useEffect(() => {
    // Smart Defaults (assuming Phase 2 saved it as a general hospital)
    if (selected.length === 0) {
      setSelected(['General Medicine', 'Orthopedics', 'Gynecology', 'Pediatrics']);
    }
  }, []);

  const toggleSpec = (spec: string) => {
    setSelected(prev => 
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold">Select Specialities</h2>
          <p className="text-slate-500">What services does your hospital offer?</p>
        </div>
        <div className="flex items-center text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
          <Clock className="w-3 h-3 mr-1" /> ~1 min
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {SPECIALITIES_LIST.map(spec => (
          <div 
            key={spec}
            onClick={() => toggleSpec(spec)}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${selected.includes(spec) ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium' : 'border-slate-200 hover:border-blue-300'}`}
          >
            {spec}
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-6">
        <Button onClick={() => onSave(selected)} disabled={selected.length === 0}>
          Save & Continue
        </Button>
      </div>
    </div>
  );
}
